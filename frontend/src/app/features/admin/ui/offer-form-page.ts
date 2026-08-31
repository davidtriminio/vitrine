import { ChangeDetectionStrategy, Component, OnInit, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { FormField, form, required } from '@angular/forms/signals';
import { AppError } from '../../../core/errors/app-error';
import { TPipe } from '../../../core/i18n/t-pipe';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { Category } from '../../catalog/domain/catalog-models';
import { AdminRepository } from '../infrastructure/admin-repository';
import { OfferWriteRequest } from '../infrastructure/offer-admin';
import { ImageInputComponent } from './image-input';

interface TargetOption {
  id: string;
  name: string;
}

interface OfferFormModel {
  name: string;
  discountType: string;
  value: number;
  scope: string;
  targetId: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  bannerTitle: string;
  bannerSubtitle: string;
  bannerBackgroundColor: string;
  bannerImageUrl: string;
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
    scope: 'Category',
    targetId: '',
    startsAt: toLocalInput(now.toISOString()),
    endsAt: toLocalInput(end.toISOString()),
    isActive: true,
    bannerTitle: '',
    bannerSubtitle: '',
    bannerBackgroundColor: '',
    bannerImageUrl: '',
  };
}

@Component({
  selector: 'app-offer-form-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, FormField, ButtonComponent, ImageInputComponent, TPipe],
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

        <div class="grid gap-4 sm:grid-cols-2">
          <div>
            <label for="scope" class="text-sm font-medium text-fg">{{ 'admin.scope' | t }}</label>
            <select id="scope" [formField]="offerForm.scope" [class]="inputClass">
              <option value="Category">{{ 'admin.scopeCategory' | t }}</option>
              <option value="Product">{{ 'admin.scopeProduct' | t }}</option>
            </select>
          </div>
          <div>
            <label for="target" class="text-sm font-medium text-fg">{{ 'admin.target' | t }}</label>
            <select id="target" [formField]="offerForm.targetId" [class]="inputClass">
              <option value="" disabled>—</option>
              @for (option of targetOptions(); track option.id) {
                <option [value]="option.id">{{ option.name }}</option>
              }
            </select>
          </div>
        </div>

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
                <input id="bannerColor" placeholder="#f099be" [formField]="offerForm.bannerBackgroundColor" [class]="inputClass" />
              </div>
              <app-image-input
                [label]="'admin.bannerImage' | t"
                [value]="offerForm.bannerImageUrl().value()"
                (valueChange)="setBannerImage($event)"
              />
            </div>
          </div>
        </fieldset>

        <label class="flex items-center gap-2 text-sm text-fg">
          <input type="checkbox" [formField]="offerForm.isActive" />
          {{ 'admin.active' | t }}
        </label>

        @if (errorMessage()) {
          <p class="text-sm text-danger">{{ errorMessage() }}</p>
        }

        <div class="flex gap-2">
          <app-button [loading]="submitting()" [disabled]="offerForm().invalid()" (click)="submit()">
            {{ 'admin.save' | t }}
          </app-button>
          <a
            routerLink="/admin/ofertas"
            class="inline-flex items-center rounded-md border border-muted px-4 py-2.5 text-sm text-fg-muted hover:text-fg"
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

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly isEdit = computed(() => !!this.id());
  protected readonly inputClass =
    'mt-1 w-full rounded-md border border-muted bg-surface-2 px-3 py-2.5 text-sm text-fg focus-visible:border-primary-strong';

  private readonly categories = signal<Category[]>([]);
  private readonly products = signal<TargetOption[]>([]);

  private readonly model = signal<OfferFormModel>(defaultModel());
  protected readonly offerForm = form(this.model, (path) => {
    required(path.name);
    required(path.targetId);
  });

  protected readonly targetOptions = computed<TargetOption[]>(() =>
    this.model().scope === 'Product' ? this.products() : this.categories(),
  );

  ngOnInit(): void {
    this.repository.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: () => this.categories.set([]),
    });
    this.repository.getProducts(1).subscribe({
      next: (paged) => this.products.set(paged.items.map((p) => ({ id: p.id, name: p.name }))),
      error: () => this.products.set([]),
    });

    const editId = this.id();
    if (editId) {
      this.repository.getOffer(editId).subscribe({
        next: (offer) => {
          this.model.set({
            name: offer.name,
            discountType: offer.discountType,
            value: offer.value,
            scope: offer.scope,
            targetId: offer.targetId,
            startsAt: toLocalInput(offer.startsAt),
            endsAt: toLocalInput(offer.endsAt),
            isActive: offer.isActive,
            bannerTitle: offer.bannerTitle ?? '',
            bannerSubtitle: offer.bannerSubtitle ?? '',
            bannerBackgroundColor: offer.bannerBackgroundColor ?? '',
            bannerImageUrl: offer.bannerImageUrl ?? '',
          });
        },
        error: (error: AppError) => this.errorMessage.set(error.title),
      });
    }
  }

  setBannerImage(url: string): void {
    this.model.update((current) => ({ ...current, bannerImageUrl: url }));
  }

  submit(): void {
    if (this.offerForm().invalid()) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const values = this.model();
    const request: OfferWriteRequest = {
      name: values.name,
      discountType: values.discountType,
      value: Number(values.value),
      scope: values.scope,
      targetId: values.targetId,
      startsAt: new Date(values.startsAt).toISOString(),
      endsAt: new Date(values.endsAt).toISOString(),
      isActive: values.isActive,
      bannerTitle: values.bannerTitle.trim() || null,
      bannerSubtitle: values.bannerSubtitle.trim() || null,
      bannerBackgroundColor: values.bannerBackgroundColor.trim() || null,
      bannerImageUrl: values.bannerImageUrl.trim() || null,
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
