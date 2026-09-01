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
        new(Guid.NewGuid(), "P", "001", "d", categoryId, Money.Of(price));

    private Offer CategoryOffer(DiscountType type, decimal value, Guid categoryId) =>
        new(Guid.NewGuid(), "O", type, value,
            categoryIds: new[] { categoryId }, productIds: Array.Empty<Guid>(),
            _now.AddDays(-1), _now.AddDays(1));

    private Offer ProductOffer(DiscountType type, decimal value, Guid productId) =>
        new(Guid.NewGuid(), "O", type, value,
            categoryIds: Array.Empty<Guid>(), productIds: new[] { productId },
            _now.AddDays(-1), _now.AddDays(1));

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
        var offer = ProductOffer(DiscountType.Percentage, 15m, product.Id);

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
        var offer = CategoryOffer(DiscountType.FixedAmount, 200m, categoryId);

        var result = _pricing.CalculatePrice(product, new[] { offer }, _now);

        result.FinalPrice.Amount.Should().Be(800m);
    }

    [Fact]
    public void MultipleOffers_ChooseBestPriceForCustomer_NoStacking()
    {
        var categoryId = Guid.NewGuid();
        var product = BuildProduct(categoryId, 1000m);
        var weak = CategoryOffer(DiscountType.Percentage, 10m, categoryId);
        var strong = CategoryOffer(DiscountType.Percentage, 30m, categoryId);

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
        var categoryOffer = CategoryOffer(DiscountType.Percentage, 20m, categoryId);
        var productOffer = ProductOffer(DiscountType.Percentage, 20m, product.Id);

        var result = _pricing.CalculatePrice(product, new[] { categoryOffer, productOffer }, _now);

        result.FinalPrice.Amount.Should().Be(800m);
        result.AppliedOffer.Should().Be(productOffer);
        result.AppliedOffer!.AppliesDirectlyToProduct(product).Should().BeTrue();
    }

    [Fact]
    public void ExpiredOffer_IsIgnored()
    {
        var product = BuildProduct(Guid.NewGuid(), 1000m);
        var expired = new Offer(Guid.NewGuid(), "old", DiscountType.Percentage, 50m,
            categoryIds: Array.Empty<Guid>(), productIds: new[] { product.Id },
            _now.AddDays(-10), _now.AddDays(-5));

        var result = _pricing.CalculatePrice(product, new[] { expired }, _now);

        result.FinalPrice.Amount.Should().Be(1000m);
        result.AppliedOffer.Should().BeNull();
    }
}
