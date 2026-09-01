import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TPipe } from '../../../core/i18n/t-pipe';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
import { OfferIconComponent } from '../../../shared/ui/offer-icon/offer-icon';
import { MoneyPipe } from '../../../shared/pipes/money-pipe';
import { Product } from '../domain/catalog-models';

/** Presentational product card: image, name, price (with discount) and offer badge. */
@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BadgeComponent, OfferIconComponent, MoneyPipe, TPipe],
  template: `
    <a
      [routerLink]="['/producto', product().id]"
      class="vibe-card group flex h-full cursor-pointer flex-col overflow-hidden rounded-lg border border-muted/60 bg-surface shadow-sm ring-1 ring-black/[0.02] transition-all duration-200 hover:-translate-y-0.5 hover:border-muted hover:shadow-lg focus-visible:-translate-y-0.5 focus-visible:shadow-lg"
    >
      <div class="relative aspect-[4/5] overflow-hidden bg-surface-2">
        @if (product().images.length > 0) {
          <img
            [src]="product().images[0]"
            [alt]="product().name"
            loading="lazy"
            class="h-full w-full object-cover transition-transform duration-300 ease-out group-hover:scale-105"
          />
        }
        @if (product().price.hasDiscount) {
          <div class="vibe-offer-badge absolute left-3 top-3">
            <app-badge tone="offer">
              @if (product().price.appliedOffer?.iconName; as icon) {
                <app-offer-icon [name]="icon" [size]="13" />
              }
              {{ 'product.offerBadge' | t }}
            </app-badge>
          </div>
        }

        <!-- Reference number: the primary identifier for buyer and seller. -->
        <div class="absolute right-3 top-3">
          <span
            class="inline-flex items-center rounded-md bg-sku px-2.5 py-1 text-xs font-bold tabular-nums tracking-wide text-sku-fg shadow-sm"
          >
            {{ 'product.reference' | t: { sku: product().sku } }}
          </span>
        </div>
      </div>

      <div class="flex flex-1 flex-col p-4">
        <p class="text-[11px] font-medium uppercase tracking-wide text-fg-muted">
          {{ product().categoryName }}
        </p>
        <h3 class="mt-1 line-clamp-2 text-[15px] font-semibold leading-snug text-fg">
          {{ product().name }}
        </h3>

        <div class="mt-auto flex items-baseline gap-2 pt-3">
          <span class="text-lg font-bold tracking-tight text-fg">
            {{ product().price.finalPrice | money }}
          </span>
          @if (product().price.hasDiscount) {
            <span class="text-xs text-fg-muted line-through">
              {{ product().price.basePrice | money }}
            </span>
          }
        </div>
      </div>
    </a>
  `,
})
export class ProductCardComponent {
  readonly product = input.required<Product>();
}
