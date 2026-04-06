using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Microsoft.AspNetCore.Mvc.Filters;
using ZD.IntegrationEvents;
namespace ZD.Transaction;

public class TransactionFilter : IAsyncActionFilter
{
    private readonly ITransactionManager _transactionManager;
    private readonly IIntegrationEventService _integrationEventService;
    private readonly ILogger<TransactionFilter> _logger;

    public TransactionFilter(
        ITransactionManager transactionManager,
        IIntegrationEventService integrationEventService,
        ILogger<TransactionFilter> logger)
    {
        _transactionManager = transactionManager ?? throw new ArgumentNullException(nameof(transactionManager));
        _integrationEventService = integrationEventService ?? throw new ArgumentNullException(nameof(integrationEventService));
        _logger = logger ?? throw new ArgumentNullException(nameof(logger));
    }

    public async Task OnActionExecutionAsync(ActionExecutingContext context, ActionExecutionDelegate next)
    {
        var isTransactional = context.ActionDescriptor.EndpointMetadata
                                     .Any(m => m is TransactionalAttribute);

        if (!isTransactional || _transactionManager.HasActiveTransaction)
        {
            await next();
            return;
        }

        var actionName = context.ActionDescriptor.DisplayName;

        // 注意这里：策略依旧从 TransactionManager 获取
        var strategy = _transactionManager.CreateExecutionStrategy();

        await strategy.ExecuteAsync(async () =>
        {
            Guid transactionId;

            await using var transaction = await _transactionManager.BeginTransactionAsync();

            using (_logger.BeginScope(new System.Collections.Generic.Dictionary<string, object> { ["TransactionContext"] = transaction.TransactionId }))
            {
                _logger.LogInformation("Begin transaction {TransactionId} for {ActionName}", transaction.TransactionId, actionName);

                var resultContext = await next();

                if (resultContext.Exception == null)
                {
                    _logger.LogInformation("Commit transaction {TransactionId} for {ActionName}", transaction.TransactionId, actionName);
                    await _transactionManager.CommitTransactionAsync(transaction);
                    transactionId = transaction.TransactionId;
                }
                else
                {
                    _logger.LogError(resultContext.Exception, "Error handling transaction for {ActionName}", actionName);
                    _transactionManager.RollbackTransaction();
                    return;
                }
            }

            // 发布集成事件（如果有的话）
            await _integrationEventService.PublishEventsThroughEventBusAsync(transactionId);
        });
    }
}