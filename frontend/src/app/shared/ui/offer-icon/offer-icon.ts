import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import {
  LucideBaby,
  LucideBell,
  LucideCake,
  LucideCalendarHeart,
  LucideCamera,
  LucideCandy,
  LucideChurch,
  LucideClover,
  LucideCoffee,
  LucideCrown,
  LucideCross,
  LucideDiamond,
  LucideDynamicIcon,
  LucideFlower,
  LucideFlower2,
  LucideGem,
  LucideGift,
  LucideGraduationCap,
  LucideHandHeart,
  LucideHeart,
  LucideLeaf,
  LucideMusic,
  LucidePartyPopper,
  LucidePercent,
  LucideRainbow,
  LucideSnowflake,
  LucideSprout,
  LucideSparkles,
  LucideStar,
  LucideSun,
  LucideTag,
  LucideTrees,
  LucideWine,
} from '@lucide/angular';

/**
 * Curated set of offer icons, kept varied so brands across different event types
 * (birthdays, weddings, graduations, condolences, seasonal, etc.) find a fitting
 * badge. Names are the canonical Lucide kebab-case names; they are stored on the
 * Offer (IconName) and shared with the products the offer applies to.
 *
 * OFFER_ICON_COMPONENTS feeds the global provider (see app.config.ts); OFFER_ICONS
 * is the picker list. Keep both in sync — one entry per icon in each.
 */
export const OFFER_ICON_COMPONENTS = [
  LucideFlower,
  LucideFlower2,
  LucideLeaf,
  LucideSprout,
  LucideTrees,
  LucideClover,
  LucideHeart,
  LucideHandHeart,
  LucideCalendarHeart,
  LucideSparkles,
  LucideStar,
  LucideGift,
  LucideCake,
  LucidePartyPopper,
  LucideGem,
  LucideDiamond,
  LucideCrown,
  LucideBaby,
  LucideGraduationCap,
  LucideChurch,
  LucideCross,
  LucideBell,
  LucideSnowflake,
  LucideSun,
  LucideRainbow,
  LucideWine,
  LucideMusic,
  LucideCamera,
  LucideCoffee,
  LucideCandy,
  LucideTag,
  LucidePercent,
];

export const OFFER_ICONS = [
  'flower',
  'flower-2',
  'leaf',
  'sprout',
  'trees',
  'clover',
  'heart',
  'hand-heart',
  'calendar-heart',
  'sparkles',
  'star',
  'gift',
  'cake',
  'party-popper',
  'gem',
  'diamond',
  'crown',
  'baby',
  'graduation-cap',
  'church',
  'cross',
  'bell',
  'snowflake',
  'sun',
  'rainbow',
  'wine',
  'music',
  'camera',
  'coffee',
  'candy',
  'tag',
  'percent',
] as const;

export type OfferIconName = (typeof OFFER_ICONS)[number];

/**
 * Renders a curated offer icon by name (nothing when the name is empty). Icons are
 * resolved from the globally provided Lucide dictionary, so adding a new icon is just
 * two list entries above — no template change.
 */
@Component({
  selector: 'app-offer-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideDynamicIcon],
  template: `
    @if (name()) {
      <svg [lucideIcon]="name()!" [size]="size()"></svg>
    }
  `,
})
export class OfferIconComponent {
  readonly name = input<string | null>(null);
  readonly size = input<number>(16);
}
