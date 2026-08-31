using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Vitrine.Application.Abstractions;
using Vitrine.Infrastructure.Auth;
using Vitrine.Infrastructure.Persistence;
using Vitrine.Infrastructure.Services;

namespace Vitrine.Infrastructure;

public static class DependencyInjection
{
    /// <summary>Registers EF Core (provider chosen by config), repositories and infra services.</summary>
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var provider = configuration["Database:Provider"] ?? "Sqlite";
        var connectionString = configuration["ConnectionStrings:Default"];

        services.AddDbContext<VitrineDbContext>(options =>
        {
            if (string.Equals(provider, "Postgres", StringComparison.OrdinalIgnoreCase))
            {
                options.UseNpgsql(connectionString);
            }
            else
            {
                options.UseSqlite(connectionString ?? "Data Source=vitrine.db");
            }
        });

        services.Configure<JwtOptions>(configuration.GetSection(JwtOptions.SectionName));

        services.AddScoped<IProductRepository, ProductRepository>();
        services.AddScoped<ICategoryRepository, CategoryRepository>();
        services.AddScoped<IOfferRepository, OfferRepository>();
        services.AddScoped<IBrandSettingsRepository, BrandSettingsRepository>();
        services.AddScoped<IAdminUserRepository, AdminUserRepository>();
        services.AddScoped<IUnitOfWork, UnitOfWork>();

        services.AddSingleton<IClock, SystemClock>();
        services.AddSingleton<IPasswordHasher, BCryptPasswordHasher>();
        services.AddScoped<IJwtIssuer, JwtIssuer>();

        services.AddScoped<DatabaseSeeder>();

        return services;
    }
}
