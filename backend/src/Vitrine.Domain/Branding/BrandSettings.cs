using Vitrine.Domain.Common;

namespace Vitrine.Domain.Branding;

/// <summary>
/// Singleton white-label configuration for the deployment: brand identity, WhatsApp
/// contact number, default locale and the theme token values the frontend injects as
/// CSS custom properties. Admin-editable at runtime.
/// </summary>
public sealed class BrandSettings
{
    // Fixed primary key: this is a one-row (per-deployment) configuration.
    public const int SingletonId = 1;

    private readonly Dictionary<string, string> _themeTokens = new();

    public int Id { get; private set; } = SingletonId;
    public string BrandName { get; private set; }
    public string LogoUrl { get; private set; }
    public string WhatsappNumber { get; private set; }
    public string DefaultLocale { get; private set; }
    public string? HeroTitle { get; private set; }
    public string? HeroSubtitle { get; private set; }
    public string? HeroImageUrl { get; private set; }

    public IReadOnlyDictionary<string, string> ThemeTokens => _themeTokens;

    // EF Core materialization constructor.
    private BrandSettings()
    {
        BrandName = string.Empty;
        LogoUrl = string.Empty;
        WhatsappNumber = string.Empty;
        DefaultLocale = "es";
    }

    public BrandSettings(
        string brandName,
        string logoUrl,
        string whatsappNumber,
        string defaultLocale,
        IReadOnlyDictionary<string, string> themeTokens,
        string? heroTitle = null,
        string? heroSubtitle = null,
        string? heroImageUrl = null)
    {
        Id = SingletonId;
        BrandName = string.Empty;
        LogoUrl = string.Empty;
        WhatsappNumber = string.Empty;
        DefaultLocale = "es";
        Update(brandName, logoUrl, whatsappNumber, defaultLocale, themeTokens, heroTitle, heroSubtitle, heroImageUrl);
    }

    public void Update(
        string brandName,
        string logoUrl,
        string whatsappNumber,
        string defaultLocale,
        IReadOnlyDictionary<string, string> themeTokens,
        string? heroTitle,
        string? heroSubtitle,
        string? heroImageUrl)
    {
        if (string.IsNullOrWhiteSpace(brandName))
        {
            throw new DomainException("Brand name is required.");
        }

        if (string.IsNullOrWhiteSpace(whatsappNumber))
        {
            throw new DomainException("WhatsApp number is required.");
        }

        BrandName = brandName.Trim();
        LogoUrl = (logoUrl ?? string.Empty).Trim();
        WhatsappNumber = NormalizeWhatsapp(whatsappNumber);
        DefaultLocale = string.IsNullOrWhiteSpace(defaultLocale) ? "es" : defaultLocale.Trim().ToLowerInvariant();
        HeroTitle = string.IsNullOrWhiteSpace(heroTitle) ? null : heroTitle.Trim();
        HeroSubtitle = string.IsNullOrWhiteSpace(heroSubtitle) ? null : heroSubtitle.Trim();
        HeroImageUrl = string.IsNullOrWhiteSpace(heroImageUrl) ? null : heroImageUrl.Trim();

        _themeTokens.Clear();
        foreach (var (key, value) in themeTokens)
        {
            if (!string.IsNullOrWhiteSpace(key) && !string.IsNullOrWhiteSpace(value))
            {
                _themeTokens[key.Trim()] = value.Trim();
            }
        }
    }

    /// <summary>Keeps only digits (E.164 without the leading '+'), as wa.me expects.</summary>
    private static string NormalizeWhatsapp(string raw)
    {
        var digits = new string(raw.Where(char.IsDigit).ToArray());
        if (digits.Length < 8)
        {
            throw new DomainException("WhatsApp number is not valid.");
        }

        return digits;
    }
}
