namespace Vitrine.Application.Branding;

/// <summary>Public brand + theme payload the frontend uses for white-label rendering.</summary>
public sealed record BrandSettingsResponse(
    string BrandName,
    string LogoUrl,
    string WhatsappNumber,
    string DefaultLocale,
    IReadOnlyDictionary<string, string> ThemeTokens,
    string? HeroTitle,
    string? HeroSubtitle,
    string? HeroImageUrl,
    string Vibe);

public sealed record UpdateBrandSettingsRequest(
    string BrandName,
    string LogoUrl,
    string WhatsappNumber,
    string DefaultLocale,
    IReadOnlyDictionary<string, string> ThemeTokens,
    string? HeroTitle,
    string? HeroSubtitle,
    string? HeroImageUrl,
    string? Vibe);
