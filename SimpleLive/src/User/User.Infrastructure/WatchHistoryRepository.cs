using Microsoft.EntityFrameworkCore;
using System;
using System.Collections.Generic;
using System.Text;
using UserService.Domain;
using UserService.Domain.Entities;

namespace UserService.Infrastructure;

public class WatchHistoryRepository : IWatchHistoryRepository
{
    private readonly UserDbContext _dbContext;

    public WatchHistoryRepository(UserDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<WatchHistory?> FindAsync(Guid userId, string roomNumber, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<WatchHistory>()
            .FirstOrDefaultAsync(x => x.UserId == userId && x.RoomNumber == roomNumber, cancellationToken);
    }

    public async Task<List<WatchHistory>> GetHistoryAsync(Guid userId, int pageIndex, int pageSize, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<WatchHistory>()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.LastWatchTime)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetHistoryCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<WatchHistory>()
            .CountAsync(x => x.UserId == userId, cancellationToken);
    }

    public void Add(WatchHistory history) => _dbContext.Set<WatchHistory>().Add(history);

    public void Update(WatchHistory history) => _dbContext.Set<WatchHistory>().Update(history);

    // 【核心完善】：超限清理逻辑
    public async Task DeleteOldestBeyondLimitAsync(Guid userId, int maxLimit, CancellationToken cancellationToken = default)
    {
        // 1. 为了兼容各种数据库提供程序 (PostgreSQL/SQL Server)，我们先查出需要删除的 ID。
        // 由于每次只多出一条记录，所以 Skip(maxLimit) 通常只会返回极少量的 ID，查出到内存非常快。
        var idsToDelete = await _dbContext.Set<WatchHistory>()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.LastWatchTime)
            .Skip(maxLimit)
            .Select(x => x.Id)
            .ToListAsync(cancellationToken);

        // 2. 如果存在超出限制的数据，使用 EF Core 7+ 的 ExecuteDeleteAsync 直接在数据库端执行批量删除，不走上下文追踪
        if (idsToDelete.Any())
        {
            await _dbContext.Set<WatchHistory>()
                .Where(x => idsToDelete.Contains(x.Id))
                .ExecuteDeleteAsync(cancellationToken);
        }
    }
}