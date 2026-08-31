import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthStore } from '../auth/auth-store';
import { resolveApiBaseUrl } from '../config/app-config';

/** Attaches the admin bearer token to same-API requests when authenticated. */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authStore = inject(AuthStore);
  const token = authStore.token();

  if (token && req.url.startsWith(resolveApiBaseUrl())) {
    return next(req.clone({ setHeaders: { Authorization: `Bearer ${token}` } }));
  }

  return next(req);
};
