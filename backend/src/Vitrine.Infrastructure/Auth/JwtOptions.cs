namespace Vitrine.Infrastructure.Auth;

/// <summary>Bound from the "Jwt" configuration section.</summary>
public sealed class JwtOptions
{
    public const string SectionName = "Jwt";

    public string Issuer { get; set; } = "vitrine";
    public string Audience { get; set; } = "vitrine-client";

    /// <summary>Signing key. MUST be provided via environment/secret in non-dev environments.</summary>
    public string Key { get; set; } = string.Empty;

    public int AccessTokenMinutes { get; set; } = 240;
}
