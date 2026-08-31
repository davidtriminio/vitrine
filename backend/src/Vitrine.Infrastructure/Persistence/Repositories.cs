using Microsoft.EntityFrameworkCore;
using Vitrine.Application.Abstractions;
using Vitrine.Domain.Branding;
using Vitrine.Domain.Catalog;
using Vitrine.Domain.Identity;
using Vitrine.Domain.Offers;

namespace Vitrine.Infrastructure.Persistence;

public sealed class ProductRepository : IProductRepository
{
    private readonly VitrineDbContext _db;

    public ProductRepository(VitrineDbContext db) => _db = db;

    public Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _db.Products.FirstOrDefaultAsync(p => p.Id == id, ct);

    public async Task<PagedProducts> GetPagedAsync(
        ProductQuery query,
        IReadOnlyCollection<Guid>? onOfferProductIds,
        IReadOnlyCollection<Guid>? onOfferCategoryIds,
        CancellationToken ct = default)
    {
        var q = _db.Products.AsQueryable();

        if (!query.IncludeInactive)
        {
            q = q.Where(p => p.IsActive);
        }

        if (query.CategoryId is Guid categoryId)
        {
            q = q.Where(p => p.CategoryId == categoryId);
        }

        if (!string.IsNullOrWhiteSpace(query.Search))
        {
            var pattern = $"%{query.Search.Trim()}%";
            q = q.Where(p => EF.Functions.Like(p.Name, pattern) || EF.Functions.Like(p.Sku, pattern));
        }

        // Restrict to specific products/categories (used by "only on offer" and by a
        // single-offer promotion view). Applied whenever the caller supplies the sets.
        if (onOfferProductIds is not null || onOfferCategoryIds is not null)
        {
            var productIds = (onOfferProductIds ?? Array.Empty<Guid>()).ToArray();
            var categoryIds = (onOfferCategoryIds ?? Array.Empty<Guid>()).ToArray();
            q = q.Where(p => productIds.Contains(p.Id) || categoryIds.Contains(p.CategoryId));
        }

        var total = await q.CountAsync(ct);

        var items = await q
            .OrderByDescending(p => p.CreatedAt)
            .Skip((query.NormalizedPage - 1) * query.NormalizedPageSize)
            .Take(query.NormalizedPageSize)
            .ToListAsync(ct);

        return new PagedProducts(items, total);
    }

    public Task<bool> SkuExistsAsync(string sku, Guid? excludeId = null, CancellationToken ct = default) =>
        _db.Products.AnyAsync(p => p.Sku == sku && (excludeId == null || p.Id != excludeId), ct);

    public async Task<int> GetMaxSkuNumberAsync(CancellationToken ct = default)
    {
        // SKUs are stored as zero-padded numeric strings; compute the max in memory
        // (catalog sizes here are small and this avoids provider-specific string casts).
        var skus = await _db.Products.Select(p => p.Sku).ToListAsync(ct);
        return skus
            .Select(sku => int.TryParse(sku, out var value) ? value : 0)
            .DefaultIfEmpty(0)
            .Max();
    }

    public async Task AddAsync(Product product, CancellationToken ct = default) =>
        await _db.Products.AddAsync(product, ct);

    public void Update(Product product) => _db.Products.Update(product);

    public void Remove(Product product) => _db.Products.Remove(product);
}

public sealed class CategoryRepository : ICategoryRepository
{
    private readonly VitrineDbContext _db;

    public CategoryRepository(VitrineDbContext db) => _db = db;

    public async Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken ct = default) =>
        await _db.Categories.OrderBy(c => c.Name).ToListAsync(ct);

    public Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _db.Categories.FirstOrDefaultAsync(c => c.Id == id, ct);

    public Task<bool> SlugExistsAsync(string slug, Guid? excludeId = null, CancellationToken ct = default) =>
        _db.Categories.AnyAsync(c => c.Slug == slug && (excludeId == null || c.Id != excludeId), ct);

    public Task<bool> HasProductsAsync(Guid categoryId, CancellationToken ct = default) =>
        _db.Products.AnyAsync(p => p.CategoryId == categoryId, ct);

    public async Task AddAsync(Category category, CancellationToken ct = default) =>
        await _db.Categories.AddAsync(category, ct);

    public void Update(Category category) => _db.Categories.Update(category);

    public void Remove(Category category) => _db.Categories.Remove(category);
}

public sealed class OfferRepository : IOfferRepository
{
    private readonly VitrineDbContext _db;

    public OfferRepository(VitrineDbContext db) => _db = db;

    public async Task<IReadOnlyList<Offer>> GetAllAsync(CancellationToken ct = default) =>
        await _db.Offers.OrderByDescending(o => o.StartsAt).ToListAsync(ct);

    public Task<Offer?> GetByIdAsync(Guid id, CancellationToken ct = default) =>
        _db.Offers.FirstOrDefaultAsync(o => o.Id == id, ct);

    public async Task<IReadOnlyList<Offer>> GetActiveAsync(DateTimeOffset now, CancellationToken ct = default) =>
        await _db.Offers
            .Where(o => o.IsActive && o.StartsAt <= now && o.EndsAt >= now)
            .ToListAsync(ct);

    public async Task AddAsync(Offer offer, CancellationToken ct = default) =>
        await _db.Offers.AddAsync(offer, ct);

    public void Update(Offer offer) => _db.Offers.Update(offer);

    public void Remove(Offer offer) => _db.Offers.Remove(offer);
}

public sealed class BrandSettingsRepository : IBrandSettingsRepository
{
    private readonly VitrineDbContext _db;

    public BrandSettingsRepository(VitrineDbContext db) => _db = db;

    public Task<BrandSettings?> GetAsync(CancellationToken ct = default) =>
        _db.BrandSettings.FirstOrDefaultAsync(b => b.Id == Domain.Branding.BrandSettings.SingletonId, ct);

    public void Update(BrandSettings settings) => _db.BrandSettings.Update(settings);
}

public sealed class AdminUserRepository : IAdminUserRepository
{
    private readonly VitrineDbContext _db;

    public AdminUserRepository(VitrineDbContext db) => _db = db;

    public Task<AdminUser?> GetByUsernameAsync(string username, CancellationToken ct = default)
    {
        var normalized = username.Trim().ToLowerInvariant();
        return _db.AdminUsers.FirstOrDefaultAsync(u => u.Username == normalized, ct);
    }
}

public sealed class UnitOfWork : IUnitOfWork
{
    private readonly VitrineDbContext _db;

    public UnitOfWork(VitrineDbContext db) => _db = db;

    public Task<int> SaveChangesAsync(CancellationToken ct = default) => _db.SaveChangesAsync(ct);
}
