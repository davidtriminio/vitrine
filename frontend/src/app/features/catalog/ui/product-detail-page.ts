import { ChangeDetectionStrategy, Component, computed, inject, input, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Meta, Title } from '@angular/platform-browser';
import { FormField, form } from '@angular/forms/signals';
import { LucideArrowLeft, LucideShare2 } from '@lucide/angular';
import { API_BASE_URL } from '../../../core/config/app-config';
import { AppError } from '../../../core/errors/app-error';
import { TPipe } from '../../../core/i18n/t-pipe';
import { TranslationService } from '../../../core/i18n/translation-service';
import { SettingsStore } from '../../../core/settings/settings-store';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
import { WhatsappIconComponent } from '../../../shared/ui/whatsapp-icon/whatsapp-icon';
import { MoneyPipe } from '../../../shared/pipes/money-pipe';
import { Product } from '../domain/catalog-models';
import { CatalogRepository } from '../infrastructure/catalog-repository';
import { WhatsappService } from '../application/whatsapp-service';

/** Smart container for a single product, with the WhatsApp contact form. */
@Component({
  selector: 'app-product-detail-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    FormField,
    LucideArrowLeft,
    LucideShare2,
    BadgeComponent,
    WhatsappIconComponent,
    MoneyPipe,
    TPipe,
  ],
  template: `
    <div class="mx-auto max-w-5xl px-4 py-6">
      <a
        routerLink="/"
        class="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg"
      >
        <svg lucideArrowLeft [size]="16"></svg>
        {{ 'product.backToCatalog' | t }}
      </a>

      @if (loading()) {
        <div class="mt-6 grid gap-8 md:grid-cols-2">
          <div class="aspect-[4/5] animate-pulse rounded-lg bg-surface-2"></div>
          <div class="space-y-3">
            <div class="h-8 w-2/3 animate-pulse rounded bg-surface-2"></div>
            <div class="h-4 w-full animate-pulse rounded bg-surface-2"></div>
          </div>
        </div>
      } @else if (product(); as p) {
        <div class="mt-6 grid gap-8 md:grid-cols-2">
          <div class="overflow-hidden rounded-lg bg-muted">
            @if (p.images.length > 0) {
              <img [src]="p.images[0]" [alt]="p.name" class="aspect-[4/5] w-full object-cover" />
            }
          </div>

          <div>
            <p class="text-sm text-fg-muted">{{ p.categoryName }}</p>
            <h1 class="mt-1 text-2xl font-bold text-fg sm:text-3xl">{{ p.name }}</h1>
            <!-- Reference number: the primary identifier for buyer and seller. -->
            <span
              class="mt-2 inline-flex items-center rounded-lg bg-sku px-3 py-1 text-sm font-bold tabular-nums tracking-wide text-sku-fg shadow-sm"
            >
              {{ 'product.reference' | t: { sku: p.sku } }}
            </span>

            <div class="mt-3 flex items-center gap-3">
              <span class="text-2xl font-bold text-fg">{{ p.price.finalPrice | money }}</span>
              @if (p.price.hasDiscount) {
                <span class="text-base text-fg-muted line-through">
                  {{ p.price.basePrice | money }}
                </span>
                <app-badge tone="offer">{{ 'product.offerBadge' | t }}</app-badge>
              }
            </div>

            @if (p.description) {
              <p class="mt-4 text-sm leading-relaxed text-fg-muted">{{ p.description }}</p>
            }

            @if (p.attributes.length > 0) {
              <div class="mt-5">
                <h2 class="text-sm font-semibold text-fg">{{ 'product.characteristics' | t }}</h2>
                <dl class="mt-2 grid grid-cols-2 gap-2 text-sm">
                  @for (attr of p.attributes; track attr.key) {
                    <div class="rounded-md border border-muted bg-surface-2 px-3 py-2">
                      <dt class="text-xs text-fg-muted">{{ attr.key }}</dt>
                      <dd class="font-medium text-fg">{{ attr.value }}</dd>
                    </div>
                  }
                </dl>
              </div>
            }

            <!-- WhatsApp contact form (Signal Forms) -->
            <div class="mt-6">
              <label for="message" class="text-sm font-semibold text-fg">
                {{ 'product.messageLabel' | t }}
              </label>
              <textarea
                id="message"
                [formField]="contactForm.message"
                [placeholder]="'product.messagePlaceholder' | t"
                rows="3"
                class="mt-2 w-full rounded-md border border-muted bg-surface-2 px-3 py-2 text-sm text-fg placeholder:text-fg-muted focus-visible:border-primary-strong"
              ></textarea>

              <div class="mt-3 flex flex-col gap-2 sm:flex-row">
                <a
                  [href]="whatsappLink()"
                  target="_blank"
                  rel="noopener"
                  class="inline-flex w-full items-center justify-center gap-2 rounded-md bg-whatsapp px-4 py-3 text-sm font-semibold text-whatsapp-fg transition-colors hover:bg-whatsapp-strong sm:w-auto"
                >
                  <app-whatsapp-icon [size]="18" />
                  {{ 'product.contactWhatsapp' | t }}
                </a>

                <button
                  type="button"
                  (click)="share()"
                  class="inline-flex w-full items-center justify-center gap-2 rounded-md border border-muted px-4 py-3 text-sm font-semibold text-fg transition-colors hover:bg-surface-2 sm:w-auto"
                >
                  <svg lucideShare2 [size]="18"></svg>
                  {{ (copied() ? 'product.shareCopied' : 'product.share') | t }}
                </button>
              </div>
            </div>
          </div>
        </div>
      } @else {
        <div class="mt-10 rounded-lg border border-muted bg-surface-2 p-8 text-center">
          <p class="text-sm text-fg-muted">{{ 'product.notFound' | t }}</p>
        </div>
      }
    </div>
  `,
})
export class ProductDetailPage implements OnInit {
  private readonly repository = inject(CatalogRepository);
  private readonly settings = inject(SettingsStore);
  private readonly whatsapp = inject(WhatsappService);
  private readonly apiBaseUrl = inject(API_BASE_URL);
  private readonly meta = inject(Meta);
  private readonly title = inject(Title);
  private readonly translations = inject(TranslationService);

  readonly id = input.required<string>();

  protected readonly product = signal<Product | null>(null);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<AppError | null>(null);
  protected readonly copied = signal<boolean>(false);

  /**
   * Backend share URL: a server-rendered page carrying Open Graph tags so WhatsApp and
   * other scrapers (which don't run JS) build a preview with the product image. Humans
   * hitting it are redirected to this SPA page.
   */
  protected readonly shareUrl = computed(
    () => `${this.apiBaseUrl}/share/products/${this.id()}`,
  );

  private readonly messageModel = signal({ message: '' });
  protected readonly contactForm = form(this.messageModel);

  protected readonly whatsappLink = computed(() => {
    const currentProduct = this.product();
    if (!currentProduct) {
      return '#';
    }
    return this.whatsapp.buildLink(
      this.settings.whatsappNumber(),
      currentProduct,
      this.messageModel().message,
    );
  });

  ngOnInit(): void {
    this.repository.getProduct(this.id()).subscribe({
      next: (product) => {
        this.product.set(product);
        this.loading.set(false);
        this.updateMeta(product);
      },
      error: (error: AppError) => {
        this.error.set(error);
        this.loading.set(false);
      },
    });
  }

  /**
   * Shares the product via the native share sheet when available, otherwise copies the
   * OG-enabled share link to the clipboard. Uses the share URL so the pasted link renders
   * a rich preview.
   */
  async share(): Promise<void> {
    const currentProduct = this.product();
    if (!currentProduct) {
      return;
    }

    const url = this.shareUrl();
    const shareData: ShareData = { title: currentProduct.name, url };

    if (typeof navigator !== 'undefined' && typeof navigator.share === 'function') {
      try {
        await navigator.share(shareData);
        return;
      } catch {
        // User dismissed the share sheet, or it is unavailable — fall back to copy.
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      try {
        await navigator.clipboard.writeText(url);
        this.copied.set(true);
        setTimeout(() => this.copied.set(false), 2000);
      } catch {
        // Clipboard blocked (e.g. insecure context); nothing else to do.
      }
    }
  }

  /** Sets the page title and Open Graph / Twitter meta for browsers and future SEO. */
  private updateMeta(product: Product): void {
    const brandName = this.settings.brand()?.brandName ?? this.translations.t('app.brandFallback');
    const description =
      product.description?.trim() || `${product.name} — ${brandName}`;
    const image = product.images[0] ?? '';

    this.title.setTitle(`${product.name} — ${brandName}`);
    this.meta.updateTag({ name: 'description', content: description });
    this.meta.updateTag({ property: 'og:type', content: 'product' });
    this.meta.updateTag({ property: 'og:site_name', content: brandName });
    this.meta.updateTag({ property: 'og:title', content: product.name });
    this.meta.updateTag({ property: 'og:description', content: description });
    this.meta.updateTag({ property: 'og:url', content: this.shareUrl() });
    if (image) {
      this.meta.updateTag({ property: 'og:image', content: image });
      this.meta.updateTag({ name: 'twitter:image', content: image });
    }
    this.meta.updateTag({ name: 'twitter:card', content: 'summary_large_image' });
    this.meta.updateTag({ name: 'twitter:title', content: product.name });
    this.meta.updateTag({ name: 'twitter:description', content: description });
  }
}
