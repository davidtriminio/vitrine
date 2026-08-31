using FluentAssertions;
using Vitrine.Domain.Common;
using Xunit;

namespace Vitrine.Tests.Domain;

public sealed class MoneyTests
{
    [Fact]
    public void Of_RoundsHalfUp_ToTwoDecimals()
    {
        Money.Of(10.125m).Amount.Should().Be(10.13m);
        Money.Of(10.124m).Amount.Should().Be(10.12m);
    }

    [Fact]
    public void Of_Throws_WhenNegative()
    {
        var act = () => Money.Of(-1m);
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void ApplyPercentage_ReturnsDiscountedPrice()
    {
        Money.Of(1200m).ApplyPercentage(15m).Amount.Should().Be(1020m);
    }

    [Fact]
    public void SubtractCapped_FloorsAtZero()
    {
        Money.Of(100m).SubtractCapped(150m).Amount.Should().Be(0m);
    }

    [Fact]
    public void DifferenceFrom_ReturnsSavings()
    {
        var basePrice = Money.Of(1000m);
        var finalPrice = Money.Of(850m);
        finalPrice.DifferenceFrom(basePrice).Amount.Should().Be(150m);
    }
}
