namespace UserService.API.Controllers.Response;

public class WatchHistoryResponse
{
    public string RoomNumber { get; set; } = string.Empty;
    public DateTime LastWatchTime { get; set; }
    // 提示：前端 UI (yx5.png) 显示了房间封面和标题。由于这些在 Room 微服务中，
    // 这里先返回核心的 RoomNumber，前端拿到后再去请求 Room 接口批量获取详情，
    // 或者后续在这里通过 RPC 调用 Room 服务进行组装。
}