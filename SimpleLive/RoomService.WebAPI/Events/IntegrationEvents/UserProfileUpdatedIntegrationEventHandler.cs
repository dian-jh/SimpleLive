using RoomService.Domain;
using ZD.EventBus.Abstractions;

namespace RoomService.WebAPI.Events.IntegrationEvents;

public sealed class UserProfileUpdatedIntegrationEventHandler : IIntegrationEventHandler<UserProfileUpdatedIntegrationEvent>
{
    private readonly RoomDomainService _domainService;
    private readonly ILogger<UserProfileUpdatedIntegrationEventHandler> _logger;

    public UserProfileUpdatedIntegrationEventHandler(
        RoomDomainService domainService,
        ILogger<UserProfileUpdatedIntegrationEventHandler> logger)
    {
        _domainService = domainService;
        _logger = logger;
    }

    public async Task Handle(UserProfileUpdatedIntegrationEvent @event)
    {
        if (@event.UserId == Guid.Empty || string.IsNullOrWhiteSpace(@event.NickName))
        {
            _logger.LogWarning("Ignore UserProfileUpdatedIntegrationEvent because payload is invalid. UserId={UserId}", @event.UserId);
            return;
        }

        var updatedCount = await _domainService.SyncHostProfileAndSaveAsync(
            hostId: @event.UserId,
            hostUserName: @event.NickName,
            hostAvatarUrl: @event.AvatarUrl);

        if (updatedCount <= 0)
        {
            return;
        }
        _logger.LogInformation(
            "Synced host profile snapshot into {RoomCount} room(s). UserId={UserId}",
            updatedCount,
            @event.UserId);
    }
}
