import { ChangeDetectionStrategy, Component, OnInit, computed, inject, signal } from '@angular/core';
import { FormField, form, required } from '@angular/forms/signals';
import { LucidePencil } from '@lucide/angular';
import { AppError } from '../../../core/errors/app-error';
import { TPipe } from '../../../core/i18n/t-pipe';
import { TranslationService } from '../../../core/i18n/translation-service';
import { ButtonComponent } from '../../../shared/ui/button/button';
import { ConfirmDialogComponent } from '../../../shared/ui/confirm-dialog/confirm-dialog';
import { Category } from '../../catalog/domain/catalog-models';
import { AdminRepository } from '../infrastructure/admin-repository';
import { AdminNavComponent } from './admin-nav';

interface CategoryFormModel {
  name: string;
  slug: string;
}

/** Slugifies a display name (lowercase, dashes, no accents/symbols). */
function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
}

@Component({
  selector: 'app-admin-categories-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, LucidePencil, ButtonComponent, ConfirmDialogComponent, AdminNavComponent, TPipe],
  template: `
    <div class="mx-auto max-w-3xl px-4 py-6">
      <app-admin-nav />

      <h1 class="mt-6 text-2xl font-bold text-fg">{{ 'admin.categories' | t }}</h1>

      <!-- Create / edit form -->
      <section class="mt-6 rounded-lg border border-muted bg-surface p-4">
        <h2 class="text-sm font-bold text-fg">
          {{ (editingId() ? 'admin.editCategory' : 'admin.newCategory') | t }}
        </h2>
        <div class="mt-4 grid gap-4 sm:grid-cols-2">
          <div>
            <label for="name" class="text-sm font-medium text-fg">{{ 'admin.name' | t }}</label>
            <input id="name" [formField]="categoryForm.name" (input)="onNameInput($event)" [class]="inputClass" />
          </div>
          <div>
            <label for="slug" class="text-sm font-medium text-fg">{{ 'admin.slug' | t }}</label>
            <input id="slug" [formField]="categoryForm.slug" [class]="inputClass" />
          </div>
        </div>
        <div class="mt-4 flex gap-2">
          <app-button [loading]="submitting()" [disabled]="categoryForm().invalid()" (click)="submit()">
            {{ 'admin.save' | t }}
          </app-button>
          @if (editingId()) {
            <button
              type="button"
              (click)="resetForm()"
              class="inline-flex cursor-pointer items-center rounded-md border border-muted px-4 py-2.5 text-sm text-fg-muted hover:text-fg"
            >
              {{ 'admin.cancel' | t }}
            </button>
          }
        </div>
      </section>

      @if (errorMessage()) {
        <p class="mt-4 text-sm text-danger">{{ errorMessage() }}</p>
      }

      <!-- List -->
      <div class="mt-6 overflow-x-auto rounded-lg border border-muted">
        <table class="w-full text-left text-sm">
          <thead class="bg-surface-2 text-fg-muted">
            <tr>
              <th class="px-4 py-3 font-semibold">{{ 'admin.name' | t }}</th>
              <th class="px-4 py-3 font-semibold">{{ 'admin.slug' | t }}</th>
              <th class="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            @for (category of categories(); track category.id) {
              <tr class="border-t border-muted">
                <td class="px-4 py-3 font-medium text-fg">{{ category.name }}</td>
                <td class="px-4 py-3 text-fg-muted">{{ category.slug }}</td>
                <td class="px-4 py-3 text-right">
                  <div class="flex justify-end gap-2">
                    <button
                      type="button"
                      (click)="edit(category)"
                      class="inline-flex cursor-pointer items-center gap-1 text-fg-muted hover:text-fg"
                      [attr.aria-label]="'admin.editCategory' | t"
                    >
                      <svg lucidePencil [size]="16"></svg>
                    </button>
                    <app-button variant="danger" (click)="askRemove(category)">✕</app-button>
                  </div>
                </td>
              </tr>
            } @empty {
              <tr class="border-t border-muted">
                <td colspan="3" class="px-4 py-6 text-center text-fg-muted">—</td>
              </tr>
            }
          </tbody>
        </table>
      </div>
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
export class AdminCategoriesPage implements OnInit {
  private readonly repository = inject(AdminRepository);
  private readonly translations = inject(TranslationService);

  protected readonly categories = signal<Category[]>([]);
  protected readonly editingId = signal<string | null>(null);
  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);
  protected readonly pendingDelete = signal<Category | null>(null);
  protected readonly deleting = signal(false);

  protected readonly deleteMessage = computed(() => {
    const category = this.pendingDelete();
    return category ? this.translations.t('admin.deleteCategoryMessage', { name: category.name }) : '';
  });
  protected readonly inputClass =
    'mt-1 w-full rounded-md border border-muted bg-surface-2 px-3 py-2.5 text-sm text-fg focus-visible:border-primary-strong';

  // Tracks whether the user edited the slug by hand (stop auto-deriving if so).
  private slugTouched = false;

  private readonly model = signal<CategoryFormModel>({ name: '', slug: '' });
  protected readonly categoryForm = form(this.model, (path) => {
    required(path.name);
    required(path.slug);
  });

  protected readonly isEdit = computed(() => this.editingId() !== null);

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.repository.getCategories().subscribe({
      next: (categories) => this.categories.set(categories),
      error: (error: AppError) => this.errorMessage.set(error.title),
    });
  }

  onNameInput(event: Event): void {
    if (this.slugTouched) {
      return;
    }
    const name = (event.target as HTMLInputElement).value;
    this.model.update((m) => ({ ...m, slug: slugify(name) }));
  }

  edit(category: Category): void {
    this.editingId.set(category.id);
    this.slugTouched = true;
    this.model.set({ name: category.name, slug: category.slug });
    this.errorMessage.set(null);
  }

  resetForm(): void {
    this.editingId.set(null);
    this.slugTouched = false;
    this.model.set({ name: '', slug: '' });
  }

  submit(): void {
    if (this.categoryForm().invalid()) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    const request = { name: this.model().name.trim(), slug: this.model().slug.trim() };
    const editId = this.editingId();
    const request$ = editId
      ? this.repository.updateCategory(editId, request)
      : this.repository.createCategory(request);

    request$.subscribe({
      next: () => {
        this.submitting.set(false);
        this.resetForm();
        this.load();
      },
      error: (error: AppError) => {
        this.submitting.set(false);
        this.errorMessage.set(error.detail ?? error.title);
      },
    });
  }

  askRemove(category: Category): void {
    this.errorMessage.set(null);
    this.pendingDelete.set(category);
  }

  confirmRemove(): void {
    const category = this.pendingDelete();
    if (!category) {
      return;
    }

    this.deleting.set(true);
    this.repository.deleteCategory(category.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        if (this.editingId() === category.id) {
          this.resetForm();
        }
        this.load();
      },
      error: (error: AppError) => {
        this.deleting.set(false);
        this.pendingDelete.set(null);
        this.errorMessage.set(error.detail ?? error.title);
      },
    });
  }
}
