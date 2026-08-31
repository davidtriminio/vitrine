namespace Vitrine.Application.Identity;

public sealed record LoginRequest(string Username, string Password);

public sealed record AuthResponse(string Token, DateTimeOffset ExpiresAt, string Username, string Role);
