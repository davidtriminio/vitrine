namespace Vitrine.Application.Offers;

public sealed record OfferResponse(
    Guid Id,
    string Name,
    string DiscountType,
    decimal Value,
    string Scope,
    Guid TargetId,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    bool IsActive,
    string? BannerTitle,
    string? BannerSubtitle,
    string? BannerBackgroundColor,
    string? BannerImageUrl);

/// <summary>Trimmed offer shape for public banners (active offers only).</summary>
public sealed record ActiveOfferBannerResponse(
    Guid Id,
    string Name,
    string Scope,
    Guid TargetId,
    string? BannerTitle,
    string? BannerSubtitle,
    string? BannerBackgroundColor,
    string? BannerImageUrl);

public sealed record CreateOfferRequest(
    string Name,
    string DiscountType,
    decimal Value,
    string Scope,
    Guid TargetId,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    bool IsActive = true,
    string? BannerTitle = null,
    string? BannerSubtitle = null,
    string? BannerBackgroundColor = null,
    string? BannerImageUrl = null);

public sealed record UpdateOfferRequest(
    string Name,
    string DiscountType,
    decimal Value,
    string Scope,
    Guid TargetId,
    DateTimeOffset StartsAt,
    DateTimeOffset EndsAt,
    bool IsActive,
    string? BannerTitle,
    string? BannerSubtitle,
    string? BannerBackgroundColor,
    string? BannerImageUrl);
