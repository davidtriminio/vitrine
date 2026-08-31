import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { LucideLogOut, LucidePencil, LucidePlus } from '@lucide/angular';
import { AppError } from '../../../core/errors/app-error';
import { TPipe } from '../../../core/i18n/t-pipe';
import { AuthStore } from '../../../core/auth/auth-store';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { MoneyPipe } from '../../../shared/pipes/money-pipe';
import { Product } from '../../catalog/domain/catalog-models';
import { AdminRepository } from '../infrastructure/admin-repository';

@Component({
  selector: 'app-admin-products-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    LucideLogOut,
    LucidePencil,
    LucidePlus,
    BadgeComponent,
    ButtonComponent,
    MoneyPipe,
    TPipe,
  ],
  template: `
    <div class="mx-auto max-w-5xl px-4 py-6">
      <div class="flex items-center justify-between">
        <h1 class="text-2xl font-bold text-fg">{{ 'admin.products' | t }}</h1>
        <div class="flex items-center gap-2">
          <a
            routerLink="/admin/productos/nuevo"
            class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg hover:bg-primary-strong hover:text-white"
          >
            <svg lucidePlus [size]="16"></svg>
            {{ 'admin.newProduct' | t }}
          </a>
          <button
            type="button"
            (click)="logout()"
            class="inline-flex items-center gap-2 rounded-md border border-muted px-3 py-2.5 text-sm text-fg-muted hover:text-fg"
          >
            <svg lucideLogOut [size]="16"></svg>
            {{ 'admin.logout' | t }}
          </button>
        </div>
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
                    <app-button variant="danger" (click)="remove(product)">✕</app-button>
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
  `,
})
export class AdminProductsPage implements OnInit {
  private readonly repository = inject(AdminRepository);
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  protected readonly products = signal<Product[]>([]);
  protected readonly error = signal<AppError | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.repository.getProducts(1).subscribe({
      next: (paged) => this.products.set(paged.items),
      error: (error: AppError) => this.error.set(error),
    });
  }

  remove(product: Product): void {
    this.repository.deleteProduct(product.id).subscribe({
      next: () => this.load(),
      error: (error: AppError) => this.error.set(error),
    });
  }

  async logout(): Promise<void> {
    this.authStore.logout();
    await this.router.navigate(['/admin/login']);
  }
}
