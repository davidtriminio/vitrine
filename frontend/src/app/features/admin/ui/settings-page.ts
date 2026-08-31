import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { FormField, form, pattern, required } from '@angular/forms/signals';
import { AppError } from '../../../core/errors/app-error';
import { TranslationKey } from '../../../core/i18n/es';
import { TPipe } from '../../../core/i18n/t-pipe';
import { TranslationService } from '../../../core/i18n/translation-service';
import { SettingsStore } from '../../../core/settings/settings-store';
import { DEFAULT_THEME, resolveTheme } from '../../../core/theme/default-theme';
import { ThemeService } from '../../../core/theme/theme-service';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { AdminRepository } from '../infrastructure/admin-repository';
import { BrandSettingsUpdate } from '../infrastructure/settings-admin';
import { AdminNavComponent } from './admin-nav';
import { ImageInputComponent } from './image-input';

interface SettingsFormModel {
  brandName: string;
  whatsappNumber: string;
  logoUrl: string;
  heroTitle: string;
  heroSubtitle: string;
  heroImageUrl: string;
}

// Display order for the editable theme tokens.
const THEME_FIELDS: string[] = [
  'primary',
  'primary-strong',
  'primary-fg',
  'accent',
  'accent-strong',
  'accent-fg',
  'surface',
  'surface-2',
  'muted',
  'fg',
  'fg-muted',
  'ring',
];

@Component({
  selector: 'app-settings-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, ButtonComponent, AdminNavComponent, ImageInputComponent, TPipe],
  template: `
    <div class="mx-auto max-w-3xl px-4 py-6">
      <app-admin-nav />
      <h1 class="mt-6 text-2xl font-bold text-fg">{{ 'admin.settings' | t }}</h1>

      <!-- Brand -->
      <section class="mt-6 rounded-lg border border-muted bg-surface p-4">
        <h2 class="text-sm font-bold text-fg">{{ 'admin.settingsBrand' | t }}</h2>
        <div class="mt-4 space-y-4">
          <div>
            <label for="brandName" class="text-sm font-medium text-fg">{{ 'admin.brandName' | t }}</label>
            <input id="brandName" [formField]="settingsForm.brandName" [class]="inputClass" />
          </div>
          <div>
            <label for="whatsapp" class="text-sm font-medium text-fg">{{ 'admin.whatsappNumber' | t }}</label>
            <input id="whatsapp" inputmode="numeric" [formField]="settingsForm.whatsappNumber" [class]="inputClass" />
            <p class="mt-1 text-xs text-fg-muted">{{ 'admin.whatsappHint' | t }}</p>
          </div>
          <app-image-input
            [label]="'admin.logoUrl' | t"
            [value]="settingsForm.logoUrl().value()"
            (valueChange)="setLogo($event)"
          />
        </div>
      </section>

      <!-- Hero -->
      <section class="mt-6 rounded-lg border border-muted bg-surface p-4">
        <h2 class="text-sm font-bold text-fg">{{ 'admin.settingsHero' | t }}</h2>
        <div class="mt-4 space-y-4">
          <div>
            <label for="heroTitle" class="text-sm font-medium text-fg">{{ 'admin.heroTitle' | t }}</label>
            <input id="heroTitle" [formField]="settingsForm.heroTitle" [class]="inputClass" />
          </div>
          <div>
            <label for="heroSubtitle" class="text-sm font-medium text-fg">{{ 'admin.heroSubtitle' | t }}</label>
            <input id="heroSubtitle" [formField]="settingsForm.heroSubtitle" [class]="inputClass" />
          </div>
          <app-image-input
            [label]="'admin.heroImageUrl' | t"
            [value]="settingsForm.heroImageUrl().value()"
            (valueChange)="setHeroImage($event)"
          />
        </div>
      </section>

      <!-- Theme colors -->
      <section class="mt-6 rounded-lg border border-muted bg-surface p-4">
        <div class="flex items-center justify-between">
          <h2 class="text-sm font-bold text-fg">{{ 'admin.settingsTheme' | t }}</h2>
          <button type="button" (click)="restoreDefaults()" class="text-xs font-medium text-primary-strong hover:underline">
            {{ 'admin.restoreDefaults' | t }}
          </button>
        </div>
        <div class="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          @for (field of themeFields; track field) {
            <label class="flex items-center justify-between gap-3 rounded-md border border-muted/60 bg-surface-2 px-3 py-2">
              <span class="text-sm text-fg">{{ label(field) }}</span>
              <span class="flex items-center gap-2">
                <span class="text-xs text-fg-muted">{{ themeTokens()[field] }}</span>
                <input
                  type="color"
                  class="h-8 w-10 cursor-pointer rounded border border-muted bg-transparent"
                  [value]="themeTokens()[field]"
                  (input)="setToken(field, asValue($event))"
                />
              </span>
            </label>
          }
        </div>
      </section>

      @if (savedMessage()) {
        <p class="mt-4 text-sm text-success">{{ savedMessage() }}</p>
      }
      @if (errorMessage()) {
        <p class="mt-4 text-sm text-danger">{{ errorMessage() }}</p>
      }

      <div class="mt-6">
        <app-button [loading]="submitting()" [disabled]="settingsForm().invalid()" (click)="submit()">
          {{ 'admin.save' | t }}
        </app-button>
      </div>
    </div>
  `,
})
export class SettingsPage implements OnInit {
  private readonly repository = inject(AdminRepository);
  private readonly theme = inject(ThemeService);
  private readonly settingsStore = inject(SettingsStore);
  private readonly translations = inject(TranslationService);

  protected readonly themeFields = THEME_FIELDS;
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly savedMessage = signal<string | null>(null);
  protected readonly inputClass =
    'mt-1 w-full rounded-md border border-muted bg-surface-2 px-3 py-2.5 text-sm text-fg focus-visible:border-primary-strong';

  protected readonly themeTokens = signal<Record<string, string>>({ ...DEFAULT_THEME });

  private readonly model = signal<SettingsFormModel>({
    brandName: '',
    whatsappNumber: '',
    logoUrl: '',
    heroTitle: '',
    heroSubtitle: '',
    heroImageUrl: '',
  });

  protected readonly settingsForm = form(this.model, (path) => {
    required(path.brandName);
    required(path.whatsappNumber);
    pattern(path.whatsappNumber, /^\d+$/, { message: 'admin.whatsappHint' });
  });

  ngOnInit(): void {
    this.repository.getSettings().subscribe({
      next: (brand) => {
        this.model.set({
          brandName: brand.brandName,
          whatsappNumber: brand.whatsappNumber,
          logoUrl: brand.logoUrl,
          heroTitle: brand.hero.title ?? '',
          heroSubtitle: brand.hero.subtitle ?? '',
          heroImageUrl: brand.hero.imageUrl ?? '',
        });
        this.themeTokens.set(resolveTheme(brand.themeTokens));
      },
      error: (error: AppError) => this.errorMessage.set(error.title),
    });
  }

  label(tokenKey: string): string {
    return this.translations.t(`theme.${tokenKey}` as TranslationKey);
  }

  asValue(event: Event): string {
    return (event.target as HTMLInputElement).value;
  }

  setToken(tokenKey: string, value: string): void {
    this.themeTokens.update((tokens) => ({ ...tokens, [tokenKey]: value }));
    this.theme.apply(this.themeTokens()); // live preview across the app
  }

  restoreDefaults(): void {
    this.themeTokens.set({ ...DEFAULT_THEME });
    this.theme.resetToDefaults();
  }

  setLogo(url: string): void {
    this.model.update((current) => ({ ...current, logoUrl: url }));
  }

  setHeroImage(url: string): void {
    this.model.update((current) => ({ ...current, heroImageUrl: url }));
  }

  submit(): void {
    if (this.settingsForm().invalid()) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);
    this.savedMessage.set(null);

    const values = this.model();
    const request: BrandSettingsUpdate = {
      brandName: values.brandName,
      whatsappNumber: values.whatsappNumber,
      logoUrl: values.logoUrl.trim(),
      defaultLocale: 'es',
      themeTokens: this.themeTokens(),
      heroTitle: values.heroTitle.trim() || null,
      heroSubtitle: values.heroSubtitle.trim() || null,
      heroImageUrl: values.heroImageUrl.trim() || null,
    };

    this.repository.updateSettings(request).subscribe({
      next: () => {
        this.submitting.set(false);
        this.savedMessage.set(this.translations.t('admin.settingsSaved'));
        void this.settingsStore.load(); // re-sync brand/theme across the storefront
      },
      error: (error: AppError) => {
        this.submitting.set(false);
        this.errorMessage.set(error.detail ?? error.title);
      },
    });
  }
}
