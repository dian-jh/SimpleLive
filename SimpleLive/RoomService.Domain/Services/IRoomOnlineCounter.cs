namespace RoomService.Domain.Services;

public interface IRoomOnlineCounter
{
    Task<long> HeartbeatAsync(string roomNumber, string viewerId, CancellationToken cancellationToken = default);
    Task<long> GetOnlineCountAsync(string roomNumber, CancellationToken cancellationToken = default);
    Task<IReadOnlyDictionary<string, long>> GetOnlineCountsAsync(IEnumerable<string> roomNumbers, CancellationToken cancellationToken = default);
    Task CleanupExpiredAsync(string roomNumber, CancellationToken cancellationToken = default);
    Task ClearRoomAsync(string roomNumber, CancellationToken cancellationToken = default);
}
