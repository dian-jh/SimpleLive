using Microsoft.EntityFrameworkCore.Storage;

namespace ZD.Transaction;

/// <summary>
/// 全局通用的事务管理器接口
/// </summary>
public interface ITransactionManager
{
    bool HasActiveTransaction { get; }

    // 暴露出执行策略，以支持重试机制
    IExecutionStrategy CreateExecutionStrategy();

    Task<IDbContextTransaction> BeginTransactionAsync();

    Task CommitTransactionAsync(IDbContextTransaction transaction);

    void RollbackTransaction();
}