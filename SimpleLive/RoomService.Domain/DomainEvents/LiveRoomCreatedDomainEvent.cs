using MediatR;

namespace RoomService.Domain.DomainEvents;

public sealed record LiveRoomCreatedDomainEvent(Guid RoomId, string RoomNumber, Guid HostId) : INotification;
