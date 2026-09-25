import { Injectable, inject } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';
import { TranslationKey } from '../i18n/es';
import { TranslationService } from '../i18n/translation-service';
import { SettingsStore } from '../settings/settings-store';

/**
 * Builds the tab title as "<Brand> — <Page>" from the route's `title` (an i18n key).
 * An empty page title (home) shows only the brand. Routes without a `title` are left
 * alone so pages can set their own dynamically (e.g. the product detail).
 */
@Injectable({ providedIn: 'root' })
export class BrandTitleStrategy extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly settings = inject(SettingsStore);
  private readonly translations = inject(TranslationService);

  override updateTitle(snapshot: RouterStateSnapshot): void {
    const pageKey = this.buildTitle(snapshot);
    if (pageKey === undefined) {
      return;
    }

    const brand = this.settings.brand()?.brandName ?? this.translations.t('app.brandFallback');
    const page = pageKey ? this.translations.t(pageKey as TranslationKey) : '';
    this.title.setTitle(page ? `${brand} — ${page}` : brand);
  }
}
