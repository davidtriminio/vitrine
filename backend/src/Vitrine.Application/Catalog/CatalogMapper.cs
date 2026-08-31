using Vitrine.Application.Common;
using Vitrine.Domain.Catalog;
using Vitrine.Domain.Pricing;

namespace Vitrine.Application.Catalog;

/// <summary>Maps domain catalog types to their public DTOs.</summary>
public static class CatalogMapper
{
    public static ProductResponse ToResponse(Product product, string categoryName, PriceResult price)
    {
        var applied = price.AppliedOffer is null
            ? null
            : new AppliedOfferDto(
                price.AppliedOffer.Id,
                price.AppliedOffer.Name,
                price.AppliedOffer.DiscountType.ToString(),
                price.AppliedOffer.Value);

        var priceDto = new PriceDto(
            EnumParsing.CurrencyCode(price.BasePrice.Currency),
            price.BasePrice.Amount,
            price.FinalPrice.Amount,
            price.Savings.Amount,
            price.HasDiscount,
            applied);

        return new ProductResponse(
            product.Id,
            product.Name,
            product.Sku,
            product.Description,
            product.CategoryId,
            categoryName,
            product.Images.ToList(),
            product.Attributes.Select(a => new ProductAttributeDto(a.Key, a.Value)).ToList(),
            priceDto,
            product.IsActive);
    }

    public static CategoryResponse ToResponse(Category category) =>
        new(category.Id, category.Name, category.Slug);

    public static IEnumerable<ProductAttribute> ToDomainAttributes(IReadOnlyList<ProductAttributeDto>? attributes) =>
        (attributes ?? new List<ProductAttributeDto>())
            .Select(a => new ProductAttribute(a.Key, a.Value));
}
