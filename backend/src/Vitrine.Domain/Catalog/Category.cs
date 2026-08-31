using Vitrine.Domain.Common;

namespace Vitrine.Domain.Catalog;

/// <summary>A flat product category. Hierarchy is intentionally out of MVP scope.</summary>
public sealed class Category
{
    public Guid Id { get; private set; }
    public string Name { get; private set; }
    public string Slug { get; private set; }

    // EF Core materialization constructor.
    private Category()
    {
        Name = string.Empty;
        Slug = string.Empty;
    }

    public Category(Guid id, string name, string slug)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException("Category name is required.");
        }

        if (string.IsNullOrWhiteSpace(slug))
        {
            throw new DomainException("Category slug is required.");
        }

        Id = id == Guid.Empty ? Guid.NewGuid() : id;
        Name = name.Trim();
        Slug = slug.Trim().ToLowerInvariant();
    }

    public void Rename(string name, string slug)
    {
        if (string.IsNullOrWhiteSpace(name))
        {
            throw new DomainException("Category name is required.");
        }

        if (string.IsNullOrWhiteSpace(slug))
        {
            throw new DomainException("Category slug is required.");
        }

        Name = name.Trim();
        Slug = slug.Trim().ToLowerInvariant();
    }
}
