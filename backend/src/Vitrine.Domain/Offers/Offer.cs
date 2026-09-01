using Vitrine.Domain.Catalog;
using Vitrine.Domain.Common;

namespace Vitrine.Domain.Offers;

public enum DiscountType
{
    Percentage = 0,
    FixedAmount = 1
}

/// <summary>
/// A discount rule. Encapsulates its own validity and how it transforms a base price.
/// An offer can target any number of whole categories and/or individual products
/// ("ramos"); it applies to a product when the product itself, or its category, is
/// targeted. Presentation fields (icon, banner, colors) let each brand "decorate" the
/// offer without touching UI code.
/// </summary>
public sealed class Offer
{
    private readonly List<Guid> _categoryIds = new();
    private readonly List<Guid> _productIds = new();

    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public DiscountType DiscountType { get; private set; }
    public decimal Value { get; private set; }
    public DateTimeOffset StartsAt { get; private set; }
    public DateTimeOffset EndsAt { get; private set; }
    public bool IsActive { get; private set; }

    /// <summary>Categories the offer applies to as a whole.</summary>
    public IReadOnlyList<Guid> CategoryIds => _categoryIds;

    /// <summary>Individual products ("ramos") the offer applies to.</summary>
    public IReadOnlyList<Guid> ProductIds => _productIds;

    // Optional presentation (white-label decoration).
    public string? IconName { get; private set; }
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
        IEnumerable<Guid> categoryIds,
        IEnumerable<Guid> productIds,
        DateTimeOffset startsAt,
        DateTimeOffset endsAt,
        bool isActive = true,
        string? iconName = null,
        string? bannerTitle = null,
        string? bannerSubtitle = null,
        string? bannerBackgroundColor = null,
        string? bannerImageUrl = null)
    {
        Id = id == Guid.Empty ? Guid.NewGuid() : id;
        Name = string.Empty;
        SetCore(name, discountType, value, categoryIds, productIds, startsAt, endsAt);
        IsActive = isActive;
        SetPresentation(iconName, bannerTitle, bannerSubtitle, bannerBackgroundColor, bannerImageUrl);
    }

    public void Update(
        string name,
        DiscountType discountType,
        decimal value,
        IEnumerable<Guid> categoryIds,
        IEnumerable<Guid> productIds,
        DateTimeOffset startsAt,
        DateTimeOffset endsAt,
        bool isActive,
        string? iconName,
        string? bannerTitle,
        string? bannerSubtitle,
        string? bannerBackgroundColor,
        string? bannerImageUrl)
    {
        SetCore(name, discountType, value, categoryIds, productIds, startsAt, endsAt);
        IsActive = isActive;
        SetPresentation(iconName, bannerTitle, bannerSubtitle, bannerBackgroundColor, bannerImageUrl);
    }

    /// <summary>True when the offer is enabled and <paramref name="now"/> falls within its window.</summary>
    public bool IsActiveAt(DateTimeOffset now) => IsActive && now >= StartsAt && now <= EndsAt;

    /// <summary>True when this offer targets the given product directly or via its category.</summary>
    public bool IsApplicableTo(Product product) =>
        _productIds.Contains(product.Id) || _categoryIds.Contains(product.CategoryId);

    /// <summary>True when this offer targets the product itself (used to break pricing ties).</summary>
    public bool AppliesDirectlyToProduct(Product product) => _productIds.Contains(product.Id);

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
        IEnumerable<Guid> categoryIds,
        IEnumerable<Guid> productIds,
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

        var categories = Distinct(categoryIds);
        var products = Distinct(productIds);
        if (categories.Count == 0 && products.Count == 0)
        {
            throw new DomainException("Offer must target at least one category or product.");
        }

        Name = name.Trim();
        DiscountType = discountType;
        Value = value;
        StartsAt = startsAt;
        EndsAt = endsAt;

        _categoryIds.Clear();
        _categoryIds.AddRange(categories);
        _productIds.Clear();
        _productIds.AddRange(products);
    }

    private void SetPresentation(
        string? iconName,
        string? title,
        string? subtitle,
        string? backgroundColor,
        string? imageUrl)
    {
        IconName = Clean(iconName);
        BannerTitle = Clean(title);
        BannerSubtitle = Clean(subtitle);
        BannerBackgroundColor = Clean(backgroundColor);
        BannerImageUrl = Clean(imageUrl);
    }

    private static List<Guid> Distinct(IEnumerable<Guid>? ids) =>
        (ids ?? Enumerable.Empty<Guid>()).Where(id => id != Guid.Empty).Distinct().ToList();

    private static string? Clean(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value.Trim();
}
