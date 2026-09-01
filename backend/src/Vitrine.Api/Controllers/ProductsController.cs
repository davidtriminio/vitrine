using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vitrine.Application.Abstractions;
using Vitrine.Application.Catalog;
using Vitrine.Domain.Identity;

namespace Vitrine.Api.Controllers;

[ApiController]
[Route("api/v1/products")]
public sealed class ProductsController : ControllerBase
{
    private readonly IProductService _products;

    public ProductsController(IProductService products) => _products = products;

    /// <summary>Public catalog listing (active products only), paged and filterable.</summary>
    [HttpGet]
    [AllowAnonymous]
    public Task<PagedResponse<ProductResponse>> List(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] string? search = null,
        [FromQuery] bool onlyOnOffer = false,
        [FromQuery] Guid? offerId = null,
        [FromQuery] ProductSort sort = ProductSort.IdAsc,
        CancellationToken ct = default) =>
        _products.ListAsync(
            new ProductQuery(page, pageSize, categoryId, search, onlyOnOffer, OfferId: offerId, Sort: sort),
            ct);

    /// <summary>Admin listing including inactive products.</summary>
    [HttpGet("all")]
    [Authorize(Roles = AdminUser.AdminRole)]
    public Task<PagedResponse<ProductResponse>> ListAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] Guid? categoryId = null,
        [FromQuery] string? search = null,
        CancellationToken ct = default) =>
        _products.ListAsync(new ProductQuery(page, pageSize, categoryId, search, false, IncludeInactive: true), ct);

    /// <summary>Admin: the next available numeric SKU suggestion for the create form.</summary>
    [HttpGet("next-sku")]
    [Authorize(Roles = AdminUser.AdminRole)]
    public async Task<SkuSuggestionResponse> NextSku(CancellationToken ct) =>
        new(await _products.SuggestNextSkuAsync(ct));

    [HttpGet("{id:guid}")]
    [AllowAnonymous]
    public Task<ProductResponse> GetById(Guid id, CancellationToken ct) => _products.GetByIdAsync(id, ct);

    [HttpPost]
    [Authorize(Roles = AdminUser.AdminRole)]
    public async Task<ActionResult<ProductResponse>> Create(CreateProductRequest request, CancellationToken ct)
    {
        var created = await _products.CreateAsync(request, ct);
        return CreatedAtAction(nameof(GetById), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = AdminUser.AdminRole)]
    public Task<ProductResponse> Update(Guid id, UpdateProductRequest request, CancellationToken ct) =>
        _products.UpdateAsync(id, request, ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = AdminUser.AdminRole)]
    public async Task<NoContentResult> Delete(Guid id, CancellationToken ct)
    {
        await _products.DeleteAsync(id, ct);
        return NoContent();
    }
}
