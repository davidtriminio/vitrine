using Vitrine.Domain.Common;

namespace Vitrine.Application.Catalog;

/// <summary>Input limits for products written through the admin API.</summary>
public static class ProductRules
{
    public const int NameMaxLength = 120;
    public const int DescriptionMinLength = 10;
    public const int DescriptionMaxLength = 2000;
    public const decimal MinPrice = 0.01m;
    public const decimal MaxPrice = 9_999_999.99m;
    public const int MaxImages = 10;
    public const int ImageUrlMaxLength = 500;

    public static void Validate(
        string name,
        string description,
        decimal basePrice,
        IReadOnlyList<string>? images)
    {
        var trimmedName = (name ?? string.Empty).Trim();
        if (trimmedName.Length == 0 || trimmedName.Length > NameMaxLength)
        {
            throw new DomainException($"Product name is required (max {NameMaxLength} characters).");
        }

        var trimmedDescription = (description ?? string.Empty).Trim();
        if (trimmedDescription.Length < DescriptionMinLength || trimmedDescription.Length > DescriptionMaxLength)
        {
            throw new DomainException(
                $"Product description is required ({DescriptionMinLength}-{DescriptionMaxLength} characters).");
        }

        if (basePrice < MinPrice || basePrice > MaxPrice)
        {
            throw new DomainException($"Product price must be between {MinPrice} and {MaxPrice}.");
        }

        var validImages = (images ?? Array.Empty<string>()).Where(i => !string.IsNullOrWhiteSpace(i)).ToList();
        if (validImages.Count == 0 || validImages.Count > MaxImages)
        {
            throw new DomainException($"Product needs between 1 and {MaxImages} images.");
        }

        if (validImages.Any(i => !IsSafeImageUrl(i.Trim())))
        {
            throw new DomainException("Image URLs must be http(s) links or uploaded paths.");
        }
    }

    // Blocks javascript:/data: URLs that could be rendered from the catalog.
    private static bool IsSafeImageUrl(string url)
    {
        if (url.Length > ImageUrlMaxLength)
        {
            return false;
        }

        if (url.StartsWith('/') && !url.StartsWith("//", StringComparison.Ordinal))
        {
            return true;
        }

        return Uri.TryCreate(url, UriKind.Absolute, out var uri)
            && (uri.Scheme == Uri.UriSchemeHttp || uri.Scheme == Uri.UriSchemeHttps);
    }
}
