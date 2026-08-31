import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { OfferBanner } from '../../catalog/domain/catalog-models';

/**
 * Rectangular offer banner (landing style). Background color/image come from the
 * offer itself, so each brand decorates promotions without touching this component.
 */
@Component({
  selector: 'app-offer-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div
      class="relative overflow-hidden rounded-lg p-6 sm:p-8"
      [style.background-color]="offer().bannerBackgroundColor || 'var(--color-primary)'"
    >
      @if (offer().bannerImageUrl) {
        <img
          [src]="offer().bannerImageUrl"
          alt=""
          class="absolute inset-0 h-full w-full object-cover opacity-30"
        />
      }
      <div class="relative">
        <p class="text-2xl font-bold text-primary-fg sm:text-3xl">
          {{ offer().bannerTitle }}
        </p>
        @if (offer().bannerSubtitle) {
          <p class="mt-1 text-sm font-medium text-primary-fg/80 sm:text-base">
            {{ offer().bannerSubtitle }}
          </p>
        }
      </div>
    </div>
  `,
})
export class OfferBannerComponent {
  readonly offer = input.required<OfferBanner>();
}
