using Vitrine.Domain.Catalog;
using Vitrine.Domain.Common;
using Vitrine.Domain.Offers;

namespace Vitrine.Domain.Pricing;

/// <summary>
/// Computes a product's final price from the applicable offers. Business rules:
/// discounts never stack (only one applies), the winner is the best price for the
/// customer, and ties are broken in favor of a product-scoped offer over a category one.
/// </summary>
public sealed class PricingService
{
    public PriceResult CalculatePrice(Product product, IEnumerable<Offer> candidateOffers, DateTimeOffset now)
    {
        var basePrice = product.BasePrice;

        var applicable = candidateOffers
            .Where(offer => offer.IsApplicableTo(product) && offer.IsActiveAt(now))
            .ToList();

        if (applicable.Count == 0)
        {
            return new PriceResult(basePrice, basePrice, Money.Zero(basePrice.Currency), null);
        }

        Offer? winner = null;
        var winningPrice = basePrice;

        foreach (var offer in applicable)
        {
            var candidatePrice = offer.Apply(basePrice);

            var isCheaper = candidatePrice.Amount < winningPrice.Amount;
            var isTieButProductScoped =
                winner is not null
                && candidatePrice.Amount == winningPrice.Amount
                && offer.AppliesDirectlyToProduct(product)
                && !winner.AppliesDirectlyToProduct(product);

            if (winner is null || isCheaper || isTieButProductScoped)
            {
                winner = offer;
                winningPrice = candidatePrice;
            }
        }

        var savings = winningPrice.DifferenceFrom(basePrice);
        return new PriceResult(basePrice, winningPrice, savings, winner);
    }
}
