import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type BadgeTone = 'offer' | 'category' | 'neutral';

const TONE_CLASSES: Record<BadgeTone, string> = {
  offer: 'bg-primary text-primary-fg',
  category: 'bg-accent text-accent-fg',
  neutral: 'bg-surface-2 text-fg-muted border border-muted',
};

/** Small status/label chip. */
@Component({
  selector: 'app-badge',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span [class]="classes()">
      <ng-content />
    </span>
  `,
})
export class BadgeComponent {
  readonly tone = input<BadgeTone>('neutral');

  readonly classes = computed(() =>
    [
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold',
      TONE_CLASSES[this.tone()],
    ].join(' '),
  );
}
