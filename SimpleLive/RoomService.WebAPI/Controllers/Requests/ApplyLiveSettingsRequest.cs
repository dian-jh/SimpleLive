namespace RoomService.WebAPI.Controllers.Requests;

// 前端在设置页面填完数据，点击“开始直播”时发送的数据
public sealed class ApplyLiveSettingsRequest
{
    public int CategoryId { get; set; }
    public string Title { get; set; } = string.Empty;
    public string? CoverImageUrl { get; set; }
    public string? Notice { get; set; }
}