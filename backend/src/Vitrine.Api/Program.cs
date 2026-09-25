using Microsoft.AspNetCore.HttpOverrides;
using System.Net;
using System.Threading.RateLimiting;
using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.FileProviders;
using Microsoft.Extensions.Options;
using Microsoft.IdentityModel.Tokens;
using Vitrine.Api.Errors;
using Vitrine.Api.Storage;
using Vitrine.Application;
using Vitrine.Infrastructure;
using Vitrine.Infrastructure.Auth;
using Vitrine.Infrastructure.Persistence;

var builder = WebApplication.CreateBuilder(args);

builder.Services.Configure<ForwardedHeadersOptions>(options =>
{
    options.ForwardedHeaders =
        ForwardedHeaders.XForwardedFor | ForwardedHeaders.XForwardedProto;

    // Apache corre en la misma máquina y habla por loopback.
    options.KnownProxies.Add(IPAddress.Loopback);        // 127.0.0.1
    options.KnownProxies.Add(IPAddress.IPv6Loopback);    // ::1
});

const string CorsPolicy = "VitrineCors";

// Resolve uploads directory: configurable absolute path in production
// (outside the app dir, writable under ProtectSystem=strict), falls back
// to wwwroot/uploads for local development.
var uploadsPath = builder.Configuration["Storage:UploadsPath"];
if (string.IsNullOrWhiteSpace(uploadsPath))
{
    uploadsPath = Path.Combine(builder.Environment.ContentRootPath, "wwwroot", "uploads");
}
Directory.CreateDirectory(uploadsPath);

builder.Services
    .AddControllers()
    .AddJsonOptions(options =>
    {
        // Serialize enums as strings; the frontend contract uses named values.
        options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
    });

builder.Services.AddOpenApi();

// RFC 7807 error contract.
builder.Services.AddProblemDetails();
builder.Services.AddExceptionHandler<GlobalExceptionHandler>();

builder.Services.AddApplication();
builder.Services.AddInfrastructure(builder.Configuration);
builder.Services.AddSingleton<Vitrine.Application.Abstractions.IImageStorage>(
    new LocalImageStorage(uploadsPath));

// ---- Authentication / Authorization ----
// Configure JwtBearer through the options pipeline so JwtOptions is resolved at runtime
// (after configuration is fully built), keeping it correct under test host overrides too.
builder.Services
    .AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer();

builder.Services
    .AddOptions<JwtBearerOptions>(JwtBearerDefaults.AuthenticationScheme)
    .Configure<IOptions<JwtOptions>>((bearer, jwtAccessor) =>
    {
        var jwt = jwtAccessor.Value;
        bearer.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuer = true,
            ValidIssuer = jwt.Issuer,
            ValidateAudience = true,
            ValidAudience = jwt.Audience,
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwt.Key)),
            ValidateLifetime = true,
            ClockSkew = TimeSpan.FromMinutes(1)
        };
    });

builder.Services.AddAuthorization();

// ---- Abuse protection: per-IP rate limits (stricter on auth endpoints) ----
builder.Services.AddRateLimiter(options =>
{
    options.RejectionStatusCode = StatusCodes.Status429TooManyRequests;

    static string ClientKey(HttpContext context) =>
        context.Connection.RemoteIpAddress?.ToString() ?? "unknown";

    options.GlobalLimiter = PartitionedRateLimiter.Create<HttpContext, string>(context =>
        RateLimitPartition.GetFixedWindowLimiter(ClientKey(context), _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 300,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        }));

    options.AddPolicy("auth", context =>
        RateLimitPartition.GetFixedWindowLimiter(ClientKey(context), _ => new FixedWindowRateLimiterOptions
        {
            PermitLimit = 10,
            Window = TimeSpan.FromMinutes(1),
            QueueLimit = 0
        }));
});

// Cap request bodies (uploads are limited to 5 MB in the controller).
builder.WebHost.ConfigureKestrel(kestrel =>
{
    kestrel.AddServerHeader = false;
    kestrel.Limits.MaxRequestBodySize = 6 * 1024 * 1024;
});

// ---- CORS (frontend origins from config) ----
var corsOrigins = builder.Configuration.GetSection("Cors:Origins").Get<string[]>()
    ?? new[] { "http://localhost:4200" };

builder.Services.AddCors(options =>
{
    options.AddPolicy(CorsPolicy, policy => policy
        .WithOrigins(corsOrigins)
        .WithHeaders("Authorization", "Content-Type", "Accept")
        .WithMethods("GET", "POST", "PUT", "DELETE", "OPTIONS"));
});

var app = builder.Build();

// Fail fast on a weak/missing signing key outside Development/Testing.
if (!app.Environment.IsDevelopment() && !app.Environment.IsEnvironment("Testing"))
{
    var signingKey = app.Configuration["Jwt:Key"];
    if (string.IsNullOrWhiteSpace(signingKey) || signingKey.Length < 32)
    {
        throw new InvalidOperationException("Jwt:Key must be configured with at least 32 characters.");
    }
}

app.UseForwardedHeaders();

// Security response headers (API returns JSON/images only, so the CSP is locked down).
app.Use(async (context, next) =>
{
    var headers = context.Response.Headers;
    headers["X-Content-Type-Options"] = "nosniff";
    headers["X-Frame-Options"] = "DENY";
    headers["Referrer-Policy"] = "no-referrer";
    headers["Permissions-Policy"] = "camera=(), microphone=(), geolocation=()";
    headers["Content-Security-Policy"] = "default-src 'none'; img-src 'self'; frame-ancestors 'none'";
    headers["Cross-Origin-Resource-Policy"] = "cross-origin"; // uploads are embedded by the SPA origin
    await next();
});

if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseExceptionHandler();

// Apply migrations and seed on startup.
using (var scope = app.Services.CreateScope())
{
    var db = scope.ServiceProvider.GetRequiredService<VitrineDbContext>();
    await db.Database.MigrateAsync();

    var seeder = scope.ServiceProvider.GetRequiredService<DatabaseSeeder>();
    await seeder.SeedAsync();
}

if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(uploadsPath),
    RequestPath = "/uploads"
});
app.UseCors(CorsPolicy);
app.UseRateLimiter();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

// Exposed for integration tests (WebApplicationFactory).
public partial class Program;
