using Vitrine.Application.Abstractions;
using Vitrine.Application.Common;

namespace Vitrine.Application.Identity;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);
}

public sealed class AuthService : IAuthService
{
    private readonly IAdminUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtIssuer _jwtIssuer;

    public AuthService(IAdminUserRepository users, IPasswordHasher passwordHasher, IJwtIssuer jwtIssuer)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _jwtIssuer = jwtIssuer;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var user = await _users.GetByUsernameAsync(request.Username ?? string.Empty, ct);

        // Verify even when the user is missing to reduce timing side-channels.
        var passwordHash = user?.PasswordHash ?? string.Empty;
        var passwordMatches = _passwordHasher.Verify(request.Password ?? string.Empty, passwordHash);

        if (user is null || !passwordMatches)
        {
            throw new AuthenticationFailedException("Invalid username or password.");
        }

        var token = _jwtIssuer.Issue(user);
        return new AuthResponse(token.Token, token.ExpiresAt, user.Username, user.Role);
    }
}
