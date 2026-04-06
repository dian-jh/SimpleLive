using RoomService.Domain.Enums;

namespace RoomService.Domain.Services;

public sealed record LiveRoomHomeItem(
    Guid Id,
    string RoomNumber,
    int CategoryId,
    string HostUserName,
    string? HostAvatarUrl,
    string Title,
    string? CoverImageUrl,
    string? Notice,
    LiveRoomStatus Status,
    long OnlineCount);

public sealed record LiveRoomDetailResult(
    Guid Id,
    string RoomNumber,
    int CategoryId,
    Guid HostId,
    string HostUserName,
    string? HostAvatarUrl,
    string Title,
    string? CoverImageUrl,
    string? Notice,
    LiveRoomStatus Status,
    long OnlineCount,
    string? CurrentStreamKey);

public sealed record RoomHeartbeatResult(string RoomNumber, string ViewerId, long OnlineCount);
