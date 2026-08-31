using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vitrine.Application.Identity;

namespace Vitrine.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController : ControllerBase
{
    private readonly IAuthService _auth;

    public AuthController(IAuthService auth) => _auth = auth;

    [HttpPost("login")]
    [AllowAnonymous]
    public Task<AuthResponse> Login(LoginRequest request, CancellationToken ct) => _auth.LoginAsync(request, ct);
}
