using System.Net;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Vitrine.Application.Branding;
using Vitrine.Application.Catalog;

namespace Vitrine.Api.Controllers;

/// <summary>
/// Server-rendered share pages that expose Open Graph / Twitter Card meta tags so link
/// scrapers (WhatsApp, Facebook, Telegram, …) can build a rich preview with the product
/// image, name and description. The Angular SPA cannot do this on its own because those
/// crawlers do not execute JavaScript, so a human hitting this URL is redirected to the
/// real storefront page while the crawler reads the static tags.
/// </summary>
[ApiController]
[Route("share")]
public sealed class ShareController : ControllerBase
{
    private readonly IProductService _products;
    private readonly IBrandSettingsService _settings;
    private readonly IConfiguration _configuration;

    public ShareController(
        IProductService products,
        IBrandSettingsService settings,
        IConfiguration configuration)
    {
        _products = products;
        _settings = settings;
        _configuration = configuration;
    }

    /// <summary>Open Graph landing page for a single product ("ramo").</summary>
    [HttpGet("products/{id:guid}")]
    [AllowAnonymous]
    public async Task<ContentResult> Product(Guid id, CancellationToken ct)
    {
        var product = await _products.GetByIdAsync(id, ct);
        var brand = await _settings.GetAsync(ct);

        var storefrontUrl = $"{FrontendBaseUrl().TrimEnd('/')}/producto/{product.Id}";
        var shareUrl = $"{Request.Scheme}://{Request.Host}/share/products/{product.Id}";
        var imageUrl = ToAbsolute(product.Images.Count > 0 ? product.Images[0] : brand.LogoUrl);

        var description = string.IsNullOrWhiteSpace(product.Description)
            ? $"{product.Name} — {brand.BrandName}"
            : product.Description;

        var html = BuildHtml(
            title: product.Name,
            description: description,
            imageUrl: imageUrl,
            siteName: brand.BrandName,
            shareUrl: shareUrl,
            storefrontUrl: storefrontUrl);

        return Content(html, "text/html; charset=utf-8");
    }

    private string FrontendBaseUrl() =>
        _configuration["Frontend:BaseUrl"]
        ?? _configuration.GetSection("Cors:Origins").Get<string[]>()?.FirstOrDefault()
        ?? "http://localhost:4200";

    /// <summary>Resolves storage-relative paths (e.g. /uploads/x.jpg) against this host.</summary>
    private string? ToAbsolute(string? url)
    {
        if (string.IsNullOrWhiteSpace(url))
        {
            return null;
        }

        if (url.StartsWith("http://", StringComparison.OrdinalIgnoreCase) ||
            url.StartsWith("https://", StringComparison.OrdinalIgnoreCase))
        {
            return url;
        }

        var path = url.StartsWith('/') ? url : $"/{url}";
        return $"{Request.Scheme}://{Request.Host}{path}";
    }

    private static string BuildHtml(
        string title,
        string description,
        string? imageUrl,
        string siteName,
        string shareUrl,
        string storefrontUrl)
    {
        static string E(string? value) => WebUtility.HtmlEncode(value ?? string.Empty);

        var image = imageUrl is null
            ? string.Empty
            : $"""
                <meta property="og:image" content="{E(imageUrl)}" />
                  <meta property="og:image:alt" content="{E(title)}" />
                  <meta name="twitter:image" content="{E(imageUrl)}" />
              """;

        // The redirect is for humans; crawlers stop at the <head> meta tags above it.
        return $"""
            <!doctype html>
            <html lang="es">
              <head>
                <meta charset="utf-8" />
                <meta name="viewport" content="width=device-width, initial-scale=1" />
                <title>{E(title)} — {E(siteName)}</title>
                <meta name="description" content="{E(description)}" />

                <meta property="og:type" content="product" />
                <meta property="og:site_name" content="{E(siteName)}" />
                <meta property="og:title" content="{E(title)}" />
                <meta property="og:description" content="{E(description)}" />
                <meta property="og:url" content="{E(shareUrl)}" />
                {image}

                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content="{E(title)}" />
                <meta name="twitter:description" content="{E(description)}" />

                <link rel="canonical" href="{E(storefrontUrl)}" />
                <meta http-equiv="refresh" content="0; url={E(storefrontUrl)}" />
              </head>
              <body>
                <p>Redirigiendo a <a href="{E(storefrontUrl)}">{E(title)}</a>…</p>
                <script>location.replace({System.Text.Json.JsonSerializer.Serialize(storefrontUrl)});</script>
              </body>
            </html>
            """;
    }
}
