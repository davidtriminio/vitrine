namespace Vitrine.Application.Offers;

public sealed record OfferResponse(
    Guid Id,
    string Name,
    string DiscountType,
    decimal Value,
    IReadOnlyList<Guid> CategoryIds,
    IReadOnlyList<Guid> ProductIds,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    bool IsActive,
    string? IconName,
    string? BannerTitle,
    string? BannerSubtitle,
    string? BannerBackgroundColor,
    string? BannerImageUrl,
    string? DetailBackgroundImageUrl,
    double? DetailBackgroundImageOpacity);

/// <summary>Trimmed offer shape for public banners (active offers only).</summary>
public sealed record ActiveOfferBannerResponse(
    Guid Id,
    string Name,
    string? IconName,
    string? BannerTitle,
    string? BannerSubtitle,
    string? BannerBackgroundColor,
    string? BannerImageUrl,
    string? DetailBackgroundImageUrl,
    double? DetailBackgroundImageOpacity);

public sealed record CreateOfferRequest(
    string Name,
    string DiscountType,
    decimal Value,
    IReadOnlyList<Guid>? CategoryIds,
    IReadOnlyList<Guid>? ProductIds,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    bool IsActive = true,
    string? IconName = null,
    string? BannerTitle = null,
    string? BannerSubtitle = null,
    string? BannerBackgroundColor = null,
    string? BannerImageUrl = null,
    string? DetailBackgroundImageUrl = null,
    double? DetailBackgroundImageOpacity = null);

public sealed record UpdateOfferRequest(
    string Name,
    string DiscountType,
    decimal Value,
    IReadOnlyList<Guid>? CategoryIds,
    IReadOnlyList<Guid>? ProductIds,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    bool IsActive,
    string? IconName,
    string? BannerTitle,
    string? BannerSubtitle,
    string? BannerBackgroundColor,
    string? BannerImageUrl,
    string? DetailBackgroundImageUrl,
    double? DetailBackgroundImageOpacity);
