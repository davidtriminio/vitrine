import { ChangeDetectionStrategy, Component, computed, inject, input, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { FormField, form } from '@angular/forms/signals';
import { LucideArrowLeft, LucideMessageCircle } from '@lucide/angular';
import { AppError } from '../../../core/errors/app-error';
import { TPipe } from '../../../core/i18n/t-pipe';
import { SettingsStore } from '../../../core/settings/settings-store';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
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
    LucideMessageCircle,
    BadgeComponent,
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

              <a
                [href]="whatsappLink()"
                target="_blank"
                rel="noopener"
                class="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-fg transition-colors hover:bg-accent-strong sm:w-auto"
              >
                <svg lucideMessageCircle [size]="18"></svg>
                {{ 'product.contactWhatsapp' | t }}
              </a>
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

  readonly id = input.required<string>();

  protected readonly product = signal<Product | null>(null);
  protected readonly loading = signal<boolean>(true);
  protected readonly error = signal<AppError | null>(null);

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
      },
      error: (error: AppError) => {
        this.error.set(error);
        this.loading.set(false);
      },
    });
  }
}
