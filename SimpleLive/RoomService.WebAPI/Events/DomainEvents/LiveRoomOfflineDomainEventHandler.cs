using MediatR;
using RoomService.Domain.DomainEvents;
using RoomService.Domain.Services;

namespace RoomService.WebAPI.Events.DomainEvents;

public sealed class LiveRoomOfflineDomainEventHandler : INotificationHandler<LiveRoomOfflineDomainEvent>
{
    private readonly IRoomOnlineCounter _roomOnlineCounter;
    private readonly ILogger<LiveRoomOfflineDomainEventHandler> _logger;

    public LiveRoomOfflineDomainEventHandler(
        IRoomOnlineCounter roomOnlineCounter,
        ILogger<LiveRoomOfflineDomainEventHandler> logger)
    {
        _roomOnlineCounter = roomOnlineCounter;
        _logger = logger;
    }

    public async Task Handle(LiveRoomOfflineDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "LiveRoom offline cleanup done. RoomId={RoomId}, RoomNumber={RoomNumber}",
            notification.RoomId,
            notification.RoomNumber);
    }
}
