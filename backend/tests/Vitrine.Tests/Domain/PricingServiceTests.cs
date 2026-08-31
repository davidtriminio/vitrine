using FluentAssertions;
using Vitrine.Domain.Catalog;
using Vitrine.Domain.Common;
using Vitrine.Domain.Offers;
using Vitrine.Domain.Pricing;
using Xunit;

namespace Vitrine.Tests.Domain;

public sealed class PricingServiceTests
{
    private readonly PricingService _pricing = new();
    private readonly DateTimeOffset _now = DateTimeOffset.UtcNow;

    private Product BuildProduct(Guid categoryId, decimal price = 1000m) =>
        new(Guid.NewGuid(), "P", "SKU-1", "d", categoryId, Money.Of(price));

    private Offer BuildOffer(DiscountType type, decimal value, OfferScope scope, Guid targetId) =>
        new(Guid.NewGuid(), "O", type, value, scope, targetId, _now.AddDays(-1), _now.AddDays(1));

    [Fact]
    public void NoOffers_ReturnsBasePrice()
    {
        var product = BuildProduct(Guid.NewGuid());
        var result = _pricing.CalculatePrice(product, Array.Empty<Offer>(), _now);

        result.FinalPrice.Amount.Should().Be(1000m);
        result.HasDiscount.Should().BeFalse();
        result.AppliedOffer.Should().BeNull();
    }

    [Fact]
    public void PercentageOffer_OnProduct_Applies()
    {
        var product = BuildProduct(Guid.NewGuid(), 1200m);
        var offer = BuildOffer(DiscountType.Percentage, 15m, OfferScope.Product, product.Id);

        var result = _pricing.CalculatePrice(product, new[] { offer }, _now);

        result.FinalPrice.Amount.Should().Be(1020m);
        result.Savings.Amount.Should().Be(180m);
        result.AppliedOffer.Should().Be(offer);
    }

    [Fact]
    public void CategoryOffer_Applies_ToProductsInCategory()
    {
        var categoryId = Guid.NewGuid();
        var product = BuildProduct(categoryId, 1000m);
        var offer = BuildOffer(DiscountType.FixedAmount, 200m, OfferScope.Category, categoryId);

        var result = _pricing.CalculatePrice(product, new[] { offer }, _now);

        result.FinalPrice.Amount.Should().Be(800m);
    }

    [Fact]
    public void MultipleOffers_ChooseBestPriceForCustomer_NoStacking()
    {
        var categoryId = Guid.NewGuid();
        var product = BuildProduct(categoryId, 1000m);
        var weak = BuildOffer(DiscountType.Percentage, 10m, OfferScope.Category, categoryId);
        var strong = BuildOffer(DiscountType.Percentage, 30m, OfferScope.Category, categoryId);

        var result = _pricing.CalculatePrice(product, new[] { weak, strong }, _now);

        // Only one offer applies: the strongest (700), never stacked (would be 630).
        result.FinalPrice.Amount.Should().Be(700m);
        result.AppliedOffer.Should().Be(strong);
    }

    [Fact]
    public void Tie_PrefersProductScopedOffer_OverCategory()
    {
        var categoryId = Guid.NewGuid();
        var product = BuildProduct(categoryId, 1000m);
        var categoryOffer = BuildOffer(DiscountType.Percentage, 20m, OfferScope.Category, categoryId);
        var productOffer = BuildOffer(DiscountType.Percentage, 20m, OfferScope.Product, product.Id);

        var result = _pricing.CalculatePrice(product, new[] { categoryOffer, productOffer }, _now);

        result.FinalPrice.Amount.Should().Be(800m);
        result.AppliedOffer!.Scope.Should().Be(OfferScope.Product);
    }

    [Fact]
    public void ExpiredOffer_IsIgnored()
    {
        var product = BuildProduct(Guid.NewGuid(), 1000m);
        var expired = new Offer(Guid.NewGuid(), "old", DiscountType.Percentage, 50m, OfferScope.Product,
            product.Id, _now.AddDays(-10), _now.AddDays(-5));

        var result = _pricing.CalculatePrice(product, new[] { expired }, _now);

        result.FinalPrice.Amount.Should().Be(1000m);
        result.AppliedOffer.Should().BeNull();
    }
}
