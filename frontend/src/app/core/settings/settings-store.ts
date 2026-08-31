import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { API_BASE_URL } from '../config/app-config';
import { TranslationService } from '../i18n/translation-service';
import { ThemeService } from '../theme/theme-service';
import { BrandSettings, BrandSettingsDto, mapBrandSettings } from './brand-settings';

/**
 * Loads the brand/theme settings once at startup, applies the theme tokens and locale,
 * and exposes the brand to the whole app via signals.
 */
@Injectable({ providedIn: 'root' })
export class SettingsStore {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly theme = inject(ThemeService);
  private readonly translations = inject(TranslationService);

  private readonly brandSignal = signal<BrandSettings | null>(null);

  readonly brand = this.brandSignal.asReadonly();
  readonly whatsappNumber = computed(() => this.brandSignal()?.whatsappNumber ?? '');

  async load(): Promise<void> {
    try {
      const dto = await firstValueFrom(
        this.http.get<BrandSettingsDto>(`${this.apiBaseUrl}/api/v1/settings`),
      );
      const brand = mapBrandSettings(dto);
      this.brandSignal.set(brand);
      // Effective theme = frontend defaults + brand overrides (see default-theme.ts).
      this.theme.apply(brand.themeTokens);
      this.translations.setLocale(brand.defaultLocale);
    } catch {
      // Storefront still renders with the default (florist) tokens if settings fail.
      this.theme.resetToDefaults();
    }
  }
}
