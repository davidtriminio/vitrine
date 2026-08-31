using Vitrine.Domain.Catalog;
using Vitrine.Domain.Common;

namespace Vitrine.Domain.Offers;

public enum DiscountType
{
    Percentage = 0,
    FixedAmount = 1
}

public enum OfferScope
{
    Product = 0,
    Category = 1
}

/// <summary>
/// A discount rule. Encapsulates its own validity and how it transforms a base price.
/// Presentation fields (banner) let each brand "decorate" the offer without touching UI code.
/// </summary>
public sealed class Offer
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public DiscountType DiscountType { get; private set; }
    public decimal Value { get; private set; }
    public OfferScope Scope { get; private set; }
    public Guid TargetId { get; private set; }
    public DateTimeOffset StartsAt { get; private set; }
    public DateTimeOffset EndsAt { get; private set; }
    public bool IsActive { get; private set; }

    // Optional banner presentation (white-label decoration).
    public string? BannerTitle { get; private set; }
    public string? BannerSubtitle { get; private set; }
    public string? BannerBackgroundColor { get; private set; }
    public string? BannerImageUrl { get; private set; }

    // EF Core materialization constructor.
    private Offer()
    {
        Name = string.Empty;
    }

    public Offer(
        Guid id,
        string name,
        DiscountType discountType,
        decimal value,
        OfferScope scope,
        Guid targetId,
        DateTimeOffset startsAt,
        DateTimeOffset endsAt,
        bool isActive = true,
        string? bannerTitle = null,
        string? bannerSubtitle = null,
        string? bannerBackgroundColor = null,
        string? bannerImageUrl = null)
    {
        Id = id == Guid.Empty ? Guid.NewGuid() : id;
        Name = string.Empty;
        SetCore(name, discountType, value, scope, targetId, startsAt, endsAt);
        IsActive = isActive;
        SetBanner(bannerTitle, bannerSubtitle, bannerBackgroundColor, bannerImageUrl);
    }

    public void Update(
        string name,
        DiscountType discountType,
        decimal value,
        OfferScope scope,
        Guid targetId,
        DateTimeOffset startsAt,
        DateTimeOffset endsAt,
        bool isActive,
        string? bannerTitle,
        string? bannerSubtitle,
        string? bannerBackgroundColor,
        string? bannerImageUrl)
    {
        SetCore(name, discountType, value, scope, targetId, startsAt, endsAt);
        IsActive = isActive;
        SetBanner(bannerTitle, bannerSubtitle, bannerBackgroundColor, bannerImageUrl);
    }

    /// <summary>True when the offer is enabled and <paramref name="now"/> falls within its window.</summary>
    public bool IsActiveAt(DateTimeOffset now) => IsActive && now >= StartsAt && now <= EndsAt;

    /// <summary>True when this offer targets the given product (directly or via its category).</summary>
    public bool IsApplicableTo(Product product) =>
        Scope == OfferScope.Product
            ? TargetId == product.Id
            : TargetId == product.CategoryId;

    /// <summary>Transforms a base price into the discounted price for this offer.</summary>
    public Money Apply(Money basePrice) => DiscountType switch
    {
        DiscountType.Percentage => basePrice.ApplyPercentage(Value),
        DiscountType.FixedAmount => basePrice.SubtractCapped(Value),
        _ => basePrice
    };

    private void SetCore(
        string name,
        DiscountType discountType,
        decimal value,
        OfferScope scope,
        Guid targetId,
        DateTimeOffset startsAt,
        DateTimeOffset endsAt)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException("Offer name is required.");
        }

        if (discountType == DiscountType.Percentage && value is <= 0 or > 100)
        {
            throw new DomainException("Percentage discount must be within (0, 100].");
        }

        if (discountType == DiscountType.FixedAmount && value <= 0)
        {
            throw new DomainException("Fixed-amount discount must be greater than zero.");
        }

        if (endsAt <= startsAt)
        {
            throw new DomainException("Offer end date must be after its start date.");
        }

        if (targetId == Guid.Empty)
        {
            throw new DomainException("Offer target is required.");
        }

        Name = name.Trim();
        DiscountType = discountType;
        Value = value;
        Scope = scope;
        TargetId = targetId;
        StartsAt = startsAt;
        EndsAt = endsAt;
    }

    private void SetBanner(string? title, string? subtitle, string? backgroundColor, string? imageUrl)
    {
        BannerTitle = string.IsNullOrWhiteSpace(title) ? null : title.Trim();
        BannerSubtitle = string.IsNullOrWhiteSpace(subtitle) ? null : subtitle.Trim();
        BannerBackgroundColor = string.IsNullOrWhiteSpace(backgroundColor) ? null : backgroundColor.Trim();
        BannerImageUrl = string.IsNullOrWhiteSpace(imageUrl) ? null : imageUrl.Trim();
    }
}
