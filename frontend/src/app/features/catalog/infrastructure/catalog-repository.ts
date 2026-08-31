import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable, inject } from '@angular/core';
import { Observable, map } from 'rxjs';
import { API_BASE_URL } from '../../../core/config/app-config';
import {
  Category,
  OfferBanner,
  Paged,
  Product,
  CatalogFilters,
} from '../domain/catalog-models';
import {
  CategoryDto,
  OfferBannerDto,
  PagedDto,
  ProductDto,
  mapCategory,
  mapOfferBanner,
  mapPagedProducts,
  mapProduct,
} from './catalog-dtos';

const PAGE_SIZE = 12;

@Injectable({ providedIn: 'root' })
export class CatalogRepository {
  private readonly http = inject(HttpClient);
  private readonly apiBaseUrl = inject(API_BASE_URL);

  getProducts(filters: CatalogFilters): Observable<Paged<Product>> {
    let params = new HttpParams()
      .set('page', filters.page)
      .set('pageSize', PAGE_SIZE)
      .set('onlyOnOffer', filters.onlyOnOffer);

    if (filters.categoryId) {
      params = params.set('categoryId', filters.categoryId);
    }
    if (filters.search.trim().length > 0) {
      params = params.set('search', filters.search.trim());
    }

    return this.http
      .get<PagedDto<ProductDto>>(`${this.apiBaseUrl}/api/v1/products`, { params })
      .pipe(map(mapPagedProducts));
  }

  getProduct(id: string): Observable<Product> {
    return this.http
      .get<ProductDto>(`${this.apiBaseUrl}/api/v1/products/${id}`)
      .pipe(map(mapProduct));
  }

  getCategories(): Observable<Category[]> {
    return this.http
      .get<CategoryDto[]>(`${this.apiBaseUrl}/api/v1/categories`)
      .pipe(map((dtos) => dtos.map(mapCategory)));
  }

  getActiveOffers(): Observable<OfferBanner[]> {
    return this.http
      .get<OfferBannerDto[]>(`${this.apiBaseUrl}/api/v1/offers/active`)
      .pipe(map((dtos) => dtos.map(mapOfferBanner)));
  }
}
