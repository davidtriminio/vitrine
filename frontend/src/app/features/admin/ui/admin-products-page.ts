import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucidePencil, LucidePlus } from '@lucide/angular';
import { AppError } from '../../../core/errors/app-error';
import { TPipe } from '../../../core/i18n/t-pipe';
import { TranslationService } from '../../../core/i18n/translation-service';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { MoneyPipe } from '../../../shared/pipes/money-pipe';
import { Product } from '../../catalog/domain/catalog-models';
import { AdminRepository } from '../infrastructure/admin-repository';
import { AdminNavComponent } from './admin-nav';

@Component({
  selector: 'app-admin-products-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LucidePencil,
    LucidePlus,
    BadgeComponent,
    ButtonComponent,
    ConfirmDialogComponent,
    MoneyPipe,
    AdminNavComponent,
    TPipe,
  ],
  template: `
    <div class="mx-auto max-w-5xl px-4 py-6">
      <app-admin-nav />

      <div class="mt-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-fg">{{ 'admin.products' | t }}</h1>
        <a
          routerLink="/admin/productos/nuevo"
          class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg hover:bg-primary-strong hover:text-white"
        >
          <svg lucidePlus [size]="16"></svg>
          {{ 'admin.newProduct' | t }}
        </a>
      </div>

      <div class="mt-6 overflow-x-auto rounded-lg border border-muted">
        <table class="w-full text-left text-sm">
          <thead class="bg-surface-2 text-fg-muted">
            <tr>
              <th class="px-4 py-3 font-semibold">{{ 'admin.name' | t }}</th>
              <th class="px-4 py-3 font-semibold">{{ 'admin.sku' | t }}</th>
              <th class="px-4 py-3 font-semibold">{{ 'admin.basePrice' | t }}</th>
              <th class="px-4 py-3 font-semibold">{{ 'admin.active' | t }}</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            @for (product of products(); track product.id) {
              <tr class="border-t border-muted">
                <td class="px-4 py-3 font-medium text-fg">{{ product.name }}</td>
                <td class="px-4 py-3 text-fg-muted">{{ product.sku }}</td>
                <td class="px-4 py-3 text-fg">{{ product.price.basePrice | money }}</td>
                <td class="px-4 py-3">
                  @if (product.isActive) {
                    <app-badge tone="category">{{ 'admin.status.active' | t }}</app-badge>
                  } @else {
                    <app-badge tone="neutral">{{ 'admin.status.inactive' | t }}</app-badge>
                  }
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <a
                      [routerLink]="['/admin/productos', product.id]"
                      class="inline-flex items-center gap-1 text-fg-muted hover:text-fg"
                    >
                      <svg lucidePencil [size]="16"></svg>
                    </a>
                    <app-button variant="danger" (click)="askRemove(product)">✕</app-button>
                  </div>
                </td>
              </tr>
            }
          </tbody>
        </table>
      </div>

      @if (error()) {
        <p class="mt-4 text-sm text-danger">{{ error()?.title }}</p>
      }
    </div>

    <app-confirm-dialog
      [open]="pendingDelete() !== null"
      [title]="'admin.deleteTitle' | t"
      [message]="deleteMessage()"
      [confirmLabel]="'admin.deleteConfirm' | t"
      [cancelLabel]="'admin.cancel' | t"
      [loading]="deleting()"
      (confirm)="confirmRemove()"
      (cancel)="pendingDelete.set(null)"
    />
  `,
})
export class AdminProductsPage implements OnInit {
  private readonly repository = inject(AdminRepository);
  private readonly translations = inject(TranslationService);

  protected readonly products = signal<Product[]>([]);
  protected readonly error = signal<AppError | null>(null);
  protected readonly pendingDelete = signal<Product | null>(null);
  protected readonly deleting = signal(false);

  protected readonly deleteMessage = computed(() => {
    const product = this.pendingDelete();
    return product ? this.translations.t('admin.deleteProductMessage', { name: product.name }) : '';
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.repository.getProducts(1).subscribe({
      next: (paged) => this.products.set(paged.items),
      error: (error: AppError) => this.error.set(error),
    });
  }

  askRemove(product: Product): void {
    this.error.set(null);
    this.pendingDelete.set(product);
  }

  confirmRemove(): void {
    const product = this.pendingDelete();
    if (!product) {
      return;
    }

    this.deleting.set(true);
    this.repository.deleteProduct(product.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.load();
      },
      error: (error: AppError) => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.error.set(error);
      },
    });
  }
}
