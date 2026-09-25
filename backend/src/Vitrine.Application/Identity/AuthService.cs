using Vitrine.Application.Abstractions;
using Vitrine.Application.Common;
using Vitrine.Domain.Common;

namespace Vitrine.Application.Identity;

public interface IAuthService
{
    Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default);

    Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default);
}

public sealed class AuthService : IAuthService
{
    private readonly IAdminUserRepository _users;
    private readonly IPasswordHasher _passwordHasher;
    private readonly IJwtIssuer _jwtIssuer;
    private readonly ILoginAttemptTracker _attempts;
    private readonly IUnitOfWork _unitOfWork;

    public AuthService(
        IAdminUserRepository users,
        IPasswordHasher passwordHasher,
        IJwtIssuer jwtIssuer,
        ILoginAttemptTracker attempts,
        IUnitOfWork unitOfWork)
    {
        _users = users;
        _passwordHasher = passwordHasher;
        _jwtIssuer = jwtIssuer;
        _attempts = attempts;
        _unitOfWork = unitOfWork;
    }

    public async Task<AuthResponse> LoginAsync(LoginRequest request, CancellationToken ct = default)
    {
        var username = (request.Username ?? string.Empty).Trim().ToLowerInvariant();
        var attemptKey = $"login:{username}";
        EnsureNotLockedOut(attemptKey);

        var user = await _users.GetByUsernameAsync(username, ct);

        // Verify even when the user is missing to reduce timing side-channels.
        var passwordHash = user?.PasswordHash ?? string.Empty;
        var passwordMatches = _passwordHasher.Verify(request.Password ?? string.Empty, passwordHash);

        if (user is null || !passwordMatches)
        {
            _attempts.RegisterFailure(attemptKey);
            throw new AuthenticationFailedException("Invalid username or password.");
        }

        _attempts.Reset(attemptKey);
        var token = _jwtIssuer.Issue(user);
        return new AuthResponse(token.Token, token.ExpiresAt, user.Username, user.Role);
    }

    public async Task ChangePasswordAsync(Guid userId, ChangePasswordRequest request, CancellationToken ct = default)
    {
        var user = await _users.GetByIdAsync(userId, ct)
            ?? throw new AuthenticationFailedException("Invalid session.");

        var attemptKey = $"change-password:{user.Id}";
        EnsureNotLockedOut(attemptKey);

        if (!_passwordHasher.Verify(request.CurrentPassword ?? string.Empty, user.PasswordHash))
        {
            _attempts.RegisterFailure(attemptKey);
            throw new DomainException("The current password is incorrect.");
        }

        PasswordPolicy.EnsureValid(request.NewPassword);

        if (request.NewPassword == request.CurrentPassword)
        {
            throw new DomainException("The new password must be different from the current one.");
        }

        _attempts.Reset(attemptKey);
        user.ChangePasswordHash(_passwordHasher.Hash(request.NewPassword));
        await _unitOfWork.SaveChangesAsync(ct);
    }

    private void EnsureNotLockedOut(string attemptKey)
    {
        if (_attempts.GetLockoutRemaining(attemptKey) is { } remaining)
        {
            throw new TooManyAttemptsException("Too many failed attempts. Try again later.", remaining);
        }
    }
}
