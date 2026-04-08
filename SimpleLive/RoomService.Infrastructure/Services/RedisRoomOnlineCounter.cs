using RoomService.Domain.Services;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Text;

namespace RoomService.Infrastructure.Services;

public sealed class RedisRoomOnlineCounter : IRoomOnlineCounter
{
    private readonly IConnectionMultiplexer _redis;

    // 这里的常量必须和 InteractionService 中保持绝对一致！
    private const string RoomUsersPrefix = "live:room";

    public RedisRoomOnlineCounter(IConnectionMultiplexer redis)
    {
        _redis = redis;
    }

    public async Task<long> GetOnlineCountAsync(string roomNumber, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(roomNumber);

        var db = _redis.GetDatabase();
        string roomUsersKey = $"{RoomUsersPrefix}:{roomNumber.Trim()}:users";

        // 直接 O(1) 获取 Set 的大小
        return await db.SetLengthAsync(roomUsersKey);
    }

    public async Task<IReadOnlyDictionary<string, long>> GetOnlineCountsAsync(IEnumerable<string> roomNumbers, CancellationToken cancellationToken = default)
    {
        var roomNumberList = roomNumbers
            .Where(x => !string.IsNullOrWhiteSpace(x))
            .Distinct(StringComparer.Ordinal)
            .ToList();

        if (roomNumberList.Count == 0)
        {
            return new Dictionary<string, long>(StringComparer.Ordinal);
        }

        var db = _redis.GetDatabase();
        var result = new Dictionary<string, long>(roomNumberList.Count, StringComparer.Ordinal);

        // 性能优化：使用并发任务 (Task.WhenAll) 批量从 Redis 获取数据，避免 for 循环里串行 await 导致的阻塞
        var tasks = roomNumberList.Select(async roomNumber =>
        {
            string roomUsersKey = $"{RoomUsersPrefix}:{roomNumber.Trim()}:users";
            long count = await db.SetLengthAsync(roomUsersKey);
            return new { RoomNumber = roomNumber, Count = count };
        });

        var counts = await Task.WhenAll(tasks);

        foreach (var item in counts)
        {
            result[item.RoomNumber] = item.Count;
        }

        return result;
    }
}