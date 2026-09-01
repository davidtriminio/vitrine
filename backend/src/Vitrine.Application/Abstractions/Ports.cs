using Vitrine.Domain.Branding;
using Vitrine.Domain.Catalog;
using Vitrine.Domain.Identity;
using Vitrine.Domain.Offers;

namespace Vitrine.Application.Abstractions;

/// <summary>Ordering options for a product listing.</summary>
public enum ProductSort
{
    /// <summary>By reference number (SKU), ascending — 001, 002, 003… (default).</summary>
    IdAsc = 0,
    Newest = 1,
    Oldest = 2,
    PriceAsc = 3,
    PriceDesc = 4,
    Name = 5
}

/// <summary>Filter/paging criteria for a product listing.</summary>
public sealed record ProductQuery(
    int Page = 1,
    int PageSize = 20,
    Guid? CategoryId = null,
    string? Search = null,
    bool OnlyOnOffer = false,
    bool IncludeInactive = false,
    Guid? OfferId = null,
    ProductSort Sort = ProductSort.IdAsc)
{
    public const int MaxPageSize = 100;

    public int NormalizedPage => Page < 1 ? 1 : Page;

    public int NormalizedPageSize => PageSize switch
    {
        < 1 => 20,
        > MaxPageSize => MaxPageSize,
        _ => PageSize
    };
}

/// <summary>A page of products together with the total count for the applied filter.</summary>
public sealed record PagedProducts(IReadOnlyList<Product> Items, int TotalItems);

public interface IProductRepository
{
    Task<Product?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<PagedProducts> GetPagedAsync(
        ProductQuery query,
        IReadOnlyCollection<Guid>? onOfferProductIds,
        IReadOnlyCollection<Guid>? onOfferCategoryIds,
        CancellationToken ct = default);

    Task<bool> SkuExistsAsync(string sku, Guid? excludeId = null, CancellationToken ct = default);

    /// <summary>Highest existing numeric SKU value (0 when there are no products).</summary>
    Task<int> GetMaxSkuNumberAsync(CancellationToken ct = default);

    Task AddAsync(Product product, CancellationToken ct = default);

    void Update(Product product);

    void Remove(Product product);
}

public interface ICategoryRepository
{
    Task<IReadOnlyList<Category>> GetAllAsync(CancellationToken ct = default);

    Task<Category?> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<bool> SlugExistsAsync(string slug, Guid? excludeId = null, CancellationToken ct = default);

    Task<bool> HasProductsAsync(Guid categoryId, CancellationToken ct = default);

    Task AddAsync(Category category, CancellationToken ct = default);

    void Update(Category category);

    void Remove(Category category);
}

public interface IOfferRepository
{
    Task<IReadOnlyList<Offer>> GetAllAsync(CancellationToken ct = default);

    Task<Offer?> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>Offers that are enabled and currently within their validity window.</summary>
    Task<IReadOnlyList<Offer>> GetActiveAsync(DateTimeOffset now, CancellationToken ct = default);

    Task AddAsync(Offer offer, CancellationToken ct = default);

    void Update(Offer offer);

    void Remove(Offer offer);
}

public interface IBrandSettingsRepository
{
    Task<BrandSettings?> GetAsync(CancellationToken ct = default);

    void Update(BrandSettings settings);
}

public interface IAdminUserRepository
{
    Task<AdminUser?> GetByUsernameAsync(string username, CancellationToken ct = default);
}

/// <summary>Commits pending changes made through the repositories.</summary>
public interface IUnitOfWork
{
    Task<int> SaveChangesAsync(CancellationToken ct = default);
}

/// <summary>Abstracts the current time so pricing and offer validity stay testable.</summary>
public interface IClock
{
    DateTimeOffset UtcNow { get; }
}

public interface IPasswordHasher
{
    string Hash(string password);

    bool Verify(string password, string passwordHash);
}

public sealed record AccessToken(string Token, DateTimeOffset ExpiresAt);

public interface IJwtIssuer
{
    AccessToken Issue(AdminUser user);
}
