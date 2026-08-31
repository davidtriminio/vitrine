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

  getProducts(page: number): Observable<Paged<Product>> {
    const params = new HttpParams().set('page', page).set('pageSize', 50);
    return this.http
      .get<PagedDto<ProductDto>>(`${this.base}/products/all`, { params })
      .pipe(map(mapPagedProducts));
  }

  getProduct(id: string): Observable<Product> {
    return this.http.get<ProductDto>(`${this.base}/products/${id}`).pipe(map(mapProduct));
  }

  getCategories(): Observable<Category[]> {
    return this.http
      .get<CategoryDto[]>(`${this.base}/categories`)
      .pipe(map((dtos) => dtos.map(mapCategory)));
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
}
