import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';
import { DEFAULT_THEME, resolveTheme } from './default-theme';

/**
 * Applies brand theme tokens as CSS custom properties on :root, so Tailwind's
 * semantic utilities (bg-primary, text-fg, ...) reflect the brand at runtime.
 * A reskin changes token values only — never components.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  /** Applies brand overrides layered over the default theme (partial overrides are fine). */
  apply(overrides: Record<string, string> | null | undefined): void {
    this.write(resolveTheme(overrides));
  }

  /** Re-applies the default theme, discarding any runtime overrides. */
  resetToDefaults(): void {
    this.write(DEFAULT_THEME);
  }

  private write(theme: Record<string, string>): void {
    const root = this.document.documentElement;
    for (const [name, value] of Object.entries(theme)) {
      root.style.setProperty(`--color-${name}`, value);
    }
  }
}
