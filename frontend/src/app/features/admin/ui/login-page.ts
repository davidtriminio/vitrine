import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { FormField, form, required } from '@angular/forms/signals';
import { AppError } from '../../../core/errors/app-error';
import { TPipe } from '../../../core/i18n/t-pipe';
import { AuthStore } from '../../../core/auth/auth-store';
import { ButtonComponent } from '../../../shared/ui/button/button';

/** Admin login using Signal Forms. */
@Component({
  selector: 'app-login-page',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormField, ButtonComponent, TPipe],
  template: `
    <div class="mx-auto max-w-sm px-4 py-12">
      <h1 class="text-2xl font-bold text-fg">{{ 'admin.loginTitle' | t }}</h1>

      <div class="mt-6 space-y-4">
        <div>
          <label for="username" class="text-sm font-medium text-fg">
            {{ 'admin.username' | t }}
          </label>
          <input
            id="username"
            [formField]="loginForm.username"
            autocomplete="username"
            class="mt-1 w-full rounded-md border border-muted bg-surface-2 px-3 py-2.5 text-sm text-fg focus-visible:border-primary-strong"
          />
        </div>

        <div>
          <label for="password" class="text-sm font-medium text-fg">
            {{ 'admin.password' | t }}
          </label>
          <input
            id="password"
            type="password"
            [formField]="loginForm.password"
            autocomplete="current-password"
            class="mt-1 w-full rounded-md border border-muted bg-surface-2 px-3 py-2.5 text-sm text-fg focus-visible:border-primary-strong"
          />
        </div>

        @if (errorMessage()) {
          <p class="text-sm text-danger">{{ errorMessage() }}</p>
        }

        <app-button
          [fullWidth]="true"
          [loading]="submitting()"
          [disabled]="loginForm().invalid()"
          (click)="submit()"
        >
          {{ 'admin.login' | t }}
        </app-button>
      </div>
    </div>
  `,
})
export class LoginPage {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  private readonly model = signal({ username: '', password: '' });
  protected readonly loginForm = form(this.model, (path) => {
    required(path.username);
    required(path.password);
  });

  protected readonly submitting = signal(false);
  protected readonly errorMessage = signal<string | null>(null);

  async submit(): Promise<void> {
    if (this.loginForm().invalid()) {
      return;
    }

    this.submitting.set(true);
    this.errorMessage.set(null);

    try {
      const { username, password } = this.model();
      await this.authStore.login(username, password);
      await this.router.navigate(['/admin']);
    } catch (error) {
      const appError = error as AppError;
      this.errorMessage.set(appError.status === 401 ? 'Usuario o contraseña inválidos.' : 'Error al ingresar.');
    } finally {
      this.submitting.set(false);
    }
  }
}
