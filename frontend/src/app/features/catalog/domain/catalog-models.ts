export interface ProductAttribute {
  key: string;
  value: string;
}

export interface AppliedOffer {
  id: string;
  name: string;
  type: string;
  value: number;
  iconName: string | null;
}

export interface Price {
  currency: string;
  basePrice: number;
  finalPrice: number;
  savings: number;
  hasDiscount: boolean;
  appliedOffer: AppliedOffer | null;
}

export interface Product {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  categoryName: string;
  images: string[];
  attributes: ProductAttribute[];
  price: Price;
  isActive: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface OfferBanner {
  id: string;
  name: string;
  iconName: string | null;
  bannerTitle: string | null;
  bannerSubtitle: string | null;
  bannerBackgroundColor: string | null;
  /** Home banner image (rectangular, shown fully opaque). */
  bannerImageUrl: string | null;
  /** Separate image tiled as a translucent full-page background on the detail page. */
  detailBackgroundImageUrl: string | null;
  /** Opacity (0..1) for the tiled detail background. Null = fully opaque. */
  detailBackgroundImageOpacity: number | null;
}

export interface Paged<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

/** Product ordering options (mirror of the API's ProductSort). */
export type ProductSort = 'IdAsc' | 'Newest' | 'Oldest' | 'PriceAsc' | 'PriceDesc' | 'Name';

export interface CatalogFilters {
  search: string;
  categoryId: string | null;
  onlyOnOffer: boolean;
  sort: ProductSort;
  page: number;
}
