namespace RoomService.Domain.Services;

public interface IRoomNumberGenerator
{
    Task<string> GenerateNextAsync(CancellationToken cancellationToken = default);
}
