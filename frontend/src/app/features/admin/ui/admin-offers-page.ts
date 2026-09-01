import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { LucidePencil, LucidePlus } from '@lucide/angular';
import { AppError } from '../../../core/errors/app-error';
import { TPipe } from '../../../core/i18n/t-pipe';
import { TranslationService } from '../../../core/i18n/translation-service';
import { BadgeComponent } from '../../../shared/ui/badge/badge';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog';
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
    ConfirmDialogComponent,
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
                    <app-button variant="danger" (click)="askRemove(offer)">✕</app-button>
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
export class AdminOffersPage implements OnInit {
  private readonly repository = inject(AdminRepository);
  private readonly translations = inject(TranslationService);

  protected readonly offers = signal<OfferAdmin[]>([]);
  protected readonly error = signal<AppError | null>(null);
  protected readonly pendingDelete = signal<OfferAdmin | null>(null);
  protected readonly deleting = signal(false);

  protected readonly deleteMessage = computed(() => {
    const offer = this.pendingDelete();
    return offer ? this.translations.t('admin.deleteOfferMessage', { name: offer.name }) : '';
  });

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.repository.getOffers().subscribe({
      next: (offers) => this.offers.set(offers),
      error: (error: AppError) => this.error.set(error),
    });
  }

  askRemove(offer: OfferAdmin): void {
    this.error.set(null);
    this.pendingDelete.set(offer);
  }

  confirmRemove(): void {
    const offer = this.pendingDelete();
    if (!offer) {
      return;
    }

    this.deleting.set(true);
    this.repository.deleteOffer(offer.id).subscribe({
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
