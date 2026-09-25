namespace Vitrine.Application.Common;

/// <summary>Requested resource does not exist. Maps to HTTP 404.</summary>
public sealed class NotFoundException : Exception
{
    public NotFoundException(string message) : base(message)
    {
    }
}

/// <summary>Request conflicts with current state (e.g. duplicate SKU). Maps to HTTP 409.</summary>
public sealed class ConflictException : Exception
{
    public ConflictException(string message) : base(message)
    {
    }
}

/// <summary>Authentication failed. Maps to HTTP 401.</summary>
public sealed class AuthenticationFailedException : Exception
{
    public AuthenticationFailedException(string message) : base(message)
    {
    }
}

/// <summary>Too many failed attempts; retry later. Maps to HTTP 429.</summary>
public sealed class TooManyAttemptsException : Exception
{
    public TooManyAttemptsException(string message, TimeSpan retryAfter) : base(message) => RetryAfter = retryAfter;

    public TimeSpan RetryAfter { get; }
}
