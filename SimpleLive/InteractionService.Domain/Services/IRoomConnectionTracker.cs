namespace InteractionService.Domain.Services;

/// <summary>
/// 直播间长连接与在线人数追踪器 (替代原有的心跳 Counter)
/// </summary>
public interface IRoomConnectionTracker
{
    /// <summary>
    /// 记录客户端连接加入
    /// </summary>
    /// <param name="roomId">房间号</param>
    /// <param name="userId">用户唯一标识</param>
    /// <param name="connectionId">SignalR连接ID</param>
    /// <returns>IsFirstConnection: 是否为该用户首次进入该房间；CurrentOnlineCount: 房间当前总人数</returns>
    Task<(bool IsFirstConnection, long CurrentOnlineCount)> JoinAsync(string roomId, string userId, string connectionId);

    /// <summary>
    /// 记录客户端连接断开
    /// </summary>
    /// <param name="connectionId">SignalR连接ID</param>
    /// <returns>IsLastConnection: 是否为该用户在该房间的最后一个连接；RoomId: 房间号；CurrentOnlineCount: 房间当前总人数</returns>
    Task<(bool IsLastConnection, string? RoomId, long CurrentOnlineCount)> LeaveAsync(string connectionId);
}
