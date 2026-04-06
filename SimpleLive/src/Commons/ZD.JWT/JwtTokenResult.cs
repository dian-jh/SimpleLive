namespace ZD.JWT;

public sealed record JwtTokenResult(string AccessToken, DateTime ExpiresAtUtc);
