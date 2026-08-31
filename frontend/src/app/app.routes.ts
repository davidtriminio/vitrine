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
  { path: '**', redirectTo: '' },
];
