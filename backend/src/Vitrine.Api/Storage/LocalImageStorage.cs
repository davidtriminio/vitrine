using Vitrine.Application.Abstractions;

namespace Vitrine.Api.Storage;

/// <summary>
/// Stores images on the local disk under wwwroot/uploads and returns the public path
/// served by the static-files middleware. The physical location is the deployment's disk
/// (e.g. the Oracle VCN server); swap this implementation to use object storage later.
/// </summary>
public sealed class LocalImageStorage : IImageStorage
{
    public const string PublicFolder = "uploads";

    private readonly IWebHostEnvironment _environment;

    public LocalImageStorage(IWebHostEnvironment environment) => _environment = environment;

    public async Task<string> SaveAsync(Stream content, string fileName, CancellationToken ct = default)
    {
        var webRoot = _environment.WebRootPath ?? Path.Combine(_environment.ContentRootPath, "wwwroot");
        var uploadsPath = Path.Combine(webRoot, PublicFolder);
        Directory.CreateDirectory(uploadsPath);

        var fullPath = Path.Combine(uploadsPath, fileName);
        await using (var fileStream = File.Create(fullPath))
        {
            await content.CopyToAsync(fileStream, ct);
        }

        return $"/{PublicFolder}/{fileName}";
    }
}
