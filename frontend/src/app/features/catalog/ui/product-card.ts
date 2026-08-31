import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TPipe } from '../../../core/i18n/t-pipe';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
import { MoneyPipe } from '../../../shared/pipes/money-pipe';
import { Product } from '../domain/catalog-models';

/** Presentational product card: image, name, price (with discount) and offer badge. */
@Component({
  selector: 'app-product-card',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, BadgeComponent, MoneyPipe, TPipe],
  template: `
    <a
      [routerLink]="['/producto', product().id]"
      class="group block overflow-hidden rounded-lg border border-muted bg-surface-2 transition-shadow hover:shadow-md focus-visible:shadow-md"
    >
      <div class="relative aspect-[4/5] overflow-hidden bg-muted">
        @if (product().images.length > 0) {
          <img
            [src]="product().images[0]"
            [alt]="product().name"
            loading="lazy"
            class="h-full w-full object-cover transition-transform duration-200 group-hover:scale-105"
          />
        }
        @if (product().price.hasDiscount) {
          <div class="absolute left-2 top-2">
            <app-badge tone="offer">{{ 'product.offerBadge' | t }}</app-badge>
          </div>
        }
      </div>

      <div class="p-3">
        <p class="text-xs text-fg-muted">{{ product().categoryName }}</p>
        <h3 class="mt-0.5 line-clamp-2 text-sm font-semibold text-fg">{{ product().name }}</h3>

        <div class="mt-2 flex items-baseline gap-2">
          <span class="text-base font-bold text-fg">
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
