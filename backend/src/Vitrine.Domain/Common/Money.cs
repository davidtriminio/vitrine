namespace Vitrine.Domain.Common;

/// <summary>Supported currencies. MVP ships a single currency (LPS).</summary>
public enum Currency
{
    Lps = 0
}

/// <summary>
/// Money value object. Enforces non-negative amounts and centralizes rounding
/// (half-up to 2 decimals). Prices are always expressed through this type.
/// </summary>
public readonly record struct Money
{
    public decimal Amount { get; }
    public Currency Currency { get; }

    private Money(decimal amount, Currency currency)
    {
        Amount = amount;
        Currency = currency;
    }

    /// <summary>Creates a rounded, non-negative Money value.</summary>
    public static Money Of(decimal amount, Currency currency = Currency.Lps)
    {
        if (amount < 0)
        {
            throw new DomainException("Money amount cannot be negative.");
        }

        return new Money(Round(amount), currency);
    }

    public static Money Zero(Currency currency = Currency.Lps) => new(0m, currency);

    /// <summary>Applies a percentage discount (0-100) and returns the resulting price.</summary>
    public Money ApplyPercentage(decimal percent)
    {
        var result = Amount * (1m - (percent / 100m));
        return new Money(Round(result < 0 ? 0m : result), Currency);
    }

    /// <summary>Subtracts a fixed amount, flooring the result at zero.</summary>
    public Money SubtractCapped(decimal amount)
    {
        var result = Amount - amount;
        return new Money(Round(result < 0 ? 0m : result), Currency);
    }

    /// <summary>Difference from another Money of the same currency, floored at zero.</summary>
    public Money DifferenceFrom(Money other)
    {
        EnsureSameCurrency(other);
        var result = other.Amount - Amount;
        return new Money(Round(result < 0 ? 0m : result), Currency);
    }

    private void EnsureSameCurrency(Money other)
    {
        if (other.Currency != Currency)
        {
            throw new DomainException("Cannot operate on Money values with different currencies.");
        }
    }

    private static decimal Round(decimal value) => Math.Round(value, 2, MidpointRounding.AwayFromZero);
}
