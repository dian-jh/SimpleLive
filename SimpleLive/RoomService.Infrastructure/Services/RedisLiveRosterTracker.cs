using RoomService.Domain.Services;
using StackExchange.Redis;
using System;
using System.Collections.Generic;
using System.Text;

namespace RoomService.Infrastructure.Services;

public sealed class RedisLiveRosterTracker : ILiveRosterTracker
{
    private readonly IDatabase _redis;
    private const string LiveHostsRedisKey = "Global:LiveHosts";

    public RedisLiveRosterTracker(IConnectionMultiplexer redisConnection)
    {
        _redis = redisConnection.GetDatabase();
    }

    public async Task AddToLiveListAsync(Guid hostId, string roomNumber)
    {
        await _redis.HashSetAsync(LiveHostsRedisKey, hostId.ToString(), roomNumber);
    }

    public async Task RemoveFromLiveListAsync(Guid hostId)
    {
        await _redis.HashDeleteAsync(LiveHostsRedisKey, hostId.ToString());
    }
}