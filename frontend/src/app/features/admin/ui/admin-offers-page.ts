import { ChangeDetectionStrategy, Component, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucidePencil, LucidePlus } from '@lucide/angular';
import { AppError } from '../../../core/errors/app-error';
import { TPipe } from '../../../core/i18n/t-pipe';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { OfferAdmin } from '../infrastructure/offer-admin';
import { AdminRepository } from '../infrastructure/admin-repository';
import { AdminNavComponent } from './admin-nav';

@Component({
  selector: 'app-admin-offers-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    RouterLink,
    DatePipe,
    LucidePencil,
    LucidePlus,
    BadgeComponent,
    ButtonComponent,
    AdminNavComponent,
    TPipe,
  ],
  template: `
    <div class="mx-auto max-w-5xl px-4 py-6">
      <app-admin-nav />

      <div class="mt-6 flex items-center justify-between">
        <h1 class="text-2xl font-bold text-fg">{{ 'admin.offers' | t }}</h1>
        <a
          routerLink="/admin/ofertas/nueva"
          class="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2.5 text-sm font-semibold text-primary-fg hover:bg-primary-strong hover:text-white"
        >
          <svg lucidePlus [size]="16"></svg>
          {{ 'admin.newOffer' | t }}
        </a>
      </div>

      <div class="mt-6 overflow-x-auto rounded-lg border border-muted">
        <table class="w-full text-left text-sm">
          <thead class="bg-surface-2 text-fg-muted">
            <tr>
              <th class="px-4 py-3 font-semibold">{{ 'admin.offerName' | t }}</th>
              <th class="px-4 py-3 font-semibold">{{ 'admin.value' | t }}</th>
              <th class="px-4 py-3 font-semibold">{{ 'admin.offerDates' | t }}</th>
              <th class="px-4 py-3 font-semibold">{{ 'admin.active' | t }}</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            @for (offer of offers(); track offer.id) {
              <tr class="border-t border-muted">
                <td class="px-4 py-3 font-medium text-fg">{{ offer.name }}</td>
                <td class="px-4 py-3 text-fg-muted">
                  {{ offer.discountType === 'Percentage' ? offer.value + '%' : ('L ' + offer.value) }}
                </td>
                <td class="px-4 py-3 text-fg-muted">
                  {{ offer.startsAt | date: 'dd/MM/yy' }} – {{ offer.endsAt | date: 'dd/MM/yy' }}
                </td>
                <td class="px-4 py-3">
                  @if (offer.isActive) {
                    <app-badge tone="category">{{ 'admin.status.active' | t }}</app-badge>
                  } @else {
                    <app-badge tone="neutral">{{ 'admin.status.inactive' | t }}</app-badge>
                  }
                </td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <a
                      [routerLink]="['/admin/ofertas', offer.id]"
                      class="inline-flex items-center gap-1 text-fg-muted hover:text-fg"
                    >
                      <svg lucidePencil [size]="16"></svg>
                    </a>
                    <app-button variant="danger" (click)="remove(offer)">✕</app-button>
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
export class AdminOffersPage implements OnInit {
  private readonly repository = inject(AdminRepository);

  protected readonly offers = signal<OfferAdmin[]>([]);
  protected readonly error = signal<AppError | null>(null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.repository.getOffers().subscribe({
      next: (offers) => this.offers.set(offers),
      error: (error: AppError) => this.error.set(error),
    });
  }

  remove(offer: OfferAdmin): void {
    this.repository.deleteOffer(offer.id).subscribe({
      next: () => this.load(),
      error: (error: AppError) => this.error.set(error),
    });
  }
}
