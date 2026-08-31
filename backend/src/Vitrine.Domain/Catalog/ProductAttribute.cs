using Vitrine.Domain.Common;

namespace Vitrine.Domain.Catalog;

/// <summary>
/// A product characteristic as a key/value pair (e.g. "Color" / "Rosa").
/// These feed both the detail view and the WhatsApp contact message.
/// </summary>
public sealed record ProductAttribute
{
    public string Key { get; }
    public string Value { get; }

    public ProductAttribute(string key, string value)
    {
        if (string.IsNullOrWhiteSpace(key))
        {
            throw new DomainException("Product attribute key is required.");
        }

        if (string.IsNullOrWhiteSpace(value))
        {
            throw new DomainException("Product attribute value is required.");
        }

        Key = key.Trim();
        Value = value.Trim();
    }
}
