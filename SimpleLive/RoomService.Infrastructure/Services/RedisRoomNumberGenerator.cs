using System.Globalization;
using Microsoft.Extensions.Options;
using RoomService.Domain.Services;
using RoomService.Infrastructure.Options;
using StackExchange.Redis;

namespace RoomService.Infrastructure.Services;

public sealed class RedisRoomNumberGenerator : IRoomNumberGenerator
{
    private readonly IConnectionMultiplexer _redis;
    private readonly IOptions<LiveRoomOptions> _options;

    public RedisRoomNumberGenerator(IConnectionMultiplexer redis, IOptions<LiveRoomOptions> options)
    {
        _redis = redis;
        _options = options;
    }

    public async Task<string> GenerateNextAsync(CancellationToken cancellationToken = default)
    {
        var db = _redis.GetDatabase();
        var roomSequence = await db.StringIncrementAsync(_options.Value.RoomNumberSequenceKey);
        var roomNumber = _options.Value.RoomNumberSeed + roomSequence;
        return roomNumber.ToString(CultureInfo.InvariantCulture);
    }
}
