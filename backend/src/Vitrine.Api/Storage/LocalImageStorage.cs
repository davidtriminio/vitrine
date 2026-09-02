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

        private readonly string _uploadsPath;

        public LocalImageStorage(string uploadsPath) => _uploadsPath = uploadsPath;

        public async Task<string> SaveAsync(Stream content, string fileName, CancellationToken ct = default)
        {
            Directory.CreateDirectory(_uploadsPath);

            var fullPath = Path.Combine(_uploadsPath, fileName);
            await using (var fileStream = File.Create(fullPath))
            {
                await content.CopyToAsync(fileStream, ct);
            }

            // Public URL stays /uploads/<file> regardless of the physical path.
            return $"/{PublicFolder}/{fileName}";
        }
}
