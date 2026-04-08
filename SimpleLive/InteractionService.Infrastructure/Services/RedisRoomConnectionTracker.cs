using InteractionService.Domain.Services;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Text;

namespace InteractionService.Infrastructure.Services;

public sealed class RedisRoomConnectionTracker : IRoomConnectionTracker
{
    private readonly IConnectionMultiplexer _redis;

    // 你可以把这些前缀提取到之前的 LiveRoomOptions 中，这里为了直观直接写死常量
    private const string ConnPrefix = "live:conn";
    private const string RoomUserConnsPrefix = "live:room";
    private const string RoomUsersPrefix = "live:room";

    public RedisRoomConnectionTracker(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task<(bool IsFirstConnection, long CurrentOnlineCount)> JoinAsync(string roomId, string userId, string connectionId)
    {
        var db = _redis.GetDatabase();

        roomId = roomId.Trim();
        userId = userId.Trim();

        // 结构1: 映射 ConnectionId -> RoomId:UserId (供断线时反查)
        string connKey = $"{ConnPrefix}:{connectionId}";
        await db.StringSetAsync(connKey, $"{roomId}:{userId}", TimeSpan.FromDays(1)); // 设置个一天过期兜底，防止死数据

        // 结构2: 记录该用户在该房间的具体连接集合
        string userConnsKey = $"{RoomUserConnsPrefix}:{roomId}:user:{userId}:connections";
        await db.SetAddAsync(userConnsKey, connectionId);
        // 给这个集合也续命一下
        await db.KeyExpireAsync(userConnsKey, TimeSpan.FromDays(1));

        // 第3步: 判断是否为该用户的首个连接
        long userConnCount = await db.SetLengthAsync(userConnsKey);
        bool isFirstConnection = (userConnCount == 1);

        string roomUsersKey = $"{RoomUsersPrefix}:{roomId}:users";
        if (isFirstConnection)
        {
            // 是首次进入，加入房间唯一用户集合
            await db.SetAddAsync(roomUsersKey, userId);
        }

        // 第4步: 获取房间当前在线的真实用户总数
        long totalUsers = await db.SetLengthAsync(roomUsersKey);

        return (isFirstConnection, totalUsers);
    }

    public async Task<(bool IsLastConnection, string? RoomId, long CurrentOnlineCount)> LeaveAsync(string connectionId)
    {
        var db = _redis.GetDatabase();

        // 步骤1: 反查
        string connKey = $"{ConnPrefix}:{connectionId}";
        string? mapValue = await db.StringGetAsync(connKey);

        if (string.IsNullOrWhiteSpace(mapValue))
        {
            return (false, null, 0); // 无效或已清理的连接
        }

        var parts = mapValue.Split(':');
        if (parts.Length != 2) return (false, null, 0);

        string roomId = parts[0];
        string userId = parts[1];

        // 步骤2: 移除连接集合与映射记录
        string userConnsKey = $"{RoomUserConnsPrefix}:{roomId}:user:{userId}:connections";
        await db.SetRemoveAsync(userConnsKey, connectionId);
        await db.KeyDeleteAsync(connKey);

        // 步骤3: 检查是否还有其他活跃连接 (比如用户开着两个浏览器Tab看同一个直播)
        long userConnCount = await db.SetLengthAsync(userConnsKey);
        bool isLastConnection = (userConnCount == 0);
        string roomUsersKey = $"{RoomUsersPrefix}:{roomId}:users";

        if (isLastConnection)
        {
            // 彻底离开了该房间
            await db.SetRemoveAsync(roomUsersKey, userId);
            await db.KeyDeleteAsync(userConnsKey); // 清理空集合
        }

        // 获取剩余的真实用户数
        long totalUsers = await db.SetLengthAsync(roomUsersKey);

        return (isLastConnection, roomId, totalUsers);
    }
}