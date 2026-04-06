

using MediatR;

namespace UserService.Domain.Events.DomainEvents;

public record UserProfileUpdatedDomainEvent(Guid UserId, string NickName, string? AvatarUrl): INotification;