import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideTag } from '@lucide/angular';
import { TPipe } from '../../../core/i18n/t-pipe';
import { Category, OfferBanner } from '../domain/catalog-models';

/**
 * Storefront sidebar: an "Ofertas" widget (active promotions as links) plus a
 * category navigation list. Presentational — filter state is owned by the container.
 */
@Component({
  selector: 'app-sidebar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideTag, TPipe],
  template: `
    <div class="space-y-6">
      <!-- Offers widget -->
      <section class="rounded-lg border border-muted/60 bg-surface p-4 shadow-sm">
        <h2 class="flex items-center gap-2 text-sm font-bold text-fg">
          <svg lucideTag [size]="16" class="text-primary-strong"></svg>
          {{ 'sidebar.offers' | t }}
        </h2>

        @if (offers().length === 0) {
          <p class="mt-3 text-xs text-fg-muted">{{ 'sidebar.noOffers' | t }}</p>
        } @else {
          <ul class="mt-3 space-y-2">
            @for (offer of offers(); track offer.id) {
              <li>
                <a
                  [routerLink]="['/promocion', offer.id]"
                  class="flex items-start gap-3 rounded-md border border-muted/60 bg-surface-2 p-2.5 transition-colors hover:border-primary-strong"
                >
                  <span
                    class="mt-0.5 h-8 w-8 shrink-0 rounded-md"
                    [style.background-color]="offer.bannerBackgroundColor || 'var(--color-primary)'"
                  ></span>
                  <span class="min-w-0">
                    <span class="block truncate text-sm font-semibold text-fg">
                      {{ offer.bannerTitle || offer.name }}
                    </span>
                    @if (offer.bannerSubtitle) {
                      <span class="block truncate text-xs text-fg-muted">
                        {{ offer.bannerSubtitle }}
                      </span>
                    }
                  </span>
                </a>
              </li>
            }
          </ul>
        }
      </section>

      <!-- Category navigation -->
      @if (categories().length > 0) {
        <section class="rounded-lg border border-muted/60 bg-surface p-4 shadow-sm">
          <h2 class="text-sm font-bold text-fg">{{ 'nav.catalog' | t }}</h2>
          <ul class="mt-3 space-y-1">
            <li>
              <button type="button" (click)="selectCategory.emit(null)" [class]="itemClass(activeCategoryId() === null)">
                {{ 'catalog.allCategories' | t }}
              </button>
            </li>
            @for (category of categories(); track category.id) {
              <li>
                <button
                  type="button"
                  (click)="selectCategory.emit(category.id)"
                  [class]="itemClass(activeCategoryId() === category.id)"
                >
                  {{ category.name }}
                </button>
              </li>
            }
          </ul>
        </section>
      }
    </div>
  `,
})
export class SidebarComponent {
  readonly offers = input.required<OfferBanner[]>();
  readonly categories = input.required<Category[]>();
  readonly activeCategoryId = input<string | null>(null);

  readonly selectCategory = output<string | null>();

  itemClass(active: boolean): string {
    const base = 'w-full rounded-md px-3 py-1.5 text-left text-sm transition-colors';
    return active
      ? `${base} bg-primary text-primary-fg font-semibold`
      : `${base} text-fg-muted hover:bg-surface-2 hover:text-fg`;
  }
}
