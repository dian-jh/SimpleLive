using ZD.EventBus.Events;

namespace RoomService.WebAPI.Events.IntegrationEvents;

public record UserProfileUpdatedIntegrationEvent(Guid UserId, string NickName, string? AvatarUrl) : IntegrationEvent;
