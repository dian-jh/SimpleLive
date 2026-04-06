
using UserService.Domain.Entities;
using UserService.Domain.Enums;

namespace UserService.Domain;

public class UserDomainService
{
    private readonly IUserRepository _repository;

    public UserDomainService(IUserRepository repository)
    {
        _repository = repository;
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
}