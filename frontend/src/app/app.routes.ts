import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./features/catalog/ui/catalog-page').then((m) => m.CatalogPage),
  },
  {
    path: 'producto/:id',
    loadComponent: () =>
      import('./features/catalog/ui/product-detail-page').then((m) => m.ProductDetailPage),
  },
  {
    path: 'promocion/:offerId',
    loadComponent: () =>
      import('./features/offers/ui/promotion-page').then((m) => m.PromotionPage),
  },
  {
    path: 'admin/login',
    loadComponent: () => import('./features/admin/ui/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/ui/admin-products-page').then((m) => m.AdminProductsPage),
  },
  {
    path: 'admin/productos/nuevo',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/ui/product-form-page').then((m) => m.ProductFormPage),
  },
  {
    path: 'admin/productos/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/ui/product-form-page').then((m) => m.ProductFormPage),
  },
  {
    path: 'admin/ofertas',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/ui/admin-offers-page').then((m) => m.AdminOffersPage),
  },
  {
    path: 'admin/ofertas/nueva',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/ui/offer-form-page').then((m) => m.OfferFormPage),
  },
  {
    path: 'admin/ofertas/:id',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/ui/offer-form-page').then((m) => m.OfferFormPage),
  },
  {
    path: 'admin/configuracion',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/ui/settings-page').then((m) => m.SettingsPage),
  },
  { path: '**', redirectTo: '' },
];
