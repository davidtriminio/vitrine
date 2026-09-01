using Vitrine.Domain.Offers;

namespace Vitrine.Application.Offers;

public static class OfferMapper
{
    public static OfferResponse ToResponse(Offer offer) => new(
        offer.Id,
        offer.Name,
        offer.DiscountType.ToString(),
        offer.Value,
        offer.CategoryIds.ToList(),
        offer.ProductIds.ToList(),
        offer.StartsAt,
        offer.EndsAt,
        offer.IsActive,
        offer.IconName,
        offer.BannerTitle,
        offer.BannerSubtitle,
        offer.BannerBackgroundColor,
        offer.BannerImageUrl,
        offer.DetailBackgroundImageUrl,
        offer.DetailBackgroundImageOpacity);

    public static ActiveOfferBannerResponse ToBanner(Offer offer) => new(
        offer.Id,
        offer.Name,
        offer.IconName,
        offer.BannerTitle,
        offer.BannerSubtitle,
        offer.BannerBackgroundColor,
        offer.BannerImageUrl,
        offer.DetailBackgroundImageUrl,
        offer.DetailBackgroundImageOpacity);
}
