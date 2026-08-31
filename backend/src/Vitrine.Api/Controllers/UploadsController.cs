using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vitrine.Application.Abstractions;
using Vitrine.Application.Media;
using Vitrine.Domain.Common;
using Vitrine.Domain.Identity;

namespace Vitrine.Api.Controllers;

[ApiController]
[Route("api/v1/uploads")]
[Authorize(Roles = AdminUser.AdminRole)]
public sealed class UploadsController : ControllerBase
{
    private const long MaxBytes = 5 * 1024 * 1024; // 5 MB
    private static readonly HashSet<string> AllowedExtensions = new(StringComparer.OrdinalIgnoreCase)
    {
        ".jpg", ".jpeg", ".png", ".webp", ".gif"
    };

    private readonly IImageStorage _storage;

    public UploadsController(IImageStorage storage) => _storage = storage;

    /// <summary>Uploads an image and returns its absolute public URL.</summary>
    [HttpPost("image")]
    public async Task<UploadResponse> UploadImage(IFormFile? file, CancellationToken ct)
    {
        if (file is null || file.Length == 0)
        {
            throw new DomainException("No file was provided.");
        }

        if (file.Length > MaxBytes)
        {
            throw new DomainException("The image exceeds the 5 MB limit.");
        }

        var extension = Path.GetExtension(file.FileName);
        if (string.IsNullOrWhiteSpace(extension) || !AllowedExtensions.Contains(extension))
        {
            throw new DomainException("Unsupported image type. Use JPG, PNG, WEBP or GIF.");
        }

        if (!file.ContentType.StartsWith("image/", StringComparison.OrdinalIgnoreCase))
        {
            throw new DomainException("The uploaded file is not an image.");
        }

        var fileName = $"{Guid.NewGuid():N}{extension.ToLowerInvariant()}";
        await using var stream = file.OpenReadStream();
        var relativePath = await _storage.SaveAsync(stream, fileName, ct);

        var absoluteUrl = $"{Request.Scheme}://{Request.Host}{relativePath}";
        return new UploadResponse(absoluteUrl);
    }
}
