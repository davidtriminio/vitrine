import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
type ButtonType = 'button' | 'submit';

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary: 'bg-primary text-primary-fg hover:bg-primary-strong hover:text-white',
  secondary: 'bg-surface-2 text-fg border border-muted hover:bg-muted',
  ghost: 'bg-transparent text-fg hover:bg-surface-2',
  danger: 'bg-danger text-white hover:opacity-90',
};

/** Presentational button with variants and a loading state. */
@Component({
  selector: 'app-button',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <button
      [type]="type()"
      [disabled]="disabled() || loading()"
      [attr.aria-busy]="loading()"
      [class]="classes()"
    >
      @if (loading()) {
        <span
          class="inline-block h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"
          aria-hidden="true"
        ></span>
      }
      <ng-content />
    </button>
  `,
})
export class ButtonComponent {
  readonly variant = input<ButtonVariant>('primary');
  readonly type = input<ButtonType>('button');
  readonly disabled = input<boolean>(false);
  readonly loading = input<boolean>(false);
  readonly fullWidth = input<boolean>(false);

  readonly classes = computed(() =>
    [
      'inline-flex items-center justify-center gap-2 rounded-md px-4 py-2.5 text-sm font-semibold',
      'transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
      VARIANT_CLASSES[this.variant()],
      this.fullWidth() ? 'w-full' : '',
    ].join(' '),
  );
}
