using MediatR;

namespace RoomService.Domain.DomainEvents;

public sealed record LiveRoomOfflineDomainEvent(Guid RoomId, string RoomNumber) : INotification;
