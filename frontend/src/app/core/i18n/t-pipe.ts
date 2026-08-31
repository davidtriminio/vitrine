import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslationKey } from './es';
import { TranslationService } from './translation-service';

/** Usage: {{ 'catalog.title' | t }} or {{ 'offer.discountPercent' | t: { value: 15 } }} */
@Pipe({ name: 't', pure: true })
export class TPipe implements PipeTransform {
  private readonly translations = inject(TranslationService);

  transform(key: TranslationKey, params?: Record<string, string | number>): string {
    // Read the locale signal so the pipe re-evaluates when it changes.
    this.translations.locale();
    return this.translations.t(key, params);
  }
}
