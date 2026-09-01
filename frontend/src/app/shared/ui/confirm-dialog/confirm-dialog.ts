import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  HostListener,
  effect,
  input,
  output,
  viewChild,
} from '@angular/core';
import { ButtonComponent } from '../button/button';

let dialogSeq = 0;

/**
 * Reusable confirmation modal for destructive actions. Presentational: the parent owns
 * the open state and the pending item, and reacts to (confirm)/(cancel). Accessible by
 * default — role="dialog", aria-modal, Escape and backdrop-click cancel, and focus moves
 * to the Cancel button when it opens (the safe default for a destructive action).
 */
@Component({
  selector: 'app-confirm-dialog',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [ButtonComponent],
  template: `
    @if (open()) {
      <div
        class="fixed inset-0 z-50 flex items-center justify-center p-4"
        role="dialog"
        aria-modal="true"
        [attr.aria-labelledby]="titleId"
        [attr.aria-describedby]="messageId"
      >
        <div class="absolute inset-0 bg-black/50" (click)="cancel.emit()" aria-hidden="true"></div>
        <div class="relative w-full max-w-sm rounded-lg border border-muted bg-surface p-5 shadow-xl">
          <h2 [id]="titleId" class="text-lg font-bold text-fg">{{ title() }}</h2>
          <p [id]="messageId" class="mt-2 text-sm text-fg-muted">{{ message() }}</p>
          <div class="mt-5 flex justify-end gap-2">
            <button
              #cancelButton
              type="button"
              (click)="cancel.emit()"
              class="cursor-pointer rounded-md border border-muted px-4 py-2 text-sm text-fg-muted hover:text-fg"
            >
              {{ cancelLabel() }}
            </button>
            <app-button variant="danger" [loading]="loading()" (click)="confirm.emit()">
              {{ confirmLabel() }}
            </app-button>
          </div>
        </div>
      </div>
    }
  `,
})
export class ConfirmDialogComponent {
  readonly open = input<boolean>(false);
  readonly title = input<string>('');
  readonly message = input<string>('');
  readonly confirmLabel = input<string>('OK');
  readonly cancelLabel = input<string>('Cancel');
  readonly loading = input<boolean>(false);

  readonly confirm = output<void>();
  readonly cancel = output<void>();

  private readonly cancelButton = viewChild<ElementRef<HTMLButtonElement>>('cancelButton');

  protected readonly titleId = `confirm-title-${dialogSeq}`;
  protected readonly messageId = `confirm-message-${dialogSeq++}`;

  constructor() {
    // Move focus to the (safe) Cancel button whenever the dialog opens.
    effect(() => {
      if (this.open()) {
        const button = this.cancelButton();
        if (button) {
          setTimeout(() => button.nativeElement.focus());
        }
      }
    });
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.open()) {
      this.cancel.emit();
    }
  }
}
