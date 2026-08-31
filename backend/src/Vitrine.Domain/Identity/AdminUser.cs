using Vitrine.Domain.Common;

namespace Vitrine.Domain.Identity;

/// <summary>
/// An administrator able to manage the catalog and brand settings. The MVP has a single
/// role (<c>Admin</c>); the public catalog needs no account.
/// </summary>
public sealed class AdminUser
{
    public const string AdminRole = "Admin";

    public Guid Id { get; private set; }
    public string Username { get; private set; }
    public string PasswordHash { get; private set; }
    public string Role { get; private set; }

    // EF Core materialization constructor.
    private AdminUser()
    {
        Username = string.Empty;
        PasswordHash = string.Empty;
        Role = AdminRole;
    }

    public AdminUser(Guid id, string username, string passwordHash, string role = AdminRole)
    {
        if (string.IsNullOrWhiteSpace(username))
        {
            throw new DomainException("Username is required.");
        }

        if (string.IsNullOrWhiteSpace(passwordHash))
        {
            throw new DomainException("Password hash is required.");
        }

        Id = id == Guid.Empty ? Guid.NewGuid() : id;
        Username = username.Trim().ToLowerInvariant();
        PasswordHash = passwordHash;
        Role = string.IsNullOrWhiteSpace(role) ? AdminRole : role.Trim();
    }
}
