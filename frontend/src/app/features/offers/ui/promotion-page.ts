import { ChangeDetectionStrategy, Component, OnInit, inject, input, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideArrowLeft } from '@lucide/angular';
import { TPipe } from '../../../core/i18n/t-pipe';
import { OfferBanner, Product } from '../../catalog/domain/catalog-models';
import { CatalogRepository } from '../../catalog/infrastructure/catalog-repository';
import { ProductCardComponent } from '../../catalog/ui/product-card';
import { OfferBannerComponent } from './offer-banner';

/** Products that apply to a single promotion (offer), paged for large catalogs. */
@Component({
  selector: 'app-promotion-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, LucideArrowLeft, ProductCardComponent, OfferBannerComponent, TPipe],
  template: `
    <div class="mx-auto max-w-6xl px-4 py-6">
      <a routerLink="/" class="inline-flex items-center gap-1 text-sm text-fg-muted hover:text-fg">
        <svg lucideArrowLeft [size]="16"></svg>
        {{ 'promotion.back' | t }}
      </a>

      @if (banner(); as b) {
        <div class="mt-4">
          <app-offer-banner [offer]="b" />
        </div>
      }

      <div class="mt-6">
        @if (loading()) {
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            @for (skeleton of skeletons; track skeleton) {
              <div class="aspect-[4/5] animate-pulse rounded-lg bg-surface-2"></div>
            }
          </div>
        } @else if (products().length === 0) {
          <div class="rounded-lg border border-muted bg-surface-2 p-8 text-center">
            <p class="text-sm text-fg-muted">{{ 'promotion.empty' | t }}</p>
          </div>
        } @else {
          <div class="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            @for (product of products(); track product.id) {
              <app-product-card [product]="product" />
            }
          </div>

          @if (totalPages() > 1) {
            <div class="mt-8 flex items-center justify-center gap-4">
              <button
                type="button"
                (click)="prev()"
                [disabled]="page() === 1"
                class="cursor-pointer rounded-md border border-muted px-4 py-2 text-sm text-fg hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {{ 'promotion.prev' | t }}
              </button>
              <span class="text-sm text-fg-muted">
                {{ 'promotion.page' | t: { page: page(), total: totalPages() } }}
              </span>
              <button
                type="button"
                (click)="next()"
                [disabled]="page() === totalPages()"
                class="cursor-pointer rounded-md border border-muted px-4 py-2 text-sm text-fg hover:bg-surface-2 disabled:cursor-not-allowed disabled:opacity-40"
              >
                {{ 'promotion.next' | t }}
              </button>
            </div>
          }
        }
      </div>
    </div>
  `,
})
export class PromotionPage implements OnInit {
  private readonly repository = inject(CatalogRepository);

  readonly offerId = input.required<string>();

  protected readonly banner = signal<OfferBanner | null>(null);
  protected readonly products = signal<Product[]>([]);
  protected readonly loading = signal<boolean>(true);
  protected readonly page = signal<number>(1);
  protected readonly totalPages = signal<number>(1);
  protected readonly skeletons = Array.from({ length: 8 });

  ngOnInit(): void {
    this.repository.getOfferBanner(this.offerId()).subscribe({
      next: (banner) => this.banner.set(banner),
      error: () => this.banner.set(null),
    });

    this.load(1);
  }

  load(page: number): void {
    this.loading.set(true);
    this.repository.getProductsByOffer(this.offerId(), page).subscribe({
      next: (paged) => {
        this.products.set(paged.items);
        this.page.set(paged.page);
        this.totalPages.set(Math.max(1, paged.totalPages));
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  prev(): void {
    if (this.page() > 1) {
      this.load(this.page() - 1);
      this.scrollToTop();
    }
  }

  next(): void {
    if (this.page() < this.totalPages()) {
      this.load(this.page() + 1);
      this.scrollToTop();
    }
  }

  private scrollToTop(): void {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}
