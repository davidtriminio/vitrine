import {
  Category,
  OfferBanner,
  Paged,
  Product,
} from '../domain/catalog-models';

/** DTO mirrors of the API contract. Kept separate from domain models on purpose. */
export interface ProductDto {
  id: string;
  name: string;
  sku: string;
  description: string;
  categoryId: string;
  categoryName: string;
  images: string[];
  attributes: { key: string; value: string }[];
  price: {
    currency: string;
    basePrice: number;
    finalPrice: number;
    savings: number;
    hasDiscount: boolean;
    appliedOffer: { id: string; name: string; type: string; value: number; iconName: string | null } | null;
  };
  isActive: boolean;
}

export interface PagedDto<T> {
  items: T[];
  page: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
}

export interface CategoryDto {
  id: string;
  name: string;
  slug: string;
}

export interface OfferBannerDto {
  id: string;
  name: string;
  iconName: string | null;
  bannerTitle: string | null;
  bannerSubtitle: string | null;
  bannerBackgroundColor: string | null;
  bannerImageUrl: string | null;
}

export function mapProduct(dto: ProductDto): Product {
  return {
    id: dto.id,
    name: dto.name,
    sku: dto.sku,
    description: dto.description,
    categoryId: dto.categoryId,
    categoryName: dto.categoryName,
    images: dto.images ?? [],
    attributes: dto.attributes ?? [],
    price: {
      currency: dto.price.currency,
      basePrice: dto.price.basePrice,
      finalPrice: dto.price.finalPrice,
      savings: dto.price.savings,
      hasDiscount: dto.price.hasDiscount,
      appliedOffer: dto.price.appliedOffer,
    },
    isActive: dto.isActive,
  };
}

export function mapPagedProducts(dto: PagedDto<ProductDto>): Paged<Product> {
  return {
    items: dto.items.map(mapProduct),
    page: dto.page,
    pageSize: dto.pageSize,
    totalItems: dto.totalItems,
    totalPages: dto.totalPages,
  };
}

export function mapCategory(dto: CategoryDto): Category {
  return { id: dto.id, name: dto.name, slug: dto.slug };
}

export function mapOfferBanner(dto: OfferBannerDto): OfferBanner {
  return {
    id: dto.id,
    name: dto.name,
    iconName: dto.iconName,
    bannerTitle: dto.bannerTitle,
    bannerSubtitle: dto.bannerSubtitle,
    bannerBackgroundColor: dto.bannerBackgroundColor,
    bannerImageUrl: dto.bannerImageUrl,
  };
}
