import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormField, form, pattern, required } from '@angular/forms/signals';
import { AppError } from '../../../core/errors/app-error';
import { TPipe } from '../../../core/i18n/t-pipe';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { Category, ProductAttribute } from '../../catalog/domain/catalog-models';
import { AdminRepository, ProductWriteRequest } from '../infrastructure/admin-repository';

interface ProductFormModel {
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  basePrice: number;
  imageUrl: string;
  isActive: boolean;
}

const EMPTY_MODEL: ProductFormModel = {
  name: '',
  sku: '',
  description: '',
  categoryId: '',
  basePrice: 0,
  imageUrl: '',
  isActive: true,
};

@Component({
  selector: 'app-product-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormField, ButtonComponent, TPipe],
  template: `
    <div class="mx-auto max-w-2xl px-4 py-6">
      <h1 class="text-2xl font-bold text-fg">
        {{ (isEdit() ? 'admin.editProduct' : 'admin.newProduct') | t }}
      </h1>

      <div class="mt-6 space-y-4">
        <div>
          <label for="name" class="text-sm font-medium text-fg">{{ 'admin.name' | t }}</label>
          <input id="name" [formField]="productForm.name" [class]="inputClass" />
        </div>

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="sku" class="text-sm font-medium text-fg">{{ 'admin.sku' | t }}</label>
            <input
              id="sku"
              inputmode="numeric"
              placeholder="001"
              [formField]="productForm.sku"
              [class]="inputClass"
            />
            <p class="mt-1 text-xs text-fg-muted">{{ 'admin.skuHint' | t }}</p>
          </div>
          <div>
            <label for="basePrice" class="text-sm font-medium text-fg">
              {{ 'admin.basePrice' | t }}
            </label>
            <input
              id="basePrice"
              type="number"
              [formField]="productForm.basePrice"
              [class]="inputClass"
            />
          </div>
        </div>

        <div>
          <label for="category" class="text-sm font-medium text-fg">
            {{ 'admin.category' | t }}
          </label>
          <select id="category" [formField]="productForm.categoryId" [class]="inputClass">
            <option value="" disabled>—</option>
            @for (category of categories(); track category.id) {
              <option [value]="category.id">{{ category.name }}</option>
            }
          </select>
        </div>

        <div>
          <label for="description" class="text-sm font-medium text-fg">
            {{ 'admin.description' | t }}
          </label>
          <textarea
            id="description"
            rows="3"
            [formField]="productForm.description"
            [class]="inputClass"
          ></textarea>
        </div>

        <div>
          <label for="imageUrl" class="text-sm font-medium text-fg">Imagen (URL)</label>
          <input id="imageUrl" [formField]="productForm.imageUrl" [class]="inputClass" />
        </div>

        <label class="flex items-center gap-2 text-sm text-fg">
          <input type="checkbox" [formField]="productForm.isActive" />
          {{ 'admin.active' | t }}
        </label>

        @if (errorMessage()) {
          <p class="text-sm text-danger">{{ errorMessage() }}</p>
        }

        <div class="flex gap-2">
          <app-button
            [loading]="submitting()"
            [disabled]="productForm().invalid()"
            (click)="submit()"
          >
            {{ 'admin.save' | t }}
          </app-button>
          <a
            routerLink="/admin"
            class="inline-flex items-center rounded-md border border-muted px-4 py-2.5 text-sm text-fg-muted hover:text-fg"
          >
            {{ 'admin.cancel' | t }}
          </a>
        </div>
      </div>
    </div>
  `,
})
export class ProductFormPage implements OnInit {
  private readonly repository = inject(AdminRepository);
  private readonly router = inject(Router);

  readonly id = input<string>();

  protected readonly categories = signal<Category[]>([]);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEdit = computed(() => !!this.id());
  protected readonly inputClass =
    'mt-1 w-full rounded-md border border-muted bg-surface-2 px-3 py-2.5 text-sm text-fg focus-visible:border-primary-strong';

  private readonly model = signal<ProductFormModel>({ ...EMPTY_MODEL });
  // Preserved from the loaded product so editing basic fields does not wipe them.
  private existingAttributes: ProductAttribute[] = [];

  protected readonly productForm = form(this.model, (path) => {
    required(path.name);
    required(path.sku);
    pattern(path.sku, /^\d+$/, { message: 'admin.skuInvalid' });
    required(path.categoryId);
  });

  ngOnInit(): void {
    this.repository.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([]),
    });

    const editId = this.id();
    if (editId) {
      this.repository.getProduct(editId).subscribe({
        next: (product) => {
          this.existingAttributes = product.attributes;
          this.model.set({
            name: product.name,
            sku: product.sku,
            description: product.description,
            categoryId: product.categoryId,
            basePrice: product.price.basePrice,
            imageUrl: product.images[0] ?? '',
            isActive: product.isActive,
          });
        },
        error: (error: AppError) => this.errorMessage.set(error.title),
      });
    } else {
      // Suggest the next available numeric SKU for new products.
      this.repository.getNextSku().subscribe({
        next: (sku) => this.model.update((current) => ({ ...current, sku })),
        error: () => {
          /* leave SKU empty if the suggestion fails */
        },
      });
    }
  }

  submit(): void {
    if (this.productForm().invalid()) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const values = this.model();
    const request: ProductWriteRequest = {
      name: values.name,
      sku: values.sku,
      description: values.description,
      categoryId: values.categoryId,
      basePrice: Number(values.basePrice),
      images: values.imageUrl.trim() ? [values.imageUrl.trim()] : [],
      attributes: this.existingAttributes,
      isActive: values.isActive,
    };

    const editId = this.id();
    const request$ = editId
      ? this.repository.updateProduct(editId, request)
      : this.repository.createProduct(request);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        void this.router.navigate(['/admin']);
      },
      error: (error: AppError) => {
        this.submitting.set(false);
        this.errorMessage.set(error.detail ?? error.title);
      },
    });
  }
}
