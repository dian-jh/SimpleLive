using InteractionService.Domain.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using System.Security.Claims;

namespace InteractionService.WebAPI.Hubs;

[Authorize]
//TODO：没有考虑一致性问题，之后可以用Lua来解决
public class LiveRoomHub : Hub
{

    private readonly IRoomConnectionTracker _tracker;
    private readonly ILogger<LiveRoomHub> _logger;

    public LiveRoomHub(IRoomConnectionTracker tracker, ILogger<LiveRoomHub> logger)
    {
        _tracker = tracker;
        _logger = logger;
    }

    /// <summary>
    /// 用户进入房间 (前端在连接成功后主动调用)
    /// </summary>
    public async Task JoinRoom(string roomNumber)
    {
        string userId = GetUserId();
        string connectionId = Context.ConnectionId;

        _logger.LogInformation("用户 {UserId} ({ConnectionId}) 请求加入房间 {RoomNumber}", userId, connectionId, roomNumber);

        // 1. 将连接加入 SignalR 的原生分组，组名就是房间号。这是为了方便后续广播消息。
        await Groups.AddToGroupAsync(connectionId, roomNumber);

        // 2. 更新 Redis 在线人数状态
        var (isFirstConnection, onlineCount) = await _tracker.JoinAsync(roomNumber, userId, connectionId);
        // 3. 如果这是该用户首次进入该房间，才通知同房间其他人在线人数变化（避免重复通知）
        if (isFirstConnection)
        {
            // 给这个房间里的所有人发送 "OnViewerCountChanged" 事件，参数是最新的总人数
            await Clients.Group(roomNumber).SendAsync("OnViewerCountChanged", onlineCount);
        }
    }

    /// <summary>
    /// 用户主动离开房间 (前端关闭组件/退回上一页时调用)
    /// </summary>
    public async Task LeaveRoom()
    {
        string connectionId = Context.ConnectionId;

        var (isLastConnection, roomNumber, onlineCount) = await _tracker.LeaveAsync(connectionId);

        if (roomNumber is not null)
        {
            await Groups.RemoveFromGroupAsync(connectionId, roomNumber);
        }

        if (isLastConnection && !string.IsNullOrWhiteSpace(roomNumber))
        {
            await Clients.Group(roomNumber).SendAsync("OnViewerCountChanged", onlineCount);
        }
    }

    /// <summary>
    /// 断开连接的兜底方法 (如直接关浏览器、断网)
    /// </summary>
    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        string connectionId = Context.ConnectionId;
        _logger.LogInformation("连接 {ConnectionId} 断开", connectionId);

        var (isLastConnection, roomNumber, onlineCount) = await _tracker.LeaveAsync(connectionId);

        if (isLastConnection && !string.IsNullOrWhiteSpace(roomNumber))
        {
            // 通知同房间其他人
            await Clients.Group(roomNumber).SendAsync("OnViewerCountChanged", onlineCount);
        }

        await base.OnDisconnectedAsync(exception);
    }

    /// <summary>
    /// 辅助方法：从 JWT 中提取 UserId
    /// </summary>
    private string GetUserId()
    {
        var claimValue = Context.UserIdentifier ?? Context.User?.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrWhiteSpace(claimValue))
        {
            throw new HubException("无法获取用户身份，连接被拒绝");
        }
        return claimValue;
    }

}