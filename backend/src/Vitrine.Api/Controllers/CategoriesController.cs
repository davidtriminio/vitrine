using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vitrine.Application.Catalog;
using Vitrine.Domain.Identity;

namespace Vitrine.Api.Controllers;

[ApiController]
[Route("api/v1/categories")]
public sealed class CategoriesController : ControllerBase
{
    private readonly ICategoryService _categories;

    public CategoriesController(ICategoryService categories) => _categories = categories;

    [HttpGet]
    [AllowAnonymous]
    public Task<IReadOnlyList<CategoryResponse>> List(CancellationToken ct) => _categories.ListAsync(ct);

    [HttpPost]
    [Authorize(Roles = AdminUser.AdminRole)]
    public async Task<ActionResult<CategoryResponse>> Create(CreateCategoryRequest request, CancellationToken ct)
    {
        var created = await _categories.CreateAsync(request, ct);
        return CreatedAtAction(nameof(List), new { id = created.Id }, created);
    }

    [HttpPut("{id:guid}")]
    [Authorize(Roles = AdminUser.AdminRole)]
    public Task<CategoryResponse> Update(Guid id, UpdateCategoryRequest request, CancellationToken ct) =>
        _categories.UpdateAsync(id, request, ct);

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = AdminUser.AdminRole)]
    public async Task<NoContentResult> Delete(Guid id, CancellationToken ct)
    {
        await _categories.DeleteAsync(id, ct);
        return NoContent();
    }
}
