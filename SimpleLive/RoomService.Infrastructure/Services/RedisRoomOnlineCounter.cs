using Microsoft.Extensions.Options;
using RoomService.Domain.Services;
using RoomService.Infrastructure.Options;
using StackExchange.Redis;

namespace RoomService.Infrastructure.Services;

public sealed class RedisRoomOnlineCounter : IRoomOnlineCounter
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IOptions<LiveRoomOptions> _options;

    public RedisRoomOnlineCounter(IConnectionMultiplexer redis, IOptions<LiveRoomOptions> options)
    {
        _redis = redis;
        _options = options;
    }

    public async Task<long> HeartbeatAsync(string roomNumber, string viewerId, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(roomNumber);
        ArgumentException.ThrowIfNullOrWhiteSpace(viewerId);

        var roomKey = GetOnlineKey(roomNumber);
        var db = _redis.GetDatabase();

        var nowUnixSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var expiredBefore = nowUnixSeconds - _options.Value.ViewerHeartbeatExpireSeconds;

        await db.SortedSetAddAsync(roomKey, viewerId.Trim(), nowUnixSeconds);
        await db.SortedSetRemoveRangeByScoreAsync(roomKey, double.NegativeInfinity, expiredBefore);
        return await db.SortedSetLengthAsync(roomKey);
    }

    public async Task<long> GetOnlineCountAsync(string roomNumber, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(roomNumber);

        await CleanupExpiredAsync(roomNumber, cancellationToken);
        var roomKey = GetOnlineKey(roomNumber);
        var db = _redis.GetDatabase();
        return await db.SortedSetLengthAsync(roomKey);
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
        var nowUnixSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var expiredBefore = nowUnixSeconds - _options.Value.ViewerHeartbeatExpireSeconds;

        foreach (var roomNumber in roomNumberList)
        {
            var key = GetOnlineKey(roomNumber);
            await db.SortedSetRemoveRangeByScoreAsync(key, double.NegativeInfinity, expiredBefore);
        }

        var result = new Dictionary<string, long>(roomNumberList.Count, StringComparer.Ordinal);
        foreach (var roomNumber in roomNumberList)
        {
            var count = await db.SortedSetLengthAsync(GetOnlineKey(roomNumber));
            result[roomNumber] = count;
        }

        return result;
    }

    public async Task CleanupExpiredAsync(string roomNumber, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(roomNumber);

        var db = _redis.GetDatabase();
        var nowUnixSeconds = DateTimeOffset.UtcNow.ToUnixTimeSeconds();
        var expiredBefore = nowUnixSeconds - _options.Value.ViewerHeartbeatExpireSeconds;

        await db.SortedSetRemoveRangeByScoreAsync(
            GetOnlineKey(roomNumber),
            double.NegativeInfinity,
            expiredBefore);
    }

    public async Task ClearRoomAsync(string roomNumber, CancellationToken cancellationToken = default)
    {
        ArgumentException.ThrowIfNullOrWhiteSpace(roomNumber);
        var db = _redis.GetDatabase();
        await db.KeyDeleteAsync(GetOnlineKey(roomNumber));
    }

    private string GetOnlineKey(string roomNumber)
    {
        var prefix = _options.Value.OnlineZSetKeyPrefix;
        return $"{prefix}:{roomNumber.Trim()}";
    }
}
