import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { TPipe } from './core/i18n/t-pipe';
import { SettingsStore } from './core/settings/settings-store';

@Component({
  selector: 'app-root',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterOutlet, RouterLink, TPipe],
  template: `
    <div class="flex min-h-screen flex-col bg-surface text-fg">
      <header class="sticky top-0 z-10 border-b border-muted bg-surface/90 backdrop-blur">
        <div class="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <a routerLink="/" class="flex items-center gap-2">
            @if (settings.brand()?.logoUrl) {
              <img [src]="settings.brand()?.logoUrl" alt="" class="h-8 w-auto" />
            }
            <span class="text-lg font-bold text-fg">
              {{ settings.brand()?.brandName || ('app.brandFallback' | t) }}
            </span>
          </a>
          <a
            routerLink="/admin"
            class="text-sm font-medium text-fg-muted hover:text-fg"
          >
            {{ 'nav.admin' | t }}
          </a>
        </div>
      </header>

      <main class="flex-1">
        <router-outlet />
      </main>

      <footer class="border-t border-muted py-6 text-center text-xs text-fg-muted">
        {{ settings.brand()?.brandName || ('app.brandFallback' | t) }}
      </footer>
    </div>
  `,
})
export class App {
  protected readonly settings = inject(SettingsStore);
}
