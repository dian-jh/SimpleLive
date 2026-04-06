using Microsoft.AspNetCore.Identity;
using UserService.Domain;
using UserService.Domain.Entities;

namespace UserService.Infrastructure;

public class UserRepository : IUserRepository
{
    private readonly UserManager<User> _userManager;
    private readonly UserDbContext _dbContext;

    public UserRepository(UserManager<User> userManager, UserDbContext dbContext)
    {
        _userManager = userManager;
        _dbContext = dbContext;
    }

    public Task<User?> FindByIdAsync(Guid userId) => _userManager.FindByIdAsync(userId.ToString());

    public Task<User?> FindByNameAsync(string userName) => _userManager.FindByNameAsync(userName);

    public Task<User?> FindByEmailAsync(string email) => _userManager.FindByEmailAsync(email);

    public Task<IdentityResult> CreateAsync(User user, string password) => _userManager.CreateAsync(user, password);

    public Task<bool> CheckPasswordAsync(User user, string password) => _userManager.CheckPasswordAsync(user, password);

    public async Task<IdentityResult> UpdateAsync(User user)
    {
        var result = await _userManager.UpdateAsync(user);
        if (result.Succeeded)
        {
            // 保存并发布领域事件
            await _dbContext.SaveEntitiesAsync();
        }

        return result;
    }
}
