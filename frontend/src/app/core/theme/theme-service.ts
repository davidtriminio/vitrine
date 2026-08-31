import { DOCUMENT } from '@angular/common';
import { Injectable, inject } from '@angular/core';

/**
 * Applies brand theme tokens as CSS custom properties on :root, so Tailwind's
 * semantic utilities (bg-primary, text-fg, ...) reflect the brand at runtime.
 * A reskin changes token values only — never components.
 */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);

  apply(themeTokens: Record<string, string>): void {
    const root = this.document.documentElement;
    for (const [name, value] of Object.entries(themeTokens)) {
      root.style.setProperty(`--color-${name}`, value);
    }
  }
}
