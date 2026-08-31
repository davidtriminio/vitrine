/** Mirror of the API's UpdateBrandSettingsRequest (admin). */
export interface BrandSettingsUpdate {
  brandName: string;
  logoUrl: string;
  whatsappNumber: string;
  defaultLocale: string;
  themeTokens: Record<string, string>;
  heroTitle: string | null;
  heroSubtitle: string | null;
  heroImageUrl: string | null;
}
