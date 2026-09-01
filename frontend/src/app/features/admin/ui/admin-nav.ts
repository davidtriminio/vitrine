import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { LucideLogOut } from '@lucide/angular';
import { AuthStore } from '../../../core/auth/auth-store';
import { TPipe } from '../../../core/i18n/t-pipe';

/** Shared admin navigation: section tabs + logout. */
@Component({
  selector: 'app-admin-nav',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, LucideLogOut, TPipe],
  template: `
    <nav class="flex items-center justify-between border-b border-muted pb-3">
      <div class="flex gap-1">
        <a
          routerLink="/admin"
          routerLinkActive="bg-primary text-primary-fg"
          [routerLinkActiveOptions]="{ exact: true }"
          class="rounded-md px-3 py-1.5 text-sm font-medium text-fg-muted hover:text-fg"
        >
          {{ 'admin.products' | t }}
        </a>
        <a
          routerLink="/admin/categorias"
          routerLinkActive="bg-primary text-primary-fg"
          class="rounded-md px-3 py-1.5 text-sm font-medium text-fg-muted hover:text-fg"
        >
          {{ 'admin.categories' | t }}
        </a>
        <a
          routerLink="/admin/ofertas"
          routerLinkActive="bg-primary text-primary-fg"
          class="rounded-md px-3 py-1.5 text-sm font-medium text-fg-muted hover:text-fg"
        >
          {{ 'admin.offers' | t }}
        </a>
        <a
          routerLink="/admin/configuracion"
          routerLinkActive="bg-primary text-primary-fg"
          class="rounded-md px-3 py-1.5 text-sm font-medium text-fg-muted hover:text-fg"
        >
          {{ 'admin.settings' | t }}
        </a>
      </div>
      <button
        type="button"
        (click)="logout()"
        class="inline-flex items-center gap-2 rounded-md border border-muted px-3 py-1.5 text-sm text-fg-muted hover:text-fg"
      >
        <svg lucideLogOut [size]="16"></svg>
        {{ 'admin.logout' | t }}
      </button>
    </nav>
  `,
})
export class AdminNavComponent {
  private readonly authStore = inject(AuthStore);
  private readonly router = inject(Router);

  async logout(): Promise<void> {
    this.authStore.logout();
    await this.router.navigate(['/admin/login']);
  }
}
