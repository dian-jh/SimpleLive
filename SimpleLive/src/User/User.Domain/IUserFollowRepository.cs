using UserService.Domain.Entities;
using System.Threading;  
using System.Threading.Tasks;

namespace UserService.Domain;

public interface IUserFollowRepository
{
    // 判断是否已经关注
    Task<bool> IsFollowingAsync(Guid userId, Guid targetUserId, CancellationToken cancellationToken = default);
    // 获取我的关注列表
    Task<List<Guid>> GetFollowingUserIdsAsync(Guid userId, int pageIndex, int pageSize, CancellationToken cancellationToken = default);
    // 获取关注总数
    Task<int> GetFollowingCountAsync(Guid userId, CancellationToken cancellationToken = default);

    void Add(UserFollow follow);
    void Remove(UserFollow follow);

    // 获取所有关注的主播 ID
    Task<List<Guid>> GetAllFollowingUserIdsAsync(Guid userId, CancellationToken cancellationToken = default);
}
