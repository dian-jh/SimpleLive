using System.Security.Claims;

namespace ZD.JWT;

public interface IJwtTokenService
{
    JwtTokenResult GenerateToken(Guid userId, string userName, string? email = null, IEnumerable<string>? roles = null, IEnumerable<Claim>? additionalClaims = null);
}
