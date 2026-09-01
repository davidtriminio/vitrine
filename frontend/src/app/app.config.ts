import {
  ApplicationConfig,
  provideAppInitializer,
  provideBrowserGlobalErrorListeners,
  provideZonelessChangeDetection,
  inject,
} from '@angular/core';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { provideRouter, withComponentInputBinding } from '@angular/router';
import { provideLucideIcons } from '@lucide/angular';
import { routes } from './app.routes';
import { API_BASE_URL, resolveApiBaseUrl } from './core/config/app-config';
import { authInterceptor } from './core/http/auth-interceptor';
import { errorInterceptor } from './core/http/error-interceptor';
import { SettingsStore } from './core/settings/settings-store';
import { OFFER_ICON_COMPONENTS } from './shared/ui/offer-icon/offer-icon';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZonelessChangeDetection(),
    provideRouter(routes, withComponentInputBinding()),
    provideHttpClient(withInterceptors([authInterceptor, errorInterceptor])),
    { provide: API_BASE_URL, useFactory: resolveApiBaseUrl },
    // Curated offer icons, resolvable by name via <app-offer-icon>.
    provideLucideIcons(...OFFER_ICON_COMPONENTS),
    // Load brand settings, theme tokens and locale before the first render.
    provideAppInitializer(() => inject(SettingsStore).load()),
  ],
};
