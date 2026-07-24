using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Http.Resilience;
using Microsoft.Extensions.Options;
using RagMiddleware.Application.Contracts;
using RagMiddleware.Domain.Identity;
using RagMiddleware.Infrastructure.External;
using RagMiddleware.Infrastructure.Persistence;
using RagMiddleware.Infrastructure.Services;

namespace RagMiddleware.Infrastructure;

public static class DependencyInjection
{
    public static IServiceCollection AddInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var connectionString = configuration.GetConnectionString("MiddlewareDb")
            ?? throw new InvalidOperationException("Connection string 'MiddlewareDb' is required.");

        services.AddDbContext<ApplicationDbContext>(options => options.UseNpgsql(connectionString));
        services
            .AddIdentityCore<ApplicationUser>(options =>
            {
                options.User.RequireUniqueEmail = true;
                options.SignIn.RequireConfirmedEmail = true;
            })
            .AddRoles<IdentityRole<Guid>>()
            .AddEntityFrameworkStores<ApplicationDbContext>()
            .AddSignInManager();

        services.AddScoped<IJwtTokenService, JwtTokenService>();
        services.AddScoped<IRefreshTokenService, RefreshTokenService>();
        services.AddScoped<IAuditLogService, AuditLogService>();
        services
            .AddHttpClient<IRagApiClient, RagApiClient>((serviceProvider, client) =>
            {
                var options = serviceProvider.GetRequiredService<IOptions<RagMiddleware.Application.Options.RagApiOptions>>().Value;
                client.BaseAddress = new Uri(options.BaseUrl);
                client.Timeout = Timeout.InfiniteTimeSpan;
            })
            .AddStandardResilienceHandler(options => options.Retry.DisableForUnsafeHttpMethods());

        return services;
    }
}
