using Microsoft.AspNetCore.Identity;
using UserService.Domain.Entities;
namespace UserService.Domain;

public interface IUserRepository
{
    Task<User?> FindByIdAsync(Guid userId);
    Task<User?> FindByNameAsync(string userName);
    Task<User?> FindByEmailAsync(string email);
    Task<IdentityResult> CreateAsync(User user, string password);
    Task<bool> CheckPasswordAsync(User user, string password);
    Task<IdentityResult> UpdateAsync(User user);
}
