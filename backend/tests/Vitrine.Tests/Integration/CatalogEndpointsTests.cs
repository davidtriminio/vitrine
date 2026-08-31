using System.Net;
using System.Net.Http.Json;
using FluentAssertions;
using Vitrine.Application.Branding;
using Vitrine.Application.Catalog;
using Vitrine.Application.Identity;
using Xunit;

namespace Vitrine.Tests.Integration;

public sealed class CatalogEndpointsTests : IClassFixture<VitrineApiFactory>
{
    private readonly VitrineApiFactory _factory;

    public CatalogEndpointsTests(VitrineApiFactory factory) => _factory = factory;

    [Fact]
    public async Task GetProducts_ReturnsSeededCatalog()
    {
        var client = _factory.CreateClient();

        var response = await client.GetFromJsonAsync<PagedResponse<ProductResponse>>("/api/v1/products");

        response.Should().NotBeNull();
        response!.TotalItems.Should().BeGreaterThan(0);
        response.Items.Should().OnlyContain(p => p.IsActive);
    }

    [Fact]
    public async Task GetSettings_ReturnsBrandAndThemeTokens()
    {
        var client = _factory.CreateClient();

        var settings = await client.GetFromJsonAsync<BrandSettingsResponse>("/api/v1/settings");

        settings.Should().NotBeNull();
        settings!.BrandName.Should().NotBeNullOrWhiteSpace();
        settings.ThemeTokens.Should().ContainKey("primary");
    }

    [Fact]
    public async Task CreateCategory_WithoutToken_ReturnsUnauthorized()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/categories",
            new CreateCategoryRequest("Nueva", "nueva"));

        response.StatusCode.Should().Be(HttpStatusCode.Unauthorized);
    }

    [Fact]
    public async Task Login_WithSeededAdmin_ReturnsToken()
    {
        var client = _factory.CreateClient();

        var response = await client.PostAsJsonAsync("/api/v1/auth/login",
            new LoginRequest("admin", "Admin123!"));

        response.StatusCode.Should().Be(HttpStatusCode.OK);
        var auth = await response.Content.ReadFromJsonAsync<AuthResponse>();
        auth!.Token.Should().NotBeNullOrWhiteSpace();
        auth.Role.Should().Be("Admin");
    }
}
