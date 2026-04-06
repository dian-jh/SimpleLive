using MediatR;
using RoomService.Domain.DomainEvents;

namespace RoomService.WebAPI.Events.DomainEvents;

public sealed class LiveRoomCreatedDomainEventHandler : INotificationHandler<LiveRoomCreatedDomainEvent>
{
    private readonly ILogger<LiveRoomCreatedDomainEventHandler> _logger;

    public LiveRoomCreatedDomainEventHandler(ILogger<LiveRoomCreatedDomainEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LiveRoomCreatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "LiveRoom created. RoomId={RoomId}, RoomNumber={RoomNumber}, HostId={HostId}",
            notification.RoomId,
            notification.RoomNumber,
            notification.HostId);
        return Task.CompletedTask;
    }
}
