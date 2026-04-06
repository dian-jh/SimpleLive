using RoomService.Domain;
using RoomService.Domain.Enums;
using RoomService.Domain.Services;

namespace RoomService.WebAPI.BackgroundServices;

public sealed class RoomHeartbeatCleanupBackgroundService : BackgroundService
{
    private static readonly TimeSpan CleanupInterval = TimeSpan.FromSeconds(20);
    private readonly IServiceProvider _serviceProvider;
    private readonly ILogger<RoomHeartbeatCleanupBackgroundService> _logger;

    public RoomHeartbeatCleanupBackgroundService(
        IServiceProvider serviceProvider,
        ILogger<RoomHeartbeatCleanupBackgroundService> logger)
    {
        _serviceProvider = serviceProvider;
        _logger = logger;
    }

    protected override async Task ExecuteAsync(CancellationToken stoppingToken)
    {
        using var timer = new PeriodicTimer(CleanupInterval);

        while (!stoppingToken.IsCancellationRequested && await timer.WaitForNextTickAsync(stoppingToken))
        {
            try
            {
                await CleanupOnceAsync(stoppingToken);
            }
            catch (OperationCanceledException) when (stoppingToken.IsCancellationRequested)
            {
                break;
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "Failed to cleanup expired heartbeat entries.");
            }
        }
    }

    private async Task CleanupOnceAsync(CancellationToken cancellationToken)
    {
        await using var scope = _serviceProvider.CreateAsyncScope();
        var repository = scope.ServiceProvider.GetRequiredService<IRoomRepository>();
        var onlineCounter = scope.ServiceProvider.GetRequiredService<IRoomOnlineCounter>();

        var liveRoomNumbers = await repository.GetRoomNumbersByStatusAsync(LiveRoomStatus.Live, cancellationToken);
        foreach (var roomNumber in liveRoomNumbers)
        {
            await onlineCounter.CleanupExpiredAsync(roomNumber, cancellationToken);
        }
    }
}
