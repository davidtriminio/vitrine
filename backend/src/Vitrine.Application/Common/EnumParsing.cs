using Vitrine.Domain.Common;
using Vitrine.Domain.Offers;

namespace Vitrine.Application.Common;

/// <summary>Parses public string enums from requests into domain enums.</summary>
public static class EnumParsing
{
    public static DiscountType ParseDiscountType(string value)
    {
        if (Enum.TryParse<DiscountType>(value, ignoreCase: true, out var parsed))
        {
            return parsed;
        }

        throw new DomainException($"Unknown discount type '{value}'.");
    }

    public static OfferScope ParseOfferScope(string value)
    {
        if (Enum.TryParse<OfferScope>(value, ignoreCase: true, out var parsed))
        {
            return parsed;
        }

        throw new DomainException($"Unknown offer scope '{value}'.");
    }

    public static string CurrencyCode(Currency currency) => currency switch
    {
        Currency.Lps => "LPS",
        _ => currency.ToString().ToUpperInvariant()
    };
}
