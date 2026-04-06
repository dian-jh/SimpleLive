using ZD.EventBus.Events;

namespace UserService.API.Events.IntegrationEvents;

public record UserProfileUpdatedIntegrationEvent(Guid UserId, string NickName, string? AvatarUrl) : IntegrationEvent;
