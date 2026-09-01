using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Vitrine.Application.Abstractions;
using Vitrine.Domain.Branding;
using Vitrine.Domain.Catalog;
using Vitrine.Domain.Common;
using Vitrine.Domain.Identity;
using Vitrine.Domain.Offers;

namespace Vitrine.Infrastructure.Persistence;

/// <summary>
/// Idempotent seed for the demo florist brand: brand/theme tokens, categories, products,
/// one active offer and the admin user. Safe to run on every startup.
/// </summary>
public sealed class DatabaseSeeder
{
    private readonly VitrineDbContext _db;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IConfiguration _configuration;

    public DatabaseSeeder(VitrineDbContext db, IPasswordHasher passwordHasher, IConfiguration configuration)
    {
        _db = db;
        _passwordHasher = passwordHasher;
        _configuration = configuration;
    }

    public async Task SeedAsync(CancellationToken ct = default)
    {
        await SeedBrandSettingsAsync(ct);
        var categories = await SeedCategoriesAsync(ct);
        await SeedProductsAndOfferAsync(categories, ct);
        await SeedAdminUserAsync(ct);
        await _db.SaveChangesAsync(ct);
    }

    private async Task SeedBrandSettingsAsync(CancellationToken ct)
    {
        if (await _db.BrandSettings.AnyAsync(ct))
        {
            return;
        }

        // Florist demo palette (light theme). Keys map to CSS custom properties --color-<key>.
        var tokens = new Dictionary<string, string>
        {
            ["surface"] = "#faf7f5",
            ["surface-2"] = "#f2ebe7",
            ["muted"] = "#dbd4d1",
            ["fg"] = "#2c2724",
            ["fg-muted"] = "#6b615c",
            ["primary"] = "#f099be",
            ["primary-strong"] = "#c85688",
            ["primary-fg"] = "#2c2724",
            ["accent"] = "#8da33c",
            ["accent-strong"] = "#5f7029",
            ["accent-fg"] = "#ffffff",
            ["ring"] = "#c85688"
        };

        var settings = new BrandSettings(
            brandName: "Floristería Vitrine",
            logoUrl: string.Empty,
            whatsappNumber: "50400000000",
            defaultLocale: "es",
            themeTokens: tokens,
            heroTitle: "Flores que hablan por vos",
            heroSubtitle: "Ramos y arreglos para cada ocasión",
            heroImageUrl: LoremFlickr(1200, 500, "flowers,shop", lockId: 100),
            vibe: "playful");

        await _db.BrandSettings.AddAsync(settings, ct);
    }

    private async Task<Dictionary<string, Category>> SeedCategoriesAsync(CancellationToken ct)
    {
        if (await _db.Categories.AnyAsync(ct))
        {
            return await _db.Categories.ToDictionaryAsync(c => c.Slug, c => c, ct);
        }

        var categories = new List<Category>
        {
            new(Guid.NewGuid(), "Ramos", "ramos"),
            new(Guid.NewGuid(), "Arreglos", "arreglos"),
            new(Guid.NewGuid(), "Plantas", "plantas"),
            new(Guid.NewGuid(), "Eventos", "eventos")
        };

        await _db.Categories.AddRangeAsync(categories, ct);
        return categories.ToDictionary(c => c.Slug, c => c);
    }

    private async Task SeedProductsAndOfferAsync(Dictionary<string, Category> categories, CancellationToken ct)
    {
        if (await _db.Products.AnyAsync(ct))
        {
            return;
        }

        var ramos = categories["ramos"];
        var arreglos = categories["arreglos"];
        var plantas = categories["plantas"];

        // Individual "ramos" (products) referenced by product-scoped offers below.
        var ramoPrimaveral = new Product(Guid.NewGuid(), "Ramo primaveral", "001",
            "Ramo de temporada con rosas y flores silvestres.", ramos.Id, Money.Of(850m),
            new[] { LoremFlickr(800, 1000, "bouquet,flowers", lockId: 1) },
            new[] { new ProductAttribute("Color", "Rosa"), new ProductAttribute("Tamaño", "Mediano") });
        var ramoRosasRojas = new Product(Guid.NewGuid(), "Ramo de rosas rojas", "002",
            "Doce rosas rojas clásicas para expresar amor.", ramos.Id, Money.Of(1200m),
            new[] { LoremFlickr(800, 1000, "roses,red", lockId: 2) },
            new[] { new ProductAttribute("Color", "Rojo"), new ProductAttribute("Cantidad", "12 rosas") });

        var products = new List<Product>
        {
            ramoPrimaveral,
            ramoRosasRojas,
            new(Guid.NewGuid(), "Arreglo en caja", "003",
                "Arreglo floral en caja de regalo elegante.", arreglos.Id, Money.Of(1500m),
                new[] { LoremFlickr(800, 1000, "flowers,box", lockId: 3) },
                new[] { new ProductAttribute("Estilo", "Caja"), new ProductAttribute("Ocasión", "Cumpleaños") }),
            new(Guid.NewGuid(), "Suculenta decorativa", "004",
                "Planta suculenta en maceta de cerámica.", plantas.Id, Money.Of(450m),
                new[] { LoremFlickr(800, 1000, "succulent,plant", lockId: 4) },
                new[] { new ProductAttribute("Tipo", "Suculenta"), new ProductAttribute("Maceta", "Cerámica") })
        };

        await _db.Products.AddRangeAsync(products, ct);

        if (!await _db.Offers.AnyAsync(ct))
        {
            var now = DateTimeOffset.UtcNow;

            // Category-scoped: whole "Ramos" and "Arreglos" categories.
            var seasonal = new Offer(
                Guid.NewGuid(),
                "Primavera en flor",
                DiscountType.Percentage,
                15m,
                categoryIds: new[] { ramos.Id, arreglos.Id },
                productIds: Array.Empty<Guid>(),
                now.AddDays(-1),
                now.AddDays(30),
                isActive: true,
                iconName: "flower",
                bannerTitle: "¡Primavera en flor!",
                bannerSubtitle: "15% de descuento en ramos y arreglos",
                bannerBackgroundColor: "#f099be",
                bannerImageUrl: LoremFlickr(1200, 400, "spring,flowers", lockId: 200),
                // A small image tiled as a translucent pattern behind the detail page.
                detailBackgroundImageUrl: LoremFlickr(160, 160, "flower,petals", lockId: 300),
                detailBackgroundImageOpacity: 0.12);

            // Product-scoped ("ramos concretos"): a stronger discount on two specific bouquets.
            var bouquetDeal = new Offer(
                Guid.NewGuid(),
                "Rosas de la semana",
                DiscountType.FixedAmount,
                200m,
                categoryIds: Array.Empty<Guid>(),
                productIds: new[] { ramoPrimaveral.Id, ramoRosasRojas.Id },
                now.AddDays(-1),
                now.AddDays(14),
                isActive: true,
                iconName: "heart",
                bannerTitle: "Rosas de la semana",
                bannerSubtitle: "L 200 de descuento en ramos seleccionados",
                bannerBackgroundColor: "#c85688",
                bannerImageUrl: LoremFlickr(1200, 400, "roses,bouquet", lockId: 201),
                detailBackgroundImageUrl: LoremFlickr(160, 160, "roses,pattern", lockId: 301),
                detailBackgroundImageOpacity: 0.12);

            await _db.Offers.AddRangeAsync(new[] { seasonal, bouquetDeal }, ct);
        }
    }

    /// <summary>
    /// Builds a LoremFlickr image URL. A per-record <paramref name="lockId"/> (as ?lock=)
    /// keeps the image stable while forcing a different photo per record, so lists don't
    /// show the same cached image repeated.
    /// </summary>
    private static string LoremFlickr(int width, int height, string keyword, int lockId) =>
        $"https://loremflickr.com/{width}/{height}/{keyword}?lock={lockId}";

    private async Task SeedAdminUserAsync(CancellationToken ct)
    {
        if (await _db.AdminUsers.AnyAsync(ct))
        {
            return;
        }

        var username = _configuration["Admin:Username"] ?? "admin";
        var password = _configuration["Admin:Password"] ?? "Admin123!";

        var admin = new AdminUser(Guid.NewGuid(), username, _passwordHasher.Hash(password));
        await _db.AdminUsers.AddAsync(admin, ct);
    }
}
