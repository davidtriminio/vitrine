/** Admin offer model / DTO (mirrors the API OfferResponse). */
export interface OfferAdmin {
  id: string;
  name: string;
  discountType: string;
  value: number;
  categoryIds: string[];
  productIds: string[];
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  iconName: string | null;
  bannerTitle: string | null;
  bannerSubtitle: string | null;
  bannerBackgroundColor: string | null;
  bannerImageUrl: string | null;
}

export interface OfferWriteRequest {
  name: string;
  discountType: string;
  value: number;
  categoryIds: string[];
  productIds: string[];
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  iconName: string | null;
  bannerTitle: string | null;
  bannerSubtitle: string | null;
  bannerBackgroundColor: string | null;
  bannerImageUrl: string | null;
}

export function mapOfferAdmin(dto: OfferAdmin): OfferAdmin {
  return {
    ...dto,
    categoryIds: dto.categoryIds ?? [],
    productIds: dto.productIds ?? [],
  };
}
