using Vitrine.Domain.Common;

namespace Vitrine.Domain.Catalog;

/// <summary>
/// A catalog product. Holds its list price (<see cref="BasePrice"/>); the final
/// price after offers is a pure calculation (see PricingService) and is never stored.
/// </summary>
public sealed class Product
{
    private readonly List<string> _images = new();
    private readonly List<ProductAttribute> _attributes = new();

    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public string Sku { get; private set; }
    public string Description { get; private set; }
    public Guid CategoryId { get; private set; }
    public Money BasePrice { get; private set; }
    public bool IsActive { get; private set; }
    public DateTimeOffset CreatedAt { get; private set; }

    public IReadOnlyList<string> Images => _images;
    public IReadOnlyList<ProductAttribute> Attributes => _attributes;

    // EF Core materialization constructor.
    private Product()
    {
        Name = string.Empty;
        Sku = string.Empty;
        Description = string.Empty;
    }

    public Product(
        Guid id,
        string name,
        string sku,
        string description,
        Guid categoryId,
        Money basePrice,
        IEnumerable<string>? images = null,
        IEnumerable<ProductAttribute>? attributes = null,
        bool isActive = true,
        DateTimeOffset? createdAt = null)
    {
        Id = id == Guid.Empty ? Guid.NewGuid() : id;
        CategoryId = categoryId;
        CreatedAt = createdAt ?? DateTimeOffset.UtcNow;
        IsActive = isActive;
        Name = string.Empty;
        Sku = string.Empty;
        Description = string.Empty;
        SetDetails(name, sku, description, basePrice);

        if (images is not null)
        {
            _images.AddRange(images.Where(i => !string.IsNullOrWhiteSpace(i)).Select(i => i.Trim()));
        }

        if (attributes is not null)
        {
            _attributes.AddRange(attributes);
        }
    }

    public void Update(
        string name,
        string sku,
        string description,
        Guid categoryId,
        Money basePrice,
        IEnumerable<string> images,
        IEnumerable<ProductAttribute> attributes,
        bool isActive)
    {
        SetDetails(name, sku, description, basePrice);
        CategoryId = categoryId;
        IsActive = isActive;

        _images.Clear();
        _images.AddRange(images.Where(i => !string.IsNullOrWhiteSpace(i)).Select(i => i.Trim()));

        _attributes.Clear();
        _attributes.AddRange(attributes);
    }

    private void SetDetails(string name, string sku, string description, Money basePrice)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException("Product name is required.");
        }

        if (string.IsNullOrWhiteSpace(sku))
        {
            throw new DomainException("Product SKU is required.");
        }

        Name = name.Trim();
        Sku = sku.Trim();
        Description = (description ?? string.Empty).Trim();
        BasePrice = basePrice;
    }
}
