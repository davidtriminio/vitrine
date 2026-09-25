import { Routes } from '@angular/router';
import { authGuard } from './core/auth/auth-guard';

export const routes: Routes = [
  {
    path: '',
    title: 'title.home',
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
    title: 'title.promotion',
    loadComponent: () =>
      import('./features/offers/ui/promotion-page').then((m) => m.PromotionPage),
  },
  {
    path: 'admin/login',
    title: 'title.login',
    loadComponent: () => import('./features/admin/ui/login-page').then((m) => m.LoginPage),
  },
  {
    path: 'admin',
    title: 'title.adminProducts',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/ui/admin-products-page').then((m) => m.AdminProductsPage),
  },
  {
    path: 'admin/productos/nuevo',
    title: 'title.newProduct',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/ui/product-form-page').then((m) => m.ProductFormPage),
  },
  {
    path: 'admin/productos/:id',
    title: 'title.editProduct',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/ui/product-form-page').then((m) => m.ProductFormPage),
  },
  {
    path: 'admin/categorias',
    title: 'title.adminCategories',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/ui/admin-categories-page').then((m) => m.AdminCategoriesPage),
  },
  {
    path: 'admin/ofertas',
    title: 'title.adminOffers',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/ui/admin-offers-page').then((m) => m.AdminOffersPage),
  },
  {
    path: 'admin/ofertas/nueva',
    title: 'title.newOffer',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/ui/offer-form-page').then((m) => m.OfferFormPage),
  },
  {
    path: 'admin/ofertas/:id',
    title: 'title.editOffer',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/ui/offer-form-page').then((m) => m.OfferFormPage),
  },
  {
    path: 'admin/configuracion',
    title: 'title.settings',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/admin/ui/settings-page').then((m) => m.SettingsPage),
  },
  { path: '**', redirectTo: '' },
];
