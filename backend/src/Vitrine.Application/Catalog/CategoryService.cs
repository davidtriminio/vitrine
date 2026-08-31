using Vitrine.Application.Abstractions;
using Vitrine.Application.Common;
using Vitrine.Domain.Catalog;

namespace Vitrine.Application.Catalog;

public interface ICategoryService
{
    Task<IReadOnlyList<CategoryResponse>> ListAsync(CancellationToken ct = default);

    Task<CategoryResponse> CreateAsync(CreateCategoryRequest request, CancellationToken ct = default);

    Task<CategoryResponse> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct = default);

    Task DeleteAsync(Guid id, CancellationToken ct = default);
}

public sealed class CategoryService : ICategoryService
{
    private readonly ICategoryRepository _categories;
    private readonly IUnitOfWork _unitOfWork;

    public CategoryService(ICategoryRepository categories, IUnitOfWork unitOfWork)
    {
        _categories = categories;
        _unitOfWork = unitOfWork;
    }

    public async Task<IReadOnlyList<CategoryResponse>> ListAsync(CancellationToken ct = default)
    {
        var categories = await _categories.GetAllAsync(ct);
        return categories.Select(CatalogMapper.ToResponse).ToList();
    }

    public async Task<CategoryResponse> CreateAsync(CreateCategoryRequest request, CancellationToken ct = default)
    {
        var category = new Category(Guid.NewGuid(), request.Name, request.Slug);

        if (await _categories.SlugExistsAsync(category.Slug, null, ct))
        {
            throw new ConflictException($"A category with slug '{category.Slug}' already exists.");
        }

        await _categories.AddAsync(category, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return CatalogMapper.ToResponse(category);
    }

    public async Task<CategoryResponse> UpdateAsync(Guid id, UpdateCategoryRequest request, CancellationToken ct = default)
    {
        var category = await _categories.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Category '{id}' was not found.");

        category.Rename(request.Name, request.Slug);

        if (await _categories.SlugExistsAsync(category.Slug, id, ct))
        {
            throw new ConflictException($"A category with slug '{category.Slug}' already exists.");
        }

        _categories.Update(category);
        await _unitOfWork.SaveChangesAsync(ct);

        return CatalogMapper.ToResponse(category);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var category = await _categories.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Category '{id}' was not found.");

        if (await _categories.HasProductsAsync(id, ct))
        {
            throw new ConflictException("Cannot delete a category that still has products.");
        }

        _categories.Remove(category);
        await _unitOfWork.SaveChangesAsync(ct);
    }
}
