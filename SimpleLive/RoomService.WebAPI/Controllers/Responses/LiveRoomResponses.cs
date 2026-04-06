using RoomService.Domain.Enums;

namespace RoomService.WebAPI.Controllers.Responses;

public sealed class CreateLiveRoomResponse
{
    public Guid Id { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public string StreamKey { get; set; } = string.Empty;
    public LiveRoomStatus Status { get; set; }
}

public sealed class LiveRoomCardResponse
{
    public Guid Id { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public string HostUserName { get; set; } = string.Empty;
    public string? HostAvatarUrl { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string? Notice { get; set; }
    public LiveRoomStatus Status { get; set; }
    public long OnlineCount { get; set; }
}

public sealed class LiveRoomDetailResponse
{
    public Guid Id { get; set; }
    public string RoomNumber { get; set; } = string.Empty;
    public int CategoryId { get; set; }
    public Guid HostId { get; set; }
    public string HostUserName { get; set; } = string.Empty;
    public string? HostAvatarUrl { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string? Notice { get; set; }
    public LiveRoomStatus Status { get; set; }
    public long OnlineCount { get; set; }
    public string? PlayUrl { get; set; }
}

public sealed class RoomHeartbeatResponse
{
    public string RoomNumber { get; set; } = string.Empty;
    public string ViewerId { get; set; } = string.Empty;
    public long OnlineCount { get; set; }
}
