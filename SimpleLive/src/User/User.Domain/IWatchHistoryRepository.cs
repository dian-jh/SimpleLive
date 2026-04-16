using System;
using System.Collections.Generic;
using System.Text;
using UserService.Domain.Entities;

namespace UserService.Domain;

public interface IWatchHistoryRepository
{
    // 查找单条记录（用于更新最新观看时间）
    Task<WatchHistory?> FindAsync(Guid userId, string roomNumber, CancellationToken cancellationToken = default);
    // 获取观看历史列表
    Task<List<WatchHistory>> GetHistoryAsync(Guid userId, int pageIndex, int pageSize, CancellationToken cancellationToken = default);

    void Add(WatchHistory history);
    void Update(WatchHistory history);

    Task<int> GetHistoryCountAsync(Guid userId, CancellationToken cancellationToken = default);

    Task DeleteOldestBeyondLimitAsync(Guid userId, int maxLimit, CancellationToken cancellationToken = default);
}
