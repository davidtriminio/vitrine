import { Injectable, computed, inject, signal } from '@angular/core';
import { AppError } from '../../../core/errors/app-error';
import {
  Category,
  CatalogFilters,
  OfferBanner,
  Product,
  ProductSort,
} from '../domain/catalog-models';
import { CatalogRepository } from '../infrastructure/catalog-repository';

const INITIAL_FILTERS: CatalogFilters = {
  search: '',
  categoryId: null,
  onlyOnOffer: false,
  sort: 'IdAsc',
  page: 1,
};

/** Signals-based store for the public catalog screen. */
@Injectable({ providedIn: 'root' })
export class CatalogStore {
  private readonly repository = inject(CatalogRepository);

  private readonly filtersSignal = signal<CatalogFilters>(INITIAL_FILTERS);
  private readonly productsSignal = signal<Product[]>([]);
  private readonly categoriesSignal = signal<Category[]>([]);
  private readonly offersSignal = signal<OfferBanner[]>([]);
  private readonly totalPagesSignal = signal<number>(1);
  private readonly totalItemsSignal = signal<number>(0);
  private readonly loadingSignal = signal<boolean>(false);
  private readonly errorSignal = signal<AppError | null>(null);

  readonly filters = this.filtersSignal.asReadonly();
  readonly products = this.productsSignal.asReadonly();
  readonly categories = this.categoriesSignal.asReadonly();
  readonly offers = this.offersSignal.asReadonly();
  readonly totalPages = this.totalPagesSignal.asReadonly();
  readonly totalItems = this.totalItemsSignal.asReadonly();
  readonly loading = this.loadingSignal.asReadonly();
  readonly error = this.errorSignal.asReadonly();
  readonly isEmpty = computed(() => !this.loading() && this.products().length === 0);

  /** True when any narrowing filter (search/category/only-offer) is active. */
  readonly hasActiveFilters = computed(() => {
    const f = this.filtersSignal();
    return f.search.trim().length > 0 || f.categoryId !== null || f.onlyOnOffer;
  });

  loadReferenceData(): void {
    this.repository.getCategories().subscribe({
      next: (categories) => this.categoriesSignal.set(categories),
      error: () => this.categoriesSignal.set([]),
    });
    this.repository.getActiveOffers().subscribe({
      next: (offers) => this.offersSignal.set(offers),
      error: () => this.offersSignal.set([]),
    });
  }

  loadProducts(): void {
    this.loadingSignal.set(true);
    this.errorSignal.set(null);

    this.repository.getProducts(this.filtersSignal()).subscribe({
      next: (paged) => {
        this.productsSignal.set(paged.items);
        this.totalPagesSignal.set(paged.totalPages);
        this.totalItemsSignal.set(paged.totalItems);
        this.loadingSignal.set(false);
      },
      error: (error: AppError) => {
        this.errorSignal.set(error);
        this.loadingSignal.set(false);
      },
    });
  }

  setSearch(search: string): void {
    this.filtersSignal.update((f) => ({ ...f, search, page: 1 }));
    this.loadProducts();
  }

  setCategory(categoryId: string | null): void {
    this.filtersSignal.update((f) => ({ ...f, categoryId, page: 1 }));
    this.loadProducts();
  }

  toggleOnlyOffer(): void {
    this.filtersSignal.update((f) => ({ ...f, onlyOnOffer: !f.onlyOnOffer, page: 1 }));
    this.loadProducts();
  }

  setSort(sort: ProductSort): void {
    this.filtersSignal.update((f) => ({ ...f, sort, page: 1 }));
    this.loadProducts();
  }

  /** Resets search, category and only-offer filters (keeps the chosen ordering). */
  clearFilters(): void {
    this.filtersSignal.update((f) => ({
      ...f,
      search: '',
      categoryId: null,
      onlyOnOffer: false,
      page: 1,
    }));
    this.loadProducts();
  }

  setPage(page: number): void {
    this.filtersSignal.update((f) => ({ ...f, page }));
    this.loadProducts();
  }
}
