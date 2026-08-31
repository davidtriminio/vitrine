namespace Vitrine.Domain.Common;

/// <summary>
/// Raised when a domain invariant is violated. Maps to an HTTP 400/422 at the API boundary.
/// </summary>
public sealed class DomainException : Exception
{
    public DomainException(string message) : base(message)
    {
    }
}
