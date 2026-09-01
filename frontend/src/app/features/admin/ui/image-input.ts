import { ChangeDetectionStrategy, Component, inject, input, model, signal } from '@angular/core';
import { LucideUpload, LucideX } from '@lucide/angular';
import { AppError } from '../../../core/errors/app-error';
import { TPipe } from '../../../core/i18n/t-pipe';
import { AdminRepository } from '../infrastructure/admin-repository';

/**
 * Image field with two ways to set a value: drag & drop / click to upload (stored on the
 * server's local disk), or pasting a URL. Two-way bound via `[(value)]`.
 */
@Component({
  selector: 'app-image-input',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [LucideUpload, LucideX, TPipe],
  template: `
    @if (label(); as text) {
      <label class="text-sm font-medium text-fg">{{ text }}</label>
    }

    <div class="mt-1 space-y-2">
      @if (value()) {
        <div class="relative inline-block">
          <img [src]="value()" alt="" class="h-28 w-28 rounded-md border border-muted object-cover" />
          <button
            type="button"
            (click)="clear()"
            class="absolute -right-2 -top-2 rounded-full bg-danger p-1 text-white shadow"
            [attr.aria-label]="'admin.imageRemove' | t"
          >
            <svg lucideX [size]="14"></svg>
          </button>
        </div>
      }

      <div
        role="button"
        tabindex="0"
        (click)="fileInput.click()"
        (keydown.enter)="fileInput.click()"
        (dragover)="onDragOver($event)"
        (dragleave)="dragging.set(false)"
        (drop)="onDrop($event)"
        [class]="dropZoneClass()"
      >
        <svg lucideUpload [size]="20" class="text-fg-muted"></svg>
        <span class="text-sm text-fg-muted">
          {{ (uploading() ? 'admin.imageUploading' : 'admin.imageDrop') | t }}
        </span>
      </div>

      <input
        #fileInput
        type="file"
        accept="image/*"
        class="hidden"
        (change)="onFileSelected($event)"
      />

      <input
        type="url"
        [value]="value()"
        (input)="onUrlInput($event)"
        [placeholder]="'admin.imageOrUrl' | t"
        class="w-full rounded-md border border-muted bg-surface-2 px-3 py-2 text-sm text-fg focus-visible:border-primary-strong"
      />

      @if (error()) {
        <p class="text-xs text-danger">{{ 'admin.imageError' | t }}</p>
      }
    </div>
  `,
})
export class ImageInputComponent {
  private readonly repository = inject(AdminRepository);

  readonly label = input<string>();
  readonly value = model<string>('');

  protected readonly uploading = signal(false);
  protected readonly dragging = signal(false);
  protected readonly error = signal(false);

  dropZoneClass(): string {
    const base =
      'flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed px-4 py-5 transition-colors';
    return this.dragging()
      ? `${base} border-primary-strong bg-surface-2`
      : `${base} border-muted hover:border-primary-strong`;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(true);
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.dragging.set(false);
    const file = event.dataTransfer?.files?.[0];
    if (file) {
      this.upload(file);
    }
  }

  onFileSelected(event: Event): void {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (file) {
      this.upload(file);
    }
  }

  onUrlInput(event: Event): void {
    this.value.set((event.target as HTMLInputElement).value);
  }

  clear(): void {
    this.value.set('');
  }

  private upload(file: File): void {
    this.uploading.set(true);
    this.error.set(false);
    this.repository.uploadImage(file).subscribe({
      next: (url) => {
        this.value.set(url);
        this.uploading.set(false);
      },
      error: (_error: AppError) => {
        this.uploading.set(false);
        this.error.set(true);
      },
    });
  }
}
