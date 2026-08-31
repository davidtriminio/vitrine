using Vitrine.Domain.Offers;

namespace Vitrine.Application.Offers;

public static class OfferMapper
{
    public static OfferResponse ToResponse(Offer offer) => new(
        offer.Id,
        offer.Name,
        offer.DiscountType.ToString(),
        offer.Value,
        offer.Scope.ToString(),
        offer.TargetId,
        offer.StartsAt,
        offer.EndsAt,
        offer.IsActive,
        offer.BannerTitle,
        offer.BannerSubtitle,
        offer.BannerBackgroundColor,
        offer.BannerImageUrl);

    public static ActiveOfferBannerResponse ToBanner(Offer offer) => new(
        offer.Id,
        offer.Name,
        offer.Scope.ToString(),
        offer.TargetId,
        offer.BannerTitle,
        offer.BannerSubtitle,
        offer.BannerBackgroundColor,
        offer.BannerImageUrl);
}
