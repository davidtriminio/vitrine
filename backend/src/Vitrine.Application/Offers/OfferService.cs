using Vitrine.Application.Abstractions;
using Vitrine.Application.Common;
using Vitrine.Domain.Offers;

namespace Vitrine.Application.Offers;

public interface IOfferService
{
    Task<IReadOnlyList<OfferResponse>> ListAsync(CancellationToken ct = default);

    Task<IReadOnlyList<ActiveOfferBannerResponse>> ListActiveBannersAsync(CancellationToken ct = default);

    Task<OfferResponse> GetByIdAsync(Guid id, CancellationToken ct = default);

    Task<OfferResponse> CreateAsync(CreateOfferRequest request, CancellationToken ct = default);

    Task<OfferResponse> UpdateAsync(Guid id, UpdateOfferRequest request, CancellationToken ct = default);

    Task DeleteAsync(Guid id, CancellationToken ct = default);
}

public sealed class OfferService : IOfferService
{
    private readonly IOfferRepository _offers;
    private readonly IUnitOfWork _unitOfWork;
    private readonly IClock _clock;

    public OfferService(IOfferRepository offers, IUnitOfWork unitOfWork, IClock clock)
    {
        _offers = offers;
        _unitOfWork = unitOfWork;
        _clock = clock;
    }

    public async Task<IReadOnlyList<OfferResponse>> ListAsync(CancellationToken ct = default)
    {
        var offers = await _offers.GetAllAsync(ct);
        return offers.Select(OfferMapper.ToResponse).ToList();
    }

    public async Task<IReadOnlyList<ActiveOfferBannerResponse>> ListActiveBannersAsync(CancellationToken ct = default)
    {
        var offers = await _offers.GetActiveAsync(_clock.UtcNow, ct);
        return offers
            .Where(o => o.BannerTitle is not null)
            .Select(OfferMapper.ToBanner)
            .ToList();
    }

    public async Task<OfferResponse> GetByIdAsync(Guid id, CancellationToken ct = default)
    {
        var offer = await _offers.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Offer '{id}' was not found.");

        return OfferMapper.ToResponse(offer);
    }

    public async Task<OfferResponse> CreateAsync(CreateOfferRequest request, CancellationToken ct = default)
    {
        var offer = new Offer(
            Guid.NewGuid(),
            request.Name,
            EnumParsing.ParseDiscountType(request.DiscountType),
            request.Value,
            EnumParsing.ParseOfferScope(request.Scope),
            request.TargetId,
            request.StartsAt,
            request.EndsAt,
            request.IsActive,
            request.BannerTitle,
            request.BannerSubtitle,
            request.BannerBackgroundColor,
            request.BannerImageUrl);

        await _offers.AddAsync(offer, ct);
        await _unitOfWork.SaveChangesAsync(ct);

        return OfferMapper.ToResponse(offer);
    }

    public async Task<OfferResponse> UpdateAsync(Guid id, UpdateOfferRequest request, CancellationToken ct = default)
    {
        var offer = await _offers.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Offer '{id}' was not found.");

        offer.Update(
            request.Name,
            EnumParsing.ParseDiscountType(request.DiscountType),
            request.Value,
            EnumParsing.ParseOfferScope(request.Scope),
            request.TargetId,
            request.StartsAt,
            request.EndsAt,
            request.IsActive,
            request.BannerTitle,
            request.BannerSubtitle,
            request.BannerBackgroundColor,
            request.BannerImageUrl);

        _offers.Update(offer);
        await _unitOfWork.SaveChangesAsync(ct);

        return OfferMapper.ToResponse(offer);
    }

    public async Task DeleteAsync(Guid id, CancellationToken ct = default)
    {
        var offer = await _offers.GetByIdAsync(id, ct)
            ?? throw new NotFoundException($"Offer '{id}' was not found.");

        _offers.Remove(offer);
        await _unitOfWork.SaveChangesAsync(ct);
    }
}
