using Vitrine.Domain.Common;
using Vitrine.Domain.Offers;

namespace Vitrine.Domain.Pricing;

/// <summary>
/// Outcome of pricing a product: the list price, the final price after the winning
/// offer (if any), the customer savings, and which offer applied.
/// </summary>
public sealed record PriceResult(Money BasePrice, Money FinalPrice, Money Savings, Offer? AppliedOffer)
{
    public bool HasDiscount => AppliedOffer is not null && FinalPrice.Amount < BasePrice.Amount;
}
