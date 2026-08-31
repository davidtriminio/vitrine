using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vitrine.Application.Branding;
using Vitrine.Domain.Identity;

namespace Vitrine.Api.Controllers;

[ApiController]
[Route("api/v1/settings")]
public sealed class SettingsController : ControllerBase
{
    private readonly IBrandSettingsService _settings;

    public SettingsController(IBrandSettingsService settings) => _settings = settings;

    /// <summary>Public: brand identity + theme tokens the frontend applies as CSS variables.</summary>
    [HttpGet]
    [AllowAnonymous]
    public Task<BrandSettingsResponse> Get(CancellationToken ct) => _settings.GetAsync(ct);

    [HttpPut]
    [Authorize(Roles = AdminUser.AdminRole)]
    public Task<BrandSettingsResponse> Update(UpdateBrandSettingsRequest request, CancellationToken ct) =>
        _settings.UpdateAsync(request, ct);
}
