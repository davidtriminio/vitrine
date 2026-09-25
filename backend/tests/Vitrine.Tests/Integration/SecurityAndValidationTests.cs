using System.Net;
using System.Net.Http.Headers;
using System.Net.Http.Json;
using FluentAssertions;
using Vitrine.Application.Catalog;
using Vitrine.Application.Identity;
using Xunit;

namespace Vitrine.Tests.Integration;

public sealed class SecurityAndValidationTests : IClassFixture<VitrineApiFactory>
{
    private readonly VitrineApiFactory _factory;

    public SecurityAndValidationTests(VitrineApiFactory factory) => _factory = factory;

    private async Task<HttpClient> AuthenticatedClientAsync(string password = "Admin123!")
    {
        var client = _factory.CreateClient();
        var response = await client.PostAsJsonAsync("/api/v1/auth/login", new LoginRequest("admin", password));
        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        client.DefaultRequestHeaders.Authorization = new AuthenticationHeaderValue("Bearer", auth!.Token);
        return client;
    }

    [Fact]
    public async Task Responses_IncludeSecurityHeaders()
    {
        var response = await _factory.CreateClient().GetAsync("/api/v1/products");

        response.Headers.GetValues("X-Content-Type-Options").Should().Contain("nosniff");
        response.Headers.GetValues("X-Frame-Options").Should().Contain("DENY");
    }

    [Fact]
    public async Task ChangePassword_WithoutToken_IsUnauthorized()
    {
        var response = await _factory.CreateClient().PostAsJsonAsync("/api/v1/auth/change-password",
            new ChangePasswordRequest("Admin123!", "NewPassword1"));

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task ChangePassword_WithWrongCurrent_ReturnsBadRequest()
    {
        var client = await AuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/v1/auth/change-password",
            new ChangePasswordRequest("wrong-password", "NewPassword1"));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task ChangePassword_WithWeakNewPassword_ReturnsBadRequest()
    {
        var client = await AuthenticatedClientAsync();

        var response = await client.PostAsJsonAsync("/api/v1/auth/change-password",
            new ChangePasswordRequest("Admin123!", "short"));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }

    [Fact]
    public async Task CreateProduct_MissingRequiredValues_ReturnsBadRequest()
    {
        var client = await AuthenticatedClientAsync();
        var categories = await client.GetFromJsonAsync<List<CategoryResponse>>("/api/v1/categories");

        var response = await client.PostAsJsonAsync("/api/v1/products",
            new CreateProductRequest("Rose", "900", string.Empty, categories![0].Id, 0m, null, null));

        response.StatusCode.Should().Be(HttpStatusCode.BadRequest);
    }
}
