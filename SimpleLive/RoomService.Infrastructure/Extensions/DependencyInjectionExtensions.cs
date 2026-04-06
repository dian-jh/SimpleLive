using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using RoomService.Domain;
using RoomService.Domain.Services;
using RoomService.Infrastructure.Options;
using RoomService.Infrastructure.Services;
using StackExchange.Redis;

namespace RoomService.Infrastructure.Extensions;

public static class DependencyInjectionExtensions
{
    public static IServiceCollection AddRoomInfrastructure(this IServiceCollection services, IConfiguration configuration)
    {
        var roomDbConnection = configuration.GetConnectionString("roomdb");
        if (string.IsNullOrWhiteSpace(roomDbConnection))
        {
            throw new InvalidOperationException("Connection string 'roomdb' is not configured.");
        }

        var redisConnection = configuration.GetConnectionString("redis");
        if (string.IsNullOrWhiteSpace(redisConnection))
        {
            throw new InvalidOperationException("Connection string 'redis' is not configured.");
        }

        services.Configure<LiveRoomOptions>(configuration.GetSection(LiveRoomOptions.SectionName));

        services.AddDbContext<RoomDbContext>(options =>
        {
            options.UseNpgsql(roomDbConnection, npgsql =>
            {
                npgsql.MigrationsAssembly(typeof(RoomDbContext).Assembly.FullName);
            });
        });

        services.AddScoped<IRoomRepository, RoomRepository>();
        services.AddScoped<RoomDomainService>();
        services.AddScoped<IRoomNumberGenerator, RedisRoomNumberGenerator>();
        services.AddScoped<IStreamKeyTokenService, AesStreamKeyTokenService>();
        services.AddSingleton<IRoomOnlineCounter, RedisRoomOnlineCounter>();
        services.AddSingleton<IConnectionMultiplexer>(_ => ConnectionMultiplexer.Connect(redisConnection));

        return services;
    }
}
