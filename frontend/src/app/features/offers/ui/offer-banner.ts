import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { OfferBanner } from '../../catalog/domain/catalog-models';
import { OfferIconComponent } from '../../../shared/ui/offer-icon/offer-icon';

/**
 * Rectangular offer banner (landing style). Composes an optional cover photo with a
 * legibility scrim and the offer text; background color/image come from the offer, so
 * each brand decorates promotions without touching this component.
 */
@Component({
  selector: 'app-offer-banner',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [OfferIconComponent],
  template: `
    <div
      class="vibe-banner relative flex min-h-36 flex-col justify-center overflow-hidden rounded-lg"
      [style.background-color]="offer().bannerBackgroundColor || 'var(--color-primary)'"
    >
      @if (offer().bannerImageUrl) {
        <img
          [src]="offer().bannerImageUrl"
          alt=""
          class="absolute inset-0 h-full w-full object-cover"
        />
        <div class="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent"></div>
      }

      <div class="relative p-6 sm:p-8">
        <div class="flex items-center gap-2" [class]="titleColor()">
          @if (offer().iconName; as icon) {
            <span class="vibe-banner-icon inline-flex"><app-offer-icon [name]="icon" [size]="28" /></span>
          }
          <p class="text-2xl font-bold sm:text-3xl">
            {{ offer().bannerTitle }}
          </p>
        </div>
        @if (offer().bannerSubtitle) {
          <p class="mt-1 text-sm font-medium sm:text-base" [class]="subtitleColor()">
            {{ offer().bannerSubtitle }}
          </p>
        }
      </div>
    </div>
  `,
})
export class OfferBannerComponent {
  readonly offer = input.required<OfferBanner>();

  // Over a photo we need light text; over a solid brand color we use the token pair.
  protected readonly titleColor = computed(() => (this.offer().bannerImageUrl ? 'text-white' : 'text-primary-fg'));
  protected readonly subtitleColor = computed(() =>
    this.offer().bannerImageUrl ? 'text-white/85' : 'text-primary-fg/80',
  );
}
