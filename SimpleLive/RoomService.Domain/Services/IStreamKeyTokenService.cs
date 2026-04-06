namespace RoomService.Domain.Services;

public interface IStreamKeyTokenService
{
    string Encrypt(StreamKeyPayload payload);
    bool TryDecrypt(string token, out StreamKeyPayload? payload, out string? errorMessage);
}

public sealed record StreamKeyPayload(string RoomNumber, Guid HostId, DateTimeOffset ExpiresAtUtc);
