/**
 * Canonical default theme (florist white-label baseline). Mirrors the token values
 * declared in styles.css `@theme`. This is the frontend-owned source of defaults:
 *
 *  - Cloning the repo for a new brand = editing these values (and styles.css).
 *  - The backend stores only the brand's *overrides* (BrandSettings.ThemeTokens),
 *    which are layered on top of these defaults at runtime.
 *  - "Restore to defaults" (future admin panel) = clear overrides and re-apply this.
 *
 * Keys are semantic token names; they become CSS custom properties `--color-<key>`.
 */
export const DEFAULT_THEME: Readonly<Record<string, string>> = {
  surface: '#faf7f5',
  'surface-2': '#f2ebe7',
  muted: '#dbd4d1',
  fg: '#2c2724',
  'fg-muted': '#6b615c',
  primary: '#f099be',
  'primary-strong': '#c85688',
  'primary-fg': '#2c2724',
  accent: '#8da33c',
  'accent-strong': '#5f7029',
  'accent-fg': '#ffffff',
  ring: '#c85688',
};

/** Merges brand overrides over the defaults to produce the effective palette. */
export function resolveTheme(overrides: Record<string, string> | null | undefined): Record<string, string> {
  return { ...DEFAULT_THEME, ...(overrides ?? {}) };
}
