namespace RoomService.WebAPI.Controllers.Requests;

public sealed class HeartbeatRequest
{
    public string ViewerId { get; set; } = string.Empty;
}
