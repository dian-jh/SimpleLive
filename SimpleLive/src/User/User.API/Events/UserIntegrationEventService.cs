using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Storage;
using UserService.Infrastructure;
using ZD.EventBus.Abstractions;
using ZD.EventBus.Events;
using ZD.IntegrationEventLogEF.Services;
using ZD.IntegrationEvents;

namespace UserService.API.Events;

public class UserIntegrationEventService : IIntegrationEventService
{
    private readonly IEventBus _eventBus;
    private readonly UserDbContext _userContext;
    private readonly IIntegrationEventLogService _eventLogService;
    private readonly ILogger<UserIntegrationEventService> _logger;

    public UserIntegrationEventService(
        IEventBus eventBus,
        UserDbContext userContext,
        IIntegrationEventLogService integrationEventLogService,
        ILogger<UserIntegrationEventService> logger)
    {
        _eventBus = eventBus;
        _userContext = userContext;
        _eventLogService = integrationEventLogService;
        _logger = logger;
    }

    // 核心 1：将事件存入数据库的“发件箱”表
    public async Task AddAndSaveEventAsync(IntegrationEvent evt)
    {
        _logger.LogInformation("将集成事件存入发件箱: {IntegrationEventId}", evt.Id);

        // 将事件保存到日志表（与业务表共享该事务）
        await _eventLogService.SaveEventAsync(evt, _userContext.GetCurrentTransaction());
    }

    // 核心 2：从发件箱取出事件，投递给 RabbitMQ
    public async Task PublishEventsThroughEventBusAsync(Guid transactionId)
    {
        // 查出刚才那个事务里所有待发送的事件
        var pendingLogEvents = await _eventLogService.RetrieveEventLogsPendingToPublishAsync(transactionId);

        foreach (var logEvt in pendingLogEvents)
        {
            try
            {
                // 标记为“发送中”
                await _eventLogService.MarkEventAsInProgressAsync(logEvt.EventId);

                // 真正投递给 RabbitMQ
                await _eventBus.PublishAsync(logEvt.IntegrationEvent);

                // 标记为“已发送”
                await _eventLogService.MarkEventAsPublishedAsync(logEvt.EventId);
            }
            catch (Exception ex)
            {
                _logger.LogError(ex, "发布集成事件失败: {IntegrationEventId}", logEvt.EventId);
                // 标记为“失败”（后台定时任务后续可以重试捞起）
                await _eventLogService.MarkEventAsFailedAsync(logEvt.EventId);
            }
        }
    }
}
