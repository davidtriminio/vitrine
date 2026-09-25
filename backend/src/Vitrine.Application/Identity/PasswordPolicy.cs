using Vitrine.Domain.Common;

namespace Vitrine.Application.Identity;

/// <summary>Password strength rules for administrator accounts.</summary>
public static class PasswordPolicy
{
    public const int MinLength = 10;
    public const int MaxLength = 128;

    public static void EnsureValid(string? password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < MinLength)
        {
            throw new DomainException($"Password must be at least {MinLength} characters long.");
        }

        if (password.Length > MaxLength)
        {
            throw new DomainException($"Password must be at most {MaxLength} characters long.");
        }

        if (!password.Any(char.IsUpper) || !password.Any(char.IsLower) || !password.Any(char.IsDigit))
        {
            throw new DomainException("Password must contain an uppercase letter, a lowercase letter and a number.");
        }
    }
}
