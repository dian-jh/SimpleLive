using MediatR;
using UserService.API.Events.IntegrationEvents;
using UserService.Domain.Events.DomainEvents;
using ZD.IntegrationEvents;

namespace UserService.API.Events.DomainEvents.Handing;

public class UserProfileUpdatedDomainEventHandler : INotificationHandler<UserProfileUpdatedDomainEvent>
{
    private readonly IIntegrationEventService _integrationEventService;
    private readonly ILogger<UserProfileUpdatedDomainEventHandler> _logger;

    public UserProfileUpdatedDomainEventHandler(
        IIntegrationEventService integrationEventService,
        ILogger<UserProfileUpdatedDomainEventHandler> logger)
    {
        _integrationEventService = integrationEventService ?? throw new ArgumentNullException(nameof(integrationEventService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task Handle(UserProfileUpdatedDomainEvent notification, CancellationToken cancellationToken)
    {
        _logger.LogInformation("正在处理领域事件: {DomainEvent}, 准备生成集成事件存入发件箱", nameof(UserProfileUpdatedDomainEvent));

        // 1. 数据映射 (翻译)：将 领域事件 的数据转换到 集成事件 中
        var integrationEvent = new UserProfileUpdatedIntegrationEvent(
            notification.UserId,
            notification.NickName,
            notification.AvatarUrl
        );

        // 2. 存入发件箱 (搬运)
        await _integrationEventService.AddAndSaveEventAsync(integrationEvent);
    }
}
