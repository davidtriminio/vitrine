using Vitrine.Application.Abstractions;
using Vitrine.Application.Common;
using Vitrine.Domain.Catalog;
using Vitrine.Domain.Common;
using Vitrine.Domain.Offers;
using Vitrine.Domain.Pricing;

namespace Vitrine.Application.Catalog;

public interface IProductService
{
    Task<PagedResponse<ProductResponse>> ListAsync(ProductQuery query, CancellationToken ct = default);

    Task<ProductResponse> GetByIdAsync(Guid id, CancellationToken ct = default);

    /// <summary>Next available zero-padded numeric SKU (for the admin create form).</summary>
    Task<string> SuggestNextSkuAsync(CancellationToken ct = default);

    Task<ProductResponse> CreateAsync(CreateProductRequest request, CancellationToken ct = default);

    Task<ProductResponse> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken ct = default);

    Task DeleteAsync(Guid id, CancellationToken ct = default);
}

public sealed class ProductService : IProductService
{
    private readonly IProductRepository _products;
    private readonly ICategoryRepository _categories;
    private readonly IOfferRepository _offers;
    private readonly IUnitOfWork _unitOfWork;
    private readonly PricingService _pricing;
    private readonly IClock _clock;

    public ProductService(
        IProductRepository products,
        ICategoryRepository categories,
        IOfferRepository offers,
        IUnitOfWork unitOfWork,
        PricingService pricing,
        IClock clock)
    {
        _products = products;
        _categories = categories;
        _offers = offers;
        _unitOfWork = unitOfWork;
        _pricing = pricing;
        _clock = clock;
    }

    public async Task<PagedResponse<ProductResponse>> ListAsync(ProductQuery query, CancellationToken ct = default)
    {
        var now = _clock.UtcNow;
        var activeOffers = await _offers.GetActiveAsync(now, ct);

        IReadOnlyCollection<Guid>? offerProductIds = null;
        IReadOnlyCollection<Guid>? offerCategoryIds = null;

        if (query.OfferId is Guid offerId)
        {
            // Promotion view: restrict to the products a single offer applies to.
            var offer = await _offers.GetByIdAsync(offerId, ct)
                ?? throw new NotFoundException($"Offer '{offerId}' was not found.");
            offerProductIds = offer.ProductIds.ToList();
            offerCategoryIds = offer.CategoryIds.ToList();
        }
        else if (query.OnlyOnOffer)
        {
            offerProductIds = activeOffers.SelectMany(o => o.ProductIds).Distinct().ToList();
            offerCategoryIds = activeOffers.SelectMany(o => o.CategoryIds).Distinct().ToList();
        }

        var paged = await _products.GetPagedAsync(query, offerProductIds, offerCategoryIds, ct);
        var categoryNames = await CategoryNameLookupAsync(ct);

        var items = paged.Items
            .Select(product => CatalogMapper.ToResponse(
                product,
                categoryNames.GetValueOrDefault(product.CategoryId, string.Empty),
                _pricing.CalculatePrice(product, activeOffers, now)))
            .ToList();

        var pageSize = query.NormalizedPageSize;
        var totalPages = (int)Math.Ceiling(paged.TotalItems / (double)pageSize);

        return new PagedResponse<ProductResponse>(items, query.NormalizedPage, pageSize, paged.TotalItems, totalPages);
    }

    public async Task<ProductResponse> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var product = await _products.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Product '{id}' was not found.");

        return await BuildResponseAsync(product, ct);
    }

    public async Task<string> SuggestNextSkuAsync(CancellationToken ct = default)
    {
        var max = await _products.GetMaxSkuNumberAsync(ct);
        return (max + 1).ToString().PadLeft(Product.SkuWidth, '0');
    }

    public async Task<ProductResponse> CreateAsync(CreateProductRequest request, CancellationToken ct = default)
    {
        await EnsureCategoryExistsAsync(request.CategoryId, ct);

        var sku = Product.NormalizeSku(request.Sku);
        if (await _products.SkuExistsAsync(sku, null, ct))
        {
            throw new ConflictException($"A product with SKU '{sku}' already exists.");
        }

        var product = new Product(
            Guid.NewGuid(),
            request.Name,
            sku,
            request.Description,
            request.CategoryId,
            Money.Of(request.BasePrice),
            request.Images,
            CatalogMapper.ToDomainAttributes(request.Attributes),
            request.IsActive,
            _clock.UtcNow);

        await _products.AddAsync(product, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return await BuildResponseAsync(product, ct);
    }

    public async Task<ProductResponse> UpdateAsync(Guid id, UpdateProductRequest request, CancellationToken ct = default)
    {
        var product = await _products.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Product '{id}' was not found.");

        await EnsureCategoryExistsAsync(request.CategoryId, ct);

        var sku = Product.NormalizeSku(request.Sku);
        if (await _products.SkuExistsAsync(sku, id, ct))
        {
            throw new ConflictException($"A product with SKU '{sku}' already exists.");
        }

        product.Update(
            request.Name,
            sku,
            request.Description,
            request.CategoryId,
            Money.Of(request.BasePrice),
            request.Images ?? new List<string>(),
            CatalogMapper.ToDomainAttributes(request.Attributes),
            request.IsActive);

        _products.Update(product);
        await _unitOfWork.SaveChangesAsync(ct);

        return await BuildResponseAsync(product, ct);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var product = await _products.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Product '{id}' was not found.");

        _products.Remove(product);
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private async Task<ProductResponse> BuildResponseAsync(Product product, CancellationToken ct)
    {
        var now = _clock.UtcNow;
        var activeOffers = await _offers.GetActiveAsync(now, ct);
        var category = await _categories.GetByIdAsync(product.CategoryId, ct);
        var price = _pricing.CalculatePrice(product, activeOffers, now);

        return CatalogMapper.ToResponse(product, category?.Name ?? string.Empty, price);
    }

    private async Task EnsureCategoryExistsAsync(Guid categoryId, CancellationToken ct)
    {
        var category = await _categories.GetByIdAsync(categoryId, ct);
        if (category is null)
        {
            throw new NotFoundException($"Category '{categoryId}' was not found.");
        }
    }

    private async Task<Dictionary<Guid, string>> CategoryNameLookupAsync(CancellationToken ct)
    {
        var categories = await _categories.GetAllAsync(ct);
        return categories.ToDictionary(c => c.Id, c => c.Name);
    }
}
