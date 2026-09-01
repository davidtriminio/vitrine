import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/app-config';
import { Category, Paged, Product } from '../../catalog/domain/catalog-models';
import {
  CategoryDto,
  PagedDto,
  ProductDto,
  mapCategory,
  mapPagedProducts,
  mapProduct,
} from '../../catalog/infrastructure/catalog-dtos';
import { BrandSettings, BrandSettingsDto, mapBrandSettings } from '../../../core/settings/brand-settings';
import { OfferAdmin, OfferWriteRequest, mapOfferAdmin } from './offer-admin';
import { BrandSettingsUpdate } from './settings-admin';

export interface CategoryWriteRequest {
  name: string;
  slug: string;
}

export interface ProductWriteRequest {
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  basePrice: number;
  images: string[];
  attributes: { key: string; value: string }[];
  isActive: boolean;
}

@Injectable({ providedIn: 'root' })
export class AdminRepository {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  private get base(): string {
    return `${this.apiBaseUrl}/api/v1`;
  }

  getProducts(page: number, search = '', pageSize = 50): Observable<Paged<Product>> {
    let params = new HttpParams().set('page', page).set('pageSize', pageSize);
    if (search.trim().length > 0) {
      params = params.set('search', search.trim());
    }
    return this.http
      .get<PagedDto<ProductDto>>(`${this.base}/products/all`, { params })
      .pipe(map(mapPagedProducts));
  }

  getNextSku(): Observable<string> {
    return this.http
      .get<{ sku: string }>(`${this.base}/products/next-sku`)
      .pipe(map((response) => response.sku));
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<ProductDto>(`${this.base}/products/${id}`).pipe(map(mapProduct));
  }

  getCategories(): Observable<Category[]> {
    return this.http
      .get<CategoryDto[]>(`${this.base}/categories`)
      .pipe(map((dtos) => dtos.map(mapCategory)));
  }

  createCategory(request: CategoryWriteRequest): Observable<Category> {
    return this.http.post<CategoryDto>(`${this.base}/categories`, request).pipe(map(mapCategory));
  }

  updateCategory(id: string, request: CategoryWriteRequest): Observable<Category> {
    return this.http.put<CategoryDto>(`${this.base}/categories/${id}`, request).pipe(map(mapCategory));
  }

  deleteCategory(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/categories/${id}`);
  }

  createProduct(request: ProductWriteRequest): Observable<Product> {
    return this.http.post<ProductDto>(`${this.base}/products`, request).pipe(map(mapProduct));
  }

  updateProduct(id: string, request: ProductWriteRequest): Observable<Product> {
    return this.http.put<ProductDto>(`${this.base}/products/${id}`, request).pipe(map(mapProduct));
  }

  deleteProduct(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/products/${id}`);
  }

  getOffers(): Observable<OfferAdmin[]> {
    return this.http
      .get<OfferAdmin[]>(`${this.base}/offers`)
      .pipe(map((dtos) => dtos.map(mapOfferAdmin)));
  }

  getOffer(id: string): Observable<OfferAdmin> {
    return this.http.get<OfferAdmin>(`${this.base}/offers/${id}`).pipe(map(mapOfferAdmin));
  }

  createOffer(request: OfferWriteRequest): Observable<OfferAdmin> {
    return this.http.post<OfferAdmin>(`${this.base}/offers`, request).pipe(map(mapOfferAdmin));
  }

  updateOffer(id: string, request: OfferWriteRequest): Observable<OfferAdmin> {
    return this.http.put<OfferAdmin>(`${this.base}/offers/${id}`, request).pipe(map(mapOfferAdmin));
  }

  deleteOffer(id: string): Observable<void> {
    return this.http.delete<void>(`${this.base}/offers/${id}`);
  }

  uploadImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http
      .post<{ url: string }>(`${this.base}/uploads/image`, formData)
      .pipe(map((response) => response.url));
  }

  getSettings(): Observable<BrandSettings> {
    return this.http.get<BrandSettingsDto>(`${this.base}/settings`).pipe(map(mapBrandSettings));
  }

  updateSettings(request: BrandSettingsUpdate): Observable<BrandSettings> {
    return this.http
      .put<BrandSettingsDto>(`${this.base}/settings`, request)
      .pipe(map(mapBrandSettings));
  }
}
