/** DTO mirror of the API's BrandSettingsResponse. */
export interface BrandSettingsDto {
  brandName: string;
  logoUrl: string;
  whatsappNumber: string;
  defaultLocale: string;
  themeTokens: Record<string, string>;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroImageUrl: string | null;
  vibe: string;
}

/** Domain model used by the UI. */
export interface BrandSettings {
  brandName: string;
  logoUrl: string;
  whatsappNumber: string;
  defaultLocale: string;
  themeTokens: Record<string, string>;
  vibe: string;
  hero: {
    title: string | null;
    subtitle: string | null;
    imageUrl: string | null;
  };
}

export function mapBrandSettings(dto: BrandSettingsDto): BrandSettings {
  return {
    brandName: dto.brandName,
    logoUrl: dto.logoUrl,
    whatsappNumber: dto.whatsappNumber,
    defaultLocale: dto.defaultLocale,
    themeTokens: dto.themeTokens ?? {},
    vibe: dto.vibe ?? 'elegant',
    hero: {
      title: dto.heroTitle,
      subtitle: dto.heroSubtitle,
      imageUrl: dto.heroImageUrl,
    },
  };
}
