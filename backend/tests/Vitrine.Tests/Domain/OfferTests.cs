using FluentAssertions;
using Vitrine.Domain.Common;
using Vitrine.Domain.Offers;
using Xunit;

namespace Vitrine.Tests.Domain;

public sealed class OfferTests
{
    private static Offer BuildOffer(
        DiscountType type = DiscountType.Percentage,
        decimal value = 10m,
        OfferScope scope = OfferScope.Product,
        DateTimeOffset? start = null,
        DateTimeOffset? end = null)
    {
        var now = DateTimeOffset.UtcNow;
        return new Offer(Guid.NewGuid(), "Test", type, value, scope, Guid.NewGuid(),
            start ?? now.AddDays(-1), end ?? now.AddDays(1));
    }

    [Theory]
    [InlineData(0)]
    [InlineData(-5)]
    [InlineData(101)]
    public void Percentage_OutOfRange_Throws(decimal value)
    {
        var act = () => BuildOffer(DiscountType.Percentage, value);
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void FixedAmount_NonPositive_Throws()
    {
        var act = () => BuildOffer(DiscountType.FixedAmount, 0m);
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void EndBeforeStart_Throws()
    {
        var now = DateTimeOffset.UtcNow;
        var act = () => BuildOffer(start: now.AddDays(1), end: now.AddDays(-1));
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void IsActiveAt_RespectsWindowAndFlag()
    {
        var now = DateTimeOffset.UtcNow;
        var offer = BuildOffer(start: now.AddDays(-1), end: now.AddDays(1));

        offer.IsActiveAt(now).Should().BeTrue();
        offer.IsActiveAt(now.AddDays(2)).Should().BeFalse();
        offer.IsActiveAt(now.AddDays(-2)).Should().BeFalse();
    }
}
