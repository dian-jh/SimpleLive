using Microsoft.EntityFrameworkCore.Storage;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Text;
using UserService.Domain;

namespace UserService.Infrastructure;

public class RedisLiveStatusChecker : ILiveStatusChecker
{
    private readonly IConnectionMultiplexer _redis;

    // Room 模块写入的 Hash 表
    private const string LiveHostsRedisKey = "Global:LiveHosts";

    private const string RoomUsersPrefix = "live:room";

    public RedisLiveStatusChecker(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task<Dictionary<Guid, (bool IsLive, int ViewerCount)>> GetLiveStatusesBatchAsync(IEnumerable<Guid> hostIds)
    {
        var db = _redis.GetDatabase();
        var dict = new Dictionary<Guid, (bool IsLive, int ViewerCount)>();
        var idList = hostIds.ToList();

        if (!idList.Any()) return dict;

        // 1. 批量从 Hash 中获取对应的 RoomNumber (HMGET)
        var hashFields = idList.Select(id => (RedisValue)id.ToString()).ToArray();
        var liveRoomNumbers = await db.HashGetAsync(LiveHostsRedisKey, hashFields);

        // 2. 准备批量查询 SignalR 在线人数
        var batch = db.CreateBatch();
        var viewerCountTasks = new List<(Guid HostId, Task<long> Task)>();

        for (int i = 0; i < idList.Count; i++)
        {
            var roomNumberVal = liveRoomNumbers[i];

            // 如果 HasValue 为 true，说明在名单里，即正在直播！
            if (roomNumberVal.HasValue)
            {
                string roomNumber = roomNumberVal.ToString();

                string roomUsersKey = $"{RoomUsersPrefix}:{roomNumber}:users";

                // 查询该房间唯一用户集合的长度 (SCARD)
                var task = batch.SetLengthAsync(roomUsersKey);
                viewerCountTasks.Add((idList[i], task));
            }
            else
            {
                // 未开播，直接填入默认值
                dict[idList[i]] = (false, 0);
            }
        }

        // 发送所有 Redis 人数查询命令
        batch.Execute();

        // 等待所有查询人数的异步任务完成
        if (viewerCountTasks.Any())
        {
            await Task.WhenAll(viewerCountTasks.Select(x => x.Task));
        }

        // 3. 组装最终结果
        foreach (var item in viewerCountTasks)
        {
            int viewerCount = (int)item.Task.Result;
            dict[item.HostId] = (true, viewerCount);
        }

        return dict;
    }
}