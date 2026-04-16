using UserService.Domain;
using UserService.Domain.Entities;
using Microsoft.EntityFrameworkCore;

namespace UserService.Infrastructure;

public class UserFollowRepository : IUserFollowRepository
{
    private readonly UserDbContext _dbContext;

    public UserFollowRepository(UserDbContext dbContext)
    {
        _dbContext = dbContext;
    }

    public async Task<bool> IsFollowingAsync(Guid userId, Guid targetUserId, CancellationToken cancellationToken = default)
    {
        // 加上 await 保证严谨的异步状态机
        return await _dbContext.Set<UserFollow>()
            .AnyAsync(x => x.UserId == userId && x.TargetUserId == targetUserId, cancellationToken);
    }

    public async Task<List<Guid>> GetFollowingUserIdsAsync(Guid userId, int pageIndex, int pageSize, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<UserFollow>()
            .Where(x => x.UserId == userId)
            .OrderByDescending(x => x.FollowTime)
            .Skip((pageIndex - 1) * pageSize)
            .Take(pageSize)
            .Select(x => x.TargetUserId)
            .ToListAsync(cancellationToken);
    }

    public async Task<List<Guid>> GetAllFollowingUserIdsAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<UserFollow>()
           .Where(x => x.UserId == userId)
           .Select(x => x.TargetUserId)
           .ToListAsync(cancellationToken);
    }

    public async Task<int> GetFollowingCountAsync(Guid userId, CancellationToken cancellationToken = default)
    {
        return await _dbContext.Set<UserFollow>()
            .CountAsync(x => x.UserId == userId, cancellationToken);
    }

    public void Add(UserFollow follow) => _dbContext.Set<UserFollow>().Add(follow);

    public void Remove(UserFollow follow) => _dbContext.Set<UserFollow>().Remove(follow);
}