using System.Text.Json;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.ChangeTracking;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;
using Vitrine.Domain.Branding;
using Vitrine.Domain.Catalog;
using Vitrine.Domain.Common;
using Vitrine.Domain.Identity;
using Vitrine.Domain.Offers;

namespace Vitrine.Infrastructure.Persistence;

public sealed class VitrineDbContext : DbContext
{
    public VitrineDbContext(DbContextOptions<VitrineDbContext> options) : base(options)
    {
    }

    public DbSet<Product> Products => Set<Product>();
    public DbSet<Category> Categories => Set<Category>();
    public DbSet<Offer> Offers => Set<Offer>();
    public DbSet<BrandSettings> BrandSettings => Set<BrandSettings>();
    public DbSet<AdminUser> AdminUsers => Set<AdminUser>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        var jsonOptions = JsonSerialization.Options;

        // ---- Money <-> decimal (single-currency MVP: LPS). ----
        var moneyConverter = new ValueConverter<Money, decimal>(
            m => m.Amount,
            d => Money.Of(d));

        // Store DateTimeOffset as a sortable binary value so range comparisons
        // (offer validity) translate on SQLite; remains portable to PostgreSQL.
        var dateTimeOffsetConverter = new DateTimeOffsetToBinaryConverter();

        // ---- Category ----
        modelBuilder.Entity<Category>(entity =>
        {
            entity.HasKey(c => c.Id);
            entity.Property(c => c.Name).IsRequired().HasMaxLength(120);
            entity.Property(c => c.Slug).IsRequired().HasMaxLength(140);
            entity.HasIndex(c => c.Slug).IsUnique();
        });

        // ---- Product ----
        var imagesConverter = new ValueConverter<IReadOnlyList<string>, string>(
            v => JsonSerializer.Serialize(v, jsonOptions),
            v => JsonSerializer.Deserialize<List<string>>(v, jsonOptions) ?? new List<string>());
        var imagesComparer = new ValueComparer<IReadOnlyList<string>>(
            (a, b) => a!.SequenceEqual(b!),
            v => v.Aggregate(0, (hash, item) => HashCode.Combine(hash, item.GetHashCode())),
            v => v.ToList());

        var attributesConverter = new ValueConverter<IReadOnlyList<ProductAttribute>, string>(
            v => JsonSerializer.Serialize(v, jsonOptions),
            v => JsonSerializer.Deserialize<List<ProductAttribute>>(v, jsonOptions) ?? new List<ProductAttribute>());
        var attributesComparer = new ValueComparer<IReadOnlyList<ProductAttribute>>(
            (a, b) => a!.SequenceEqual(b!),
            v => v.Aggregate(0, (hash, item) => HashCode.Combine(hash, item.GetHashCode())),
            v => v.ToList());

        modelBuilder.Entity<Product>(entity =>
        {
            entity.HasKey(p => p.Id);
            entity.Property(p => p.Name).IsRequired().HasMaxLength(200);
            entity.Property(p => p.Sku).IsRequired().HasMaxLength(64);
            entity.Property(p => p.Description).HasMaxLength(4000);
            entity.HasIndex(p => p.Sku).IsUnique();
            entity.Property(p => p.CategoryId).IsRequired();
            entity.HasIndex(p => p.CategoryId);
            entity.Property(p => p.IsActive);
            entity.Property(p => p.CreatedAt).HasConversion(dateTimeOffsetConverter);

            entity.Property(p => p.BasePrice)
                .HasConversion(moneyConverter)
                .HasColumnName("BasePrice")
                .HasPrecision(18, 2);

            entity.Property(p => p.Images)
                .HasField("_images")
                .UsePropertyAccessMode(PropertyAccessMode.Field)
                .HasConversion(imagesConverter, imagesComparer)
                .HasColumnName("Images");

            entity.Property(p => p.Attributes)
                .HasField("_attributes")
                .UsePropertyAccessMode(PropertyAccessMode.Field)
                .HasConversion(attributesConverter, attributesComparer)
                .HasColumnName("Attributes");
        });

        // ---- Offer ----
        var guidListConverter = new ValueConverter<IReadOnlyList<Guid>, string>(
            v => JsonSerializer.Serialize(v, jsonOptions),
            v => JsonSerializer.Deserialize<List<Guid>>(v, jsonOptions) ?? new List<Guid>());
        var guidListComparer = new ValueComparer<IReadOnlyList<Guid>>(
            (a, b) => a!.SequenceEqual(b!),
            v => v.Aggregate(0, (hash, item) => HashCode.Combine(hash, item.GetHashCode())),
            v => v.ToList());

        modelBuilder.Entity<Offer>(entity =>
        {
            entity.HasKey(o => o.Id);
            entity.Property(o => o.Name).IsRequired().HasMaxLength(200);
            entity.Property(o => o.DiscountType).HasConversion<int>();
            entity.Property(o => o.Value).HasPrecision(18, 2);
            entity.Property(o => o.StartsAt).HasConversion(dateTimeOffsetConverter);
            entity.Property(o => o.EndsAt).HasConversion(dateTimeOffsetConverter);
            entity.Property(o => o.IsActive);
            entity.HasIndex(o => new { o.IsActive, o.StartsAt, o.EndsAt });

            entity.Property(o => o.CategoryIds)
                .HasField("_categoryIds")
                .UsePropertyAccessMode(PropertyAccessMode.Field)
                .HasConversion(guidListConverter, guidListComparer)
                .HasColumnName("CategoryIds");

            entity.Property(o => o.ProductIds)
                .HasField("_productIds")
                .UsePropertyAccessMode(PropertyAccessMode.Field)
                .HasConversion(guidListConverter, guidListComparer)
                .HasColumnName("ProductIds");

            entity.Property(o => o.IconName).HasMaxLength(64);
            entity.Property(o => o.BannerTitle).HasMaxLength(200);
            entity.Property(o => o.BannerSubtitle).HasMaxLength(300);
            entity.Property(o => o.BannerBackgroundColor).HasMaxLength(64);
            entity.Property(o => o.BannerImageUrl).HasMaxLength(2048);
        });

        // ---- BrandSettings (singleton row) ----
        var themeConverter = new ValueConverter<IReadOnlyDictionary<string, string>, string>(
            v => JsonSerializer.Serialize(v, jsonOptions),
            v => JsonSerializer.Deserialize<Dictionary<string, string>>(v, jsonOptions) ?? new Dictionary<string, string>());
        var themeComparer = new ValueComparer<IReadOnlyDictionary<string, string>>(
            (a, b) => a!.Count == b!.Count && !a.Except(b).Any(),
            v => v.Aggregate(0, (hash, kv) => HashCode.Combine(hash, kv.Key.GetHashCode(), kv.Value.GetHashCode())),
            v => v.ToDictionary(kv => kv.Key, kv => kv.Value));

        modelBuilder.Entity<BrandSettings>(entity =>
        {
            entity.HasKey(b => b.Id);
            entity.Property(b => b.Id).ValueGeneratedNever();
            entity.Property(b => b.BrandName).IsRequired().HasMaxLength(120);
            entity.Property(b => b.LogoUrl).HasMaxLength(2048);
            entity.Property(b => b.WhatsappNumber).IsRequired().HasMaxLength(32);
            entity.Property(b => b.DefaultLocale).IsRequired().HasMaxLength(8);
            entity.Property(b => b.Vibe).IsRequired().HasMaxLength(40);
            entity.Property(b => b.HeroTitle).HasMaxLength(200);
            entity.Property(b => b.HeroSubtitle).HasMaxLength(300);
            entity.Property(b => b.HeroImageUrl).HasMaxLength(2048);

            entity.Property(b => b.ThemeTokens)
                .HasField("_themeTokens")
                .UsePropertyAccessMode(PropertyAccessMode.Field)
                .HasConversion(themeConverter, themeComparer)
                .HasColumnName("ThemeTokens");
        });

        // ---- AdminUser ----
        modelBuilder.Entity<AdminUser>(entity =>
        {
            entity.HasKey(u => u.Id);
            entity.Property(u => u.Username).IsRequired().HasMaxLength(80);
            entity.HasIndex(u => u.Username).IsUnique();
            entity.Property(u => u.PasswordHash).IsRequired().HasMaxLength(200);
            entity.Property(u => u.Role).IsRequired().HasMaxLength(40);
        });
    }
}
