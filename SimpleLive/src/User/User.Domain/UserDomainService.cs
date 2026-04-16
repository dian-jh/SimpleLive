
using System.Linq.Dynamic.Core;
using UserService.Domain.Entities;
using UserService.Domain.Enums;

namespace UserService.Domain;

public class UserDomainService
{
    private readonly IUserRepository _repository;
    private readonly IWatchHistoryRepository _watchHistoryRepository;

    public UserDomainService(IUserRepository repository,
        IWatchHistoryRepository watchHistoryRepository)
    {
        _repository = repository;
        _watchHistoryRepository = watchHistoryRepository;
    }

    // 注册业务逻辑
    public async Task<(bool Success, string ErrorMessage)> RegisterAsync(string account, string password)
    {
        bool isEmail = account.Contains("@");

        // 1. 唯一性校验
        var existingUser = isEmail
            ? await _repository.FindByEmailAsync(account)
            : await _repository.FindByNameAsync(account);

        if (existingUser != null)
            return (false, "该账号或邮箱已被注册");

        // 2. 构建实体
        var user = new User(userName: account);

        if (isEmail)
        {
            user.Email = account;
        }

        // 3. 执行创建
        var result = await _repository.CreateAsync(user, password);
        if (!result.Succeeded)
        {
            string errors = string.Join(";", result.Errors.Select(e => e.Description));
            return (false, $"注册失败: {errors}");
        }

        return (true, string.Empty);
    }

    // 登录业务逻辑
    public async Task<(bool Success, User? User, string ErrorMessage)> LoginAsync(string account, string password)
    {
        bool isEmail = account.Contains("@");
        var user = isEmail
            ? await _repository.FindByEmailAsync(account)
            : await _repository.FindByNameAsync(account);

        if (user == null)
            return (false, null, "账号不存在");

        var isValid = await _repository.CheckPasswordAsync(user, password);
        if (!isValid)
            return (false, null, "密码错误");

        return (true, user, string.Empty);
    }

    // 资料修改逻辑
    public async Task<(bool Success, string ErrorMessage)> UpdateProfileAsync(Guid userId, string nickName, string? signature, GenderType gender, DateOnly? dateOfBirth, string? location)
    {
        var user = await _repository.FindByIdAsync(userId);
        if (user == null)
            return (false, "用户不存在");

        // 调用充血模型方法
        user.UpdateProfile(nickName, signature, gender, dateOfBirth, location);

        var result = await _repository.UpdateAsync(user);
        if (!result.Succeeded)
            return (false, "资料更新失败");

        return (true, string.Empty);
    }

    /// <summary>
    /// 记录观看历史 (Upsert 逻辑 + 500条限制)
    /// </summary>
    public async Task<(bool Success, string ErrorMessage)> RecordWatchHistoryAsync(
        Guid userId,
        string roomNumber,
        CancellationToken cancellationToken = default)
    {
        if (string.IsNullOrWhiteSpace(roomNumber)) return (false, "房间号无效");

        // 1. 查找是否存在该房间的历史
        var existing = await _watchHistoryRepository.FindAsync(userId, roomNumber, cancellationToken);

        if (existing != null)
        {
            // 更新时间
            existing.UpdateLastWatchTime();
            _watchHistoryRepository.Update(existing);
        }
        else
        {
            // 新增记录
            var history = new WatchHistory(userId, roomNumber);
            _watchHistoryRepository.Add(history);
        }

        // 2. 超限清理 (保留最近500条)
        // 这个方法在 Infrastructure 层实现具体的 SQL 删除逻辑
        await _watchHistoryRepository.DeleteOldestBeyondLimitAsync(userId, 500, cancellationToken);

        return (true, string.Empty);
    }
}