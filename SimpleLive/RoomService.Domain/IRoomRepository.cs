using RoomService.Domain.Entities;
using RoomService.Domain.Enums;
using ZD.DomainCommons;

namespace RoomService.Domain;

public interface IRoomRepository : IRepository<LiveRoom>
{
    LiveRoom Add(LiveRoom room);
    LiveRoom Update(LiveRoom room);

    Task<LiveRoom?> FindByIdAsync(Guid roomId, CancellationToken cancellationToken = default);
    Task<LiveRoom?> FindByRoomNumberAsync(string roomNumber, CancellationToken cancellationToken = default);
    Task<LiveRoom?> FindByHostIdAsync(Guid hostId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<LiveRoom>> GetByHostIdAsync(Guid hostId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<LiveRoom>> GetByStatusAsync(
        LiveRoomStatus status,
        int? categoryId,
        int pageIndex,
        int pageSize,
        CancellationToken cancellationToken = default);
    Task<IReadOnlyList<string>> GetRoomNumbersByStatusAsync(LiveRoomStatus status, CancellationToken cancellationToken = default);
}
