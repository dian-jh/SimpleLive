using MediatR;

namespace RoomService.Domain.DomainEvents;

public sealed record LiveRoomStartedDomainEvent(Guid RoomId, string RoomNumber, string CurrentStreamKey) : INotification;
