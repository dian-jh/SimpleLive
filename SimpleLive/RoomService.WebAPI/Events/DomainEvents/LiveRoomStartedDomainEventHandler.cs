using MediatR;
using RoomService.Domain.DomainEvents;

namespace RoomService.WebAPI.Events.DomainEvents;

public sealed class LiveRoomStartedDomainEventHandler : INotificationHandler<LiveRoomStartedDomainEvent>
{
    private readonly ILogger<LiveRoomStartedDomainEventHandler> _logger;

    public LiveRoomStartedDomainEventHandler(ILogger<LiveRoomStartedDomainEventHandler> logger)
    {
        _logger = logger;
    }

    public Task Handle(LiveRoomStartedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation(
            "LiveRoom started. RoomId={RoomId}, RoomNumber={RoomNumber}",
            notification.RoomId,
            notification.RoomNumber);
        return Task.CompletedTask;
    }
}
