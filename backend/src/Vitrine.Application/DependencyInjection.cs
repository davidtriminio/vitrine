using Microsoft.Extensions.DependencyInjection;
using Vitrine.Application.Branding;
using Vitrine.Application.Catalog;
using Vitrine.Application.Identity;
using Vitrine.Application.Offers;
using Vitrine.Domain.Pricing;

namespace Vitrine.Application;

public static class DependencyInjection
{
    /// <summary>Registers application use-case services and the domain pricing service.</summary>
    public static IServiceCollection AddApplication(this IServiceCollection services)
    {
        services.AddSingleton<PricingService>();

        services.AddScoped<IProductService, ProductService>();
        services.AddScoped<ICategoryService, CategoryService>();
        services.AddScoped<IOfferService, OfferService>();
        services.AddScoped<IBrandSettingsService, BrandSettingsService>();
        services.AddScoped<IAuthService, AuthService>();

        return services;
    }
}
