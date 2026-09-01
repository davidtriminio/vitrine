import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormField, form, required } from '@angular/forms/signals';
import { AppError } from '../../../core/errors/app-error';
import { TPipe } from '../../../core/i18n/t-pipe';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { OfferIconComponent, OFFER_ICONS } from '../../../shared/ui/offer-icon/offer-icon';
import { Category } from '../../catalog/domain/catalog-models';
import { AdminRepository } from '../infrastructure/admin-repository';
import { OfferWriteRequest } from '../infrastructure/offer-admin';
import { ImageInputComponent } from './image-input';

interface ProductPick {
  id: string;
  name: string;
  image: string | null;
}

const PRODUCT_PICK_PAGE_SIZE = 8;

interface OfferFormModel {
  name: string;
  discountType: string;
  value: number;
  categoryIds: string[];
  productIds: string[];
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  iconName: string;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerBackgroundColor: string;
  bannerImageUrl: string;
  detailBackgroundImageUrl: string;
  detailBackgroundImageOpacity: number;
}

/** Converts an ISO instant to the value a datetime-local input expects. */
function toLocalInput(iso: string): string {
  const date = new Date(iso);
  const pad = (n: number): string => `${n}`.padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function defaultModel(): OfferFormModel {
  const now = new Date();
  const end = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
  return {
    name: '',
    discountType: 'Percentage',
    value: 10,
    categoryIds: [],
    productIds: [],
    startsAt: toLocalInput(now.toISOString()),
    endsAt: toLocalInput(end.toISOString()),
    isActive: true,
    iconName: '',
    bannerTitle: '',
    bannerSubtitle: '',
    bannerBackgroundColor: '',
    bannerImageUrl: '',
    detailBackgroundImageUrl: '',
    detailBackgroundImageOpacity: 15,
  };
}

@Component({
  selector: 'app-offer-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormField, ButtonComponent, ImageInputComponent, OfferIconComponent, TPipe],
  template: `
    <div class="mx-auto max-w-2xl px-4 py-6">
      <h1 class="text-2xl font-bold text-fg">
        {{ (isEdit() ? 'admin.editOffer' : 'admin.newOffer') | t }}
      </h1>

      <div class="mt-6 space-y-4">
        <div>
          <label for="name" class="text-sm font-medium text-fg">{{ 'admin.offerName' | t }}</label>
          <input id="name" [formField]="offerForm.name" [class]="inputClass" />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="discountType" class="text-sm font-medium text-fg">
              {{ 'admin.discountType' | t }}
            </label>
            <select id="discountType" [formField]="offerForm.discountType" [class]="inputClass">
              <option value="Percentage">{{ 'admin.discountPercentage' | t }}</option>
              <option value="FixedAmount">{{ 'admin.discountFixed' | t }}</option>
            </select>
          </div>
          <div>
            <label for="value" class="text-sm font-medium text-fg">{{ 'admin.value' | t }}</label>
            <input id="value" type="number" [formField]="offerForm.value" [class]="inputClass" />
          </div>
        </div>

        <!-- Targets: whole categories and/or specific products ("ramos"). -->
        <fieldset class="rounded-lg border border-muted p-4">
          <legend class="px-1 text-sm font-semibold text-fg-muted">{{ 'admin.target' | t }}</legend>

          <div class="grid gap-4 sm:grid-cols-2">
            <div>
              <p class="text-sm font-medium text-fg">{{ 'admin.targetCategories' | t }}</p>
              <div class="mt-2 max-h-44 space-y-1 overflow-y-auto rounded-md border border-muted bg-surface-2 p-2">
                @for (category of categories(); track category.id) {
                  <label class="flex cursor-pointer items-center gap-2 rounded px-1 py-0.5 text-sm text-fg hover:bg-muted/40">
                    <input
                      type="checkbox"
                      [checked]="model().categoryIds.includes(category.id)"
                      (change)="toggleCategory(category.id)"
                    />
                    {{ category.name }}
                  </label>
                } @empty {
                  <p class="px-1 text-xs text-fg-muted">—</p>
                }
              </div>
            </div>

            <div>
              <div class="flex items-center justify-between">
                <p class="text-sm font-medium text-fg">{{ 'admin.targetProducts' | t }}</p>
                @if (selectedProductCount() > 0) {
                  <span class="text-xs font-medium text-primary-strong">
                    {{ selectedProductCount() }} {{ 'admin.selectedCount' | t }}
                  </span>
                }
              </div>

              <input
                type="search"
                [value]="productSearch()"
                (input)="onProductSearch($event)"
                [placeholder]="'admin.searchProducts' | t"
                [class]="inputClass"
              />

              <div class="mt-2 max-h-52 space-y-1 overflow-y-auto rounded-md border border-muted bg-surface-2 p-2">
                @for (product of products(); track product.id) {
                  <label class="flex cursor-pointer items-center gap-2 rounded px-1 py-1 text-sm text-fg hover:bg-muted/40">
                    <input
                      type="checkbox"
                      [checked]="model().productIds.includes(product.id)"
                      (change)="toggleProduct(product.id)"
                    />
                    @if (product.image) {
                      <img [src]="product.image" alt="" loading="lazy" class="h-9 w-9 shrink-0 rounded object-cover" />
                    } @else {
                      <span class="h-9 w-9 shrink-0 rounded bg-muted"></span>
                    }
                    <span class="line-clamp-2 leading-tight">{{ product.name }}</span>
                  </label>
                } @empty {
                  <p class="px-1 text-xs text-fg-muted">
                    {{ productLoading() ? ('app.loading' | t) : '—' }}
                  </p>
                }
              </div>

              @if (productTotalPages() > 1) {
                <div class="mt-2 flex items-center justify-between text-xs text-fg-muted">
                  <button
                    type="button"
                    (click)="prevProductPage()"
                    [disabled]="productPage() === 1"
                    class="cursor-pointer rounded border border-muted px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ‹
                  </button>
                  <span>{{ productPage() }} / {{ productTotalPages() }}</span>
                  <button
                    type="button"
                    (click)="nextProductPage()"
                    [disabled]="productPage() === productTotalPages()"
                    class="cursor-pointer rounded border border-muted px-2 py-1 disabled:cursor-not-allowed disabled:opacity-40"
                  >
                    ›
                  </button>
                </div>
              }
            </div>
          </div>

          @if (!hasTarget()) {
            <p class="mt-2 text-xs text-danger">{{ 'admin.targetRequired' | t }}</p>
          }
        </fieldset>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="startsAt" class="text-sm font-medium text-fg">{{ 'admin.startsAt' | t }}</label>
            <input id="startsAt" type="datetime-local" [formField]="offerForm.startsAt" [class]="inputClass" />
          </div>
          <div>
            <label for="endsAt" class="text-sm font-medium text-fg">{{ 'admin.endsAt' | t }}</label>
            <input id="endsAt" type="datetime-local" [formField]="offerForm.endsAt" [class]="inputClass" />
          </div>
        </div>

        <fieldset class="rounded-lg border border-muted p-4">
          <legend class="px-1 text-sm font-semibold text-fg-muted">Banner</legend>
          <div class="space-y-4">
            <div>
              <p class="text-sm font-medium text-fg">{{ 'admin.offerIcon' | t }}</p>
              <div class="mt-2 flex flex-wrap gap-2">
                <button
                  type="button"
                  (click)="setIcon('')"
                  [class]="iconButtonClass(model().iconName === '')"
                  [attr.aria-label]="'admin.iconNone' | t"
                >
                  ✕
                </button>
                @for (icon of icons; track icon) {
                  <button
                    type="button"
                    (click)="setIcon(icon)"
                    [class]="iconButtonClass(model().iconName === icon)"
                    [attr.aria-label]="icon"
                  >
                    <app-offer-icon [name]="icon" [size]="18" />
                  </button>
                }
              </div>
            </div>

            <div>
              <label for="bannerTitle" class="text-sm font-medium text-fg">
                {{ 'admin.bannerTitle' | t }}
              </label>
              <input id="bannerTitle" [formField]="offerForm.bannerTitle" [class]="inputClass" />
            </div>
            <div>
              <label for="bannerSubtitle" class="text-sm font-medium text-fg">
                {{ 'admin.bannerSubtitle' | t }}
              </label>
              <input id="bannerSubtitle" [formField]="offerForm.bannerSubtitle" [class]="inputClass" />
            </div>
            <div class="grid gap-4 sm:grid-cols-2">
              <div>
                <label for="bannerColor" class="text-sm font-medium text-fg">
                  {{ 'admin.bannerColor' | t }}
                </label>
                <div class="mt-1 flex items-center gap-2">
                  <input
                    type="color"
                    class="h-10 w-12 shrink-0 cursor-pointer rounded border border-muted bg-transparent"
                    [value]="offerForm.bannerBackgroundColor().value() || '#f099be'"
                    (input)="setBannerColor($event)"
                  />
                  <input id="bannerColor" placeholder="#f099be" [formField]="offerForm.bannerBackgroundColor" [class]="inputClass" />
                </div>
              </div>
              <app-image-input
                [label]="'admin.bannerImage' | t"
                [value]="offerForm.bannerImageUrl().value()"
                (valueChange)="setBannerImage($event)"
              />
            </div>

            <!-- Second image: distinct background for the offer detail page, tiled as a
                 translucent pattern so the detail view feels different from the home. -->
            <div class="rounded-md border border-dashed border-muted p-3">
              <app-image-input
                [label]="'admin.detailBackgroundImage' | t"
                [value]="offerForm.detailBackgroundImageUrl().value()"
                (valueChange)="setDetailBackgroundImage($event)"
              />
              <p class="mt-1 text-xs text-fg-muted">{{ 'admin.detailBackgroundHint' | t }}</p>

              @if (model().detailBackgroundImageUrl.trim()) {
                <div class="mt-3">
                  <div class="flex items-center justify-between">
                    <label for="detailBgOpacity" class="text-sm font-medium text-fg">
                      {{ 'admin.detailBackgroundOpacity' | t }}
                    </label>
                    <span class="text-sm tabular-nums text-fg-muted">
                      {{ model().detailBackgroundImageOpacity }}%
                    </span>
                  </div>
                  <input
                    id="detailBgOpacity"
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    class="mt-2 w-full cursor-pointer accent-primary-strong"
                    [value]="model().detailBackgroundImageOpacity"
                    (input)="setDetailBackgroundOpacity($event)"
                  />
                </div>
              }
            </div>
          </div>
        </fieldset>

        <label class="flex cursor-pointer items-center gap-2 text-sm text-fg">
          <input type="checkbox" [formField]="offerForm.isActive" />
          {{ 'admin.active' | t }}
        </label>

        @if (errorMessage()) {
          <p class="text-sm text-danger">{{ errorMessage() }}</p>
        }

        <div class="flex gap-2">
          <app-button [loading]="submitting()" [disabled]="offerForm().invalid() || !hasTarget()" (click)="submit()">
            {{ 'admin.save' | t }}
          </app-button>
          <a
            routerLink="/admin/ofertas"
            class="inline-flex cursor-pointer items-center rounded-md border border-muted px-4 py-2.5 text-sm text-fg-muted hover:text-fg"
          >
            {{ 'admin.cancel' | t }}
          </a>
        </div>
      </div>
    </div>
  `,
})
export class OfferFormPage implements OnInit {
  private readonly repository = inject(AdminRepository);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly icons = OFFER_ICONS;
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEdit = computed(() => !!this.id());
  protected readonly inputClass =
    'mt-1 w-full rounded-md border border-muted bg-surface-2 px-3 py-2.5 text-sm text-fg focus-visible:border-primary-strong';

  protected readonly categories = signal<Category[]>([]);
  protected readonly products = signal<ProductPick[]>([]);
  protected readonly productSearch = signal('');
  protected readonly productPage = signal(1);
  protected readonly productTotalPages = signal(1);
  protected readonly productLoading = signal(false);
  protected readonly selectedProductCount = computed(() => this.model().productIds.length);

  protected readonly model = signal<OfferFormModel>(defaultModel());
  protected readonly offerForm = form(this.model, (path) => {
    required(path.name);
  });

  protected readonly hasTarget = computed(
    () => this.model().categoryIds.length > 0 || this.model().productIds.length > 0,
  );

  ngOnInit(): void {
    this.repository.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([]),
    });
    this.loadProducts();

    const editId = this.id();
    if (editId) {
      this.repository.getOffer(editId).subscribe({
        next: (offer) => {
          this.model.set({
            name: offer.name,
            discountType: offer.discountType,
            value: offer.value,
            categoryIds: offer.categoryIds,
            productIds: offer.productIds,
            startsAt: toLocalInput(offer.startsAt),
            endsAt: toLocalInput(offer.endsAt),
            isActive: offer.isActive,
            iconName: offer.iconName ?? '',
            bannerTitle: offer.bannerTitle ?? '',
            bannerSubtitle: offer.bannerSubtitle ?? '',
            bannerBackgroundColor: offer.bannerBackgroundColor ?? '',
            bannerImageUrl: offer.bannerImageUrl ?? '',
            detailBackgroundImageUrl: offer.detailBackgroundImageUrl ?? '',
            detailBackgroundImageOpacity:
              offer.detailBackgroundImageOpacity == null
                ? 15
                : Math.round(offer.detailBackgroundImageOpacity * 100),
          });
        },
        error: (error: AppError) => this.errorMessage.set(error.title),
      });
    }
  }

  loadProducts(): void {
    this.productLoading.set(true);
    this.repository
      .getProducts(this.productPage(), this.productSearch(), PRODUCT_PICK_PAGE_SIZE)
      .subscribe({
        next: (paged) => {
          this.products.set(paged.items.map((p) => ({ id: p.id, name: p.name, image: p.images[0] ?? null })));
          this.productTotalPages.set(Math.max(1, paged.totalPages));
          this.productLoading.set(false);
        },
        error: () => {
          this.products.set([]);
          this.productLoading.set(false);
        },
      });
  }

  onProductSearch(event: Event): void {
    this.productSearch.set((event.target as HTMLInputElement).value);
    this.productPage.set(1);
    this.loadProducts();
  }

  prevProductPage(): void {
    if (this.productPage() > 1) {
      this.productPage.update((p) => p - 1);
      this.loadProducts();
    }
  }

  nextProductPage(): void {
    if (this.productPage() < this.productTotalPages()) {
      this.productPage.update((p) => p + 1);
      this.loadProducts();
    }
  }

  protected iconButtonClass(selected: boolean): string {
    return [
      'inline-flex h-9 w-9 cursor-pointer items-center justify-center rounded-md border text-fg',
      selected ? 'border-primary-strong bg-primary/20' : 'border-muted bg-surface-2 hover:bg-muted/40',
    ].join(' ');
  }

  toggleCategory(id: string): void {
    this.model.update((m) => ({ ...m, categoryIds: toggle(m.categoryIds, id) }));
  }

  toggleProduct(id: string): void {
    this.model.update((m) => ({ ...m, productIds: toggle(m.productIds, id) }));
  }

  setIcon(icon: string): void {
    this.model.update((m) => ({ ...m, iconName: icon }));
  }

  setBannerImage(url: string): void {
    this.model.update((current) => ({ ...current, bannerImageUrl: url }));
  }

  setBannerColor(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.model.update((current) => ({ ...current, bannerBackgroundColor: value }));
  }

  setDetailBackgroundImage(url: string): void {
    this.model.update((current) => ({ ...current, detailBackgroundImageUrl: url }));
  }

  setDetailBackgroundOpacity(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);
    this.model.update((current) => ({ ...current, detailBackgroundImageOpacity: value }));
  }

  submit(): void {
    if (this.offerForm().invalid() || !this.hasTarget()) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const values = this.model();
    const request: OfferWriteRequest = {
      name: values.name,
      discountType: values.discountType,
      value: Number(values.value),
      categoryIds: values.categoryIds,
      productIds: values.productIds,
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: new Date(values.endsAt).toISOString(),
      isActive: values.isActive,
      iconName: values.iconName.trim() || null,
      bannerTitle: values.bannerTitle.trim() || null,
      bannerSubtitle: values.bannerSubtitle.trim() || null,
      bannerBackgroundColor: values.bannerBackgroundColor.trim() || null,
      bannerImageUrl: values.bannerImageUrl.trim() || null,
      detailBackgroundImageUrl: values.detailBackgroundImageUrl.trim() || null,
      // Opacity only matters with a detail background; persist as a 0..1 fraction.
      detailBackgroundImageOpacity: values.detailBackgroundImageUrl.trim()
        ? values.detailBackgroundImageOpacity / 100
        : null,
    };

    const editId = this.id();
    const request$ = editId
      ? this.repository.updateOffer(editId, request)
      : this.repository.createOffer(request);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigate(['/admin/ofertas']);
      },
      error: (error: AppError) => {
        this.submitting.set(false);
        this.errorMessage.set(error.detail ?? error.title);
      },
    });
  }
}

/** Adds or removes an id from a string array (immutably). */
function toggle(list: string[], id: string): string[] {
  return list.includes(id) ? list.filter((x) => x !== id) : [...list, id];
}
