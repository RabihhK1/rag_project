using System.Security.Claims;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.RateLimiting;
using Microsoft.Extensions.Options;
using RagMiddleware.Application.Contracts;
using RagMiddleware.Application.Options;
using RagMiddleware.Domain.Identity;

namespace RagMiddleware.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public sealed class AuthController(
    IConfiguration configuration,
    UserManager<ApplicationUser> userManager,
    SignInManager<ApplicationUser> signInManager,
    IJwtTokenService jwtTokenService,
    IRefreshTokenService refreshTokenService,
    IOptions<RagMiddleware.Application.Options.AuthorizationOptions> authorizationOptions) : ControllerBase
{
    private const string RefreshCookieName = "rag_refresh";

    [AllowAnonymous]
    [HttpGet("google/login")]
    [EnableRateLimiting("auth")]
    public IActionResult GoogleLogin()
    {
        if (string.IsNullOrWhiteSpace(configuration["Google:ClientId"]))
        {
            return Problem(statusCode: StatusCodes.Status503ServiceUnavailable, title: "Google sign-in is not configured.");
        }

        var properties = signInManager.ConfigureExternalAuthenticationProperties(
            "Google",
            Url.ActionLink(nameof(GoogleCallback))!);
        return Challenge(properties, "Google");
    }

    [AllowAnonymous]
    [HttpGet("google/callback")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> GoogleCallback(CancellationToken cancellationToken)
    {
        var externalResult = await HttpContext.AuthenticateAsync(IdentityConstants.ExternalScheme);
        var principal = externalResult.Principal;
        var providerKey = principal?.FindFirstValue(ClaimTypes.NameIdentifier);
        var email = principal?.FindFirstValue(ClaimTypes.Email);
        var verificationClaim = principal?.FindFirstValue("email_verified")
            ?? principal?.FindFirstValue("verified_email");
        var isVerified = string.Equals(verificationClaim, "true", StringComparison.OrdinalIgnoreCase);
        if (!externalResult.Succeeded || principal is null || string.IsNullOrWhiteSpace(providerKey) || string.IsNullOrWhiteSpace(email) || !isVerified)
        {
            return Problem(statusCode: StatusCodes.Status401Unauthorized, title: "Unable to verify the Google account email.");
        }

        var loginInfo = new UserLoginInfo("Google", providerKey, "Google");

        var user = await userManager.FindByLoginAsync(loginInfo.LoginProvider, loginInfo.ProviderKey)
            ?? await userManager.FindByEmailAsync(email);
        if (user is null)
        {
            user = new ApplicationUser
            {
                UserName = email,
                Email = email,
                EmailConfirmed = true,
                DisplayName = principal.FindFirstValue(ClaimTypes.Name) ?? email,
                AvatarUrl = principal.FindFirstValue("picture"),
                LastLoginAtUtc = DateTimeOffset.UtcNow,
            };
            var createResult = await userManager.CreateAsync(user);
            if (!createResult.Succeeded)
            {
                return Problem(statusCode: StatusCodes.Status500InternalServerError, title: "Unable to create the user session.");
            }
        }

        if (await userManager.FindByLoginAsync(loginInfo.LoginProvider, loginInfo.ProviderKey) is null)
        {
            var linkResult = await userManager.AddLoginAsync(user, loginInfo);
            if (!linkResult.Succeeded)
            {
                return Problem(statusCode: StatusCodes.Status500InternalServerError, title: "Unable to link the Google account.");
            }
        }

        user.EmailConfirmed = true;
        user.DisplayName = principal.FindFirstValue(ClaimTypes.Name) ?? user.DisplayName;
        user.AvatarUrl = principal.FindFirstValue("picture") ?? user.AvatarUrl;
        user.LastLoginAtUtc = DateTimeOffset.UtcNow;
        await userManager.UpdateAsync(user);
        if (!await userManager.IsInRoleAsync(user, "User"))
        {
            await userManager.AddToRoleAsync(user, "User");
        }

        var adminEmails = authorizationOptions.Value.AdminEmails;
        if (adminEmails.Contains(email, StringComparer.OrdinalIgnoreCase) && !await userManager.IsInRoleAsync(user, "Admin"))
        {
            await userManager.AddToRoleAsync(user, "Admin");
        }

        var refreshToken = await refreshTokenService.IssueAsync(user.Id, HttpContext.Connection.RemoteIpAddress?.ToString(), cancellationToken);
        SetRefreshCookie(refreshToken);
        return Redirect($"{configuration["Frontend:Url"]!.TrimEnd('/')}/auth/callback");
    }

    [AllowAnonymous]
    [HttpPost("refresh")]
    [EnableRateLimiting("auth")]
    public async Task<IActionResult> Refresh(CancellationToken cancellationToken)
    {
        if (!Request.Cookies.TryGetValue(RefreshCookieName, out var rawToken) || string.IsNullOrWhiteSpace(rawToken))
        {
            return Unauthorized();
        }

        var rotated = await refreshTokenService.RotateAsync(rawToken, HttpContext.Connection.RemoteIpAddress?.ToString(), cancellationToken);
        if (rotated is null)
        {
            DeleteRefreshCookie();
            return Unauthorized();
        }

        var user = await userManager.FindByIdAsync(rotated.UserId.ToString());
        if (user is null)
        {
            DeleteRefreshCookie();
            return Unauthorized();
        }

        var accessToken = jwtTokenService.Create(user, (await userManager.GetRolesAsync(user)).ToArray());
        SetRefreshCookie(rotated);
        return Ok(new
        {
            access_token = accessToken.AccessToken,
            token_type = "Bearer",
            expires_in = (int)(accessToken.ExpiresAtUtc - DateTimeOffset.UtcNow).TotalSeconds,
        });
    }

    [Authorize]
    [HttpGet("me")]
    public async Task<IActionResult> Me()
    {
        var user = await userManager.GetUserAsync(User);
        if (user is null)
        {
            return Unauthorized();
        }

        return Ok(new
        {
            id = user.Id,
            email = user.Email,
            display_name = user.DisplayName,
            avatar_url = user.AvatarUrl,
            roles = await userManager.GetRolesAsync(user),
        });
    }

    [Authorize]
    [HttpPost("logout")]
    public async Task<IActionResult> Logout(CancellationToken cancellationToken)
    {
        if (Request.Cookies.TryGetValue(RefreshCookieName, out var rawToken) && !string.IsNullOrWhiteSpace(rawToken))
        {
            await refreshTokenService.RevokeAsync(rawToken, cancellationToken);
        }

        DeleteRefreshCookie();
        return NoContent();
    }

    private void SetRefreshCookie(RefreshTokenIssueResult refreshToken) => Response.Cookies.Append(
        RefreshCookieName,
        refreshToken.RawToken,
        new CookieOptions
        {
            HttpOnly = true,
            Secure = true,
            SameSite = SameSiteMode.Lax,
            Path = "/api/v1/auth",
            Expires = refreshToken.ExpiresAtUtc,
            IsEssential = true,
        });

    private void DeleteRefreshCookie() => Response.Cookies.Delete(RefreshCookieName, new CookieOptions
    {
        Path = "/api/v1/auth",
        Secure = true,
        SameSite = SameSiteMode.Lax,
    });
}
