using Vitrine.Application.Abstractions;
using Vitrine.Application.Common;
using Vitrine.Domain.Branding;

namespace Vitrine.Application.Branding;

public interface IBrandSettingsService
{
    Task<BrandSettingsResponse> GetAsync(CancellationToken ct = default);

    Task<BrandSettingsResponse> UpdateAsync(UpdateBrandSettingsRequest request, CancellationToken ct = default);
}

public sealed class BrandSettingsService : IBrandSettingsService
{
    private readonly IBrandSettingsRepository _repository;
    private readonly IUnitOfWork _unitOfWork;

    public BrandSettingsService(IBrandSettingsRepository repository, IUnitOfWork unitOfWork)
    {
        _repository = repository;
        _unitOfWork = unitOfWork;
    }

    public async Task<BrandSettingsResponse> GetAsync(CancellationToken ct = default)
    {
        var settings = await _repository.GetAsync(ct)
            ?? throw new NotFoundException("Brand settings have not been configured.");

        return ToResponse(settings);
    }

    public async Task<BrandSettingsResponse> UpdateAsync(UpdateBrandSettingsRequest request, CancellationToken ct = default)
    {
        var settings = await _repository.GetAsync(ct)
            ?? throw new NotFoundException("Brand settings have not been configured.");

        settings.Update(
            request.BrandName,
            request.LogoUrl,
            request.WhatsappNumber,
            request.DefaultLocale,
            request.ThemeTokens,
            request.HeroTitle,
            request.HeroSubtitle,
            request.HeroImageUrl,
            request.Vibe);

        _repository.Update(settings);
        await _unitOfWork.SaveChangesAsync(ct);

        return ToResponse(settings);
    }

    private static BrandSettingsResponse ToResponse(BrandSettings settings) => new(
        settings.BrandName,
        settings.LogoUrl,
        settings.WhatsappNumber,
        settings.DefaultLocale,
        settings.ThemeTokens,
        settings.HeroTitle,
        settings.HeroSubtitle,
        settings.HeroImageUrl,
        settings.Vibe);
}
