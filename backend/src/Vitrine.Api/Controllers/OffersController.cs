using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vitrine.Application.Offers;
using Vitrine.Domain.Identity;

namespace Vitrine.Api.Controllers;

[ApiController]
[Route("api/v1/offers")]
public sealed class OffersController : ControllerBase
{
    private readonly IOfferService _offers;

    public OffersController(IOfferService offers) => _offers = offers;

    /// <summary>Public: active offers with banner presentation (for the storefront).</summary>
    [HttpGet("active")]
    [AllowAnonymous]
    public Task<IReadOnlyList<ActiveOfferBannerResponse>> ListActive(CancellationToken ct) =>
        _offers.ListActiveBannersAsync(ct);

    [HttpGet]
    [Authorize(Roles = AdminUser.AdminRole)]
    public Task<IReadOnlyList<OfferResponse>> List(CancellationToken ct) => _offers.ListAsync(ct);

    [HttpGet("{id:guid}")]
    [Authorize(Roles = AdminUser.AdminRole)]
    public Task<OfferResponse> GetById(Guid id, CancellationToken ct) => _offers.GetByIdAsync(id, ct);

    [HttpPost]
    [Authorize(Roles = AdminUser.AdminRole)]
    public async Task<ActionResult<OfferResponse>> Create(CreateOfferRequest request, CancellationToken ct)
    {
        var created = await _offers.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = AdminUser.AdminRole)]
    public Task<OfferResponse> Update(Guid id, UpdateOfferRequest request, CancellationToken ct) =>
        _offers.UpdateAsync(id, request, ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = AdminUser.AdminRole)]
    public async Task<NoContentResult> Delete(Guid id, CancellationToken ct)
    {
        await _offers.DeleteAsync(id, ct);
        return NoContent();
    }
}
