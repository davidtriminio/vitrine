import { Injectable, signal } from '@angular/core';
import { es, TranslationKey } from './es';

type Dictionary = Record<string, string>;

const DICTIONARIES: Record<string, Dictionary> = {
  es,
};

/**
 * Signals-first i18n. Default locale is Spanish. `t(key, params)` resolves a string,
 * interpolating `{param}` placeholders. No UI text is hardcoded in components.
 */
@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly localeSignal = signal<string>('es');

  readonly locale = this.localeSignal.asReadonly();

  setLocale(locale: string): void {
    if (DICTIONARIES[locale]) {
      this.localeSignal.set(locale);
    }
  }

  t(key: TranslationKey, params?: Record<string, string | number>): string {
    const dictionary = DICTIONARIES[this.localeSignal()] ?? es;
    const template = dictionary[key] ?? key;
    if (!params) {
      return template;
    }
    return template.replace(/\{(\w+)\}/g, (_, name: string) =>
      params[name] !== undefined ? String(params[name]) : `{${name}}`,
    );
  }
}
