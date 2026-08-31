/** Admin offer model / DTO (mirrors the API OfferResponse). */
export interface OfferAdmin {
  id: string;
  name: string;
  discountType: string;
  value: number;
  scope: string;
  targetId: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  bannerTitle: string | null;
  bannerSubtitle: string | null;
  bannerBackgroundColor: string | null;
  bannerImageUrl: string | null;
}

export interface OfferWriteRequest {
  name: string;
  discountType: string;
  value: number;
  scope: string;
  targetId: string;
  startsAt: string;
  endsAt: string;
  isActive: boolean;
  bannerTitle: string | null;
  bannerSubtitle: string | null;
  bannerBackgroundColor: string | null;
  bannerImageUrl: string | null;
}

export function mapOfferAdmin(dto: OfferAdmin): OfferAdmin {
  return { ...dto };
}
