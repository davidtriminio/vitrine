namespace Vitrine.Application.Abstractions;

/// <summary>Stores uploaded images and returns the public (relative) path to reference them.</summary>
public interface IImageStorage
{
    /// <summary>Persists the content and returns a public relative path, e.g. "/uploads/ab12.jpg".</summary>
    Task<string> SaveAsync(Stream content, string fileName, CancellationToken ct = default);
}
