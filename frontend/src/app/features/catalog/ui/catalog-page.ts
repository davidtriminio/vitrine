import { ChangeDetectionStrategy, Component, OnInit, inject } from '@angular/core';
import { LucideSearch } from '@lucide/angular';
import { TPipe } from '../../../core/i18n/t-pipe';
import { SettingsStore } from '../../../core/settings/settings-store';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { OfferBannerComponent } from '../../offers/ui/offer-banner';
import { CatalogStore } from '../application/catalog-store';
import { ProductCardComponent } from './product-card';

/** Smart container for the public catalog: hero, offers, filters and product grid. */
@Component({
  selector: 'app-catalog-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ProductCardComponent,
    OfferBannerComponent,
    ButtonComponent,
    LucideSearch,
    TPipe,
  ],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-6">
      <!-- Search -->
      <label class="relative block">
        <span class="sr-only">{{ 'catalog.searchPlaceholder' | t }}</span>
        <svg
          lucideSearch
          [size]="18"
          class="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-fg-muted"
        ></svg>
        <input
          type="search"
          [placeholder]="'catalog.searchPlaceholder' | t"
          [value]="store.filters().search"
          (input)="onSearch($event)"
          class="w-full rounded-full border border-muted bg-surface-2 py-3 pl-10 pr-4 text-sm text-fg placeholder:text-fg-muted focus-visible:border-primary-strong"
        />
      </label>

      <!-- Hero -->
      @if (settings.brand()?.hero?.title) {
        <div class="mt-5 overflow-hidden rounded-lg bg-primary/20">
          <div class="flex flex-col gap-3 p-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 class="text-2xl font-bold text-fg sm:text-3xl">
                {{ settings.brand()?.hero?.title }}
              </h1>
              @if (settings.brand()?.hero?.subtitle) {
                <p class="mt-1 text-sm text-fg-muted">{{ settings.brand()?.hero?.subtitle }}</p>
              }
            </div>
          </div>
        </div>
      }

      <!-- Offer banners -->
      @if (store.offers().length > 0) {
        <div class="mt-5 grid gap-4">
          @for (offer of store.offers(); track offer.id) {
            <app-offer-banner [offer]="offer" />
          }
        </div>
      }

      <!-- Category chips -->
      <div class="mt-6 flex flex-wrap gap-2">
        <button
          type="button"
          (click)="store.setCategory(null)"
          [class]="chipClass(store.filters().categoryId === null)"
        >
          {{ 'catalog.allCategories' | t }}
        </button>
        @for (category of store.categories(); track category.id) {
          <button
            type="button"
            (click)="store.setCategory(category.id)"
            [class]="chipClass(store.filters().categoryId === category.id)"
          >
            {{ category.name }}
          </button>
        }
        <button
          type="button"
          (click)="store.toggleOnlyOffer()"
          [class]="chipClass(store.filters().onlyOnOffer)"
        >
          {{ 'catalog.onlyOnOffer' | t }}
        </button>
      </div>

      <!-- Grid / states -->
      <div class="mt-6">
        @if (store.loading()) {
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            @for (skeleton of skeletons; track skeleton) {
              <div class="aspect-[4/5] animate-pulse rounded-lg bg-surface-2"></div>
            }
          </div>
        } @else if (store.error()) {
          <div class="rounded-lg border border-muted bg-surface-2 p-8 text-center">
            <p class="text-sm text-fg-muted">{{ 'catalog.error' | t }}</p>
            <div class="mt-4 flex justify-center">
              <app-button (click)="store.loadProducts()">{{ 'catalog.retry' | t }}</app-button>
            </div>
          </div>
        } @else if (store.isEmpty()) {
          <div class="rounded-lg border border-muted bg-surface-2 p-8 text-center">
            <p class="text-sm text-fg-muted">{{ 'catalog.empty' | t }}</p>
          </div>
        } @else {
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            @for (product of store.products(); track product.id) {
              <app-product-card [product]="product" />
            }
          </div>

          @if (store.totalPages() > 1) {
            <div class="mt-8 flex items-center justify-center gap-3">
              <app-button
                variant="secondary"
                [disabled]="store.filters().page <= 1"
                (click)="store.setPage(store.filters().page - 1)"
              >
                ‹
              </app-button>
              <span class="text-sm text-fg-muted">
                {{ store.filters().page }} / {{ store.totalPages() }}
              </span>
              <app-button
                variant="secondary"
                [disabled]="store.filters().page >= store.totalPages()"
                (click)="store.setPage(store.filters().page + 1)"
              >
                ›
              </app-button>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class CatalogPage implements OnInit {
  protected readonly store = inject(CatalogStore);
  protected readonly settings = inject(SettingsStore);
  protected readonly skeletons = Array.from({ length: 8 });

  ngOnInit(): void {
    this.store.loadReferenceData();
    this.store.loadProducts();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.store.setSearch(value);
  }

  chipClass(active: boolean): string {
    const base =
      'rounded-full border px-4 py-1.5 text-sm font-medium transition-colors';
    return active
      ? `${base} border-primary-strong bg-primary text-primary-fg`
      : `${base} border-muted bg-surface-2 text-fg-muted hover:bg-muted`;
  }
}
