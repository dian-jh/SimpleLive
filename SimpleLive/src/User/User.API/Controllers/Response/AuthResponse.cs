using ZD.JWT;
using AppUser = UserService.Domain.Entities.User;

namespace User.API.Controllers.Response;

public sealed record AuthResponse(
    Guid UserId,
    string UserName,
    string NickName,
    string? Email,
    string AccessToken,
    DateTime ExpiresAtUtc)
{
    public static AuthResponse From(AppUser user, JwtTokenResult token)
    {
        return new AuthResponse(
            user.Id,
            user.UserName ?? string.Empty,
            user.NickName,
            user.Email,
            token.AccessToken,
            token.ExpiresAtUtc);
    }
}
