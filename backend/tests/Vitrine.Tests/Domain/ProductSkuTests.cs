using FluentAssertions;
using Vitrine.Domain.Catalog;
using Vitrine.Domain.Common;
using Xunit;

namespace Vitrine.Tests.Domain;

public sealed class ProductSkuTests
{
    [Theory]
    [InlineData("1", "001")]
    [InlineData("25", "025")]
    [InlineData("001", "001")]
    [InlineData("1234", "1234")]
    public void NormalizeSku_PadsNumericToThreeDigits(string input, string expected)
    {
        Product.NormalizeSku(input).Should().Be(expected);
    }

    [Theory]
    [InlineData("FLR-001")]
    [InlineData("12a")]
    [InlineData("abc")]
    [InlineData(" ")]
    public void NormalizeSku_RejectsNonNumeric(string input)
    {
        var act = () => Product.NormalizeSku(input);
        act.Should().Throw<DomainException>();
    }

    [Fact]
    public void Product_StoresNormalizedSku()
    {
        var product = new Product(Guid.NewGuid(), "P", "7", "d", Guid.NewGuid(), Money.Of(100m));
        product.Sku.Should().Be("007");
    }
}
