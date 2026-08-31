namespace Vitrine.Application.Catalog;

/// <summary>A page of results with paging metadata.</summary>
public sealed record PagedResponse<T>(
    IReadOnlyList<T> Items,
    int Page,
    int PageSize,
    int TotalItems,
    int TotalPages);

public sealed record ProductAttributeDto(string Key, string Value);

/// <summary>Summary of the offer applied to a price (null when there is no discount).</summary>
public sealed record AppliedOfferDto(Guid Id, string Name, string Type, decimal Value);

/// <summary>Price block: list price plus the domain-calculated final price and savings.</summary>
public sealed record PriceDto(
    string Currency,
    decimal BasePrice,
    decimal FinalPrice,
    decimal Savings,
    bool HasDiscount,
    AppliedOfferDto? AppliedOffer);

public sealed record ProductResponse(
    Guid Id,
    string Name,
    string Sku,
    string Description,
    Guid CategoryId,
    string CategoryName,
    IReadOnlyList<string> Images,
    IReadOnlyList<ProductAttributeDto> Attributes,
    PriceDto Price,
    bool IsActive);

public sealed record CreateProductRequest(
    string Name,
    string Sku,
    string Description,
    Guid CategoryId,
    decimal BasePrice,
    IReadOnlyList<string>? Images,
    IReadOnlyList<ProductAttributeDto>? Attributes,
    bool IsActive = true);

public sealed record UpdateProductRequest(
    string Name,
    string Sku,
    string Description,
    Guid CategoryId,
    decimal BasePrice,
    IReadOnlyList<string>? Images,
    IReadOnlyList<ProductAttributeDto>? Attributes,
    bool IsActive);

public sealed record CategoryResponse(Guid Id, string Name, string Slug);

public sealed record CreateCategoryRequest(string Name, string Slug);

public sealed record UpdateCategoryRequest(string Name, string Slug);
