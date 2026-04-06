namespace RoomService.WebAPI.Controllers.Requests;

public sealed class CreateLiveRoomRequest
{
    public int CategoryId { get; set; }
    //public Guid HostId { get; set; }从JWT中获取
    //public string HostUserName { get; set; } = string.Empty;
    public string? HostAvatarUrl { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string? Notice { get; set; }
}
