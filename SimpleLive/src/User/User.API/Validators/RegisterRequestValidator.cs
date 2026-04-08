using FluentValidation;
using UserService.API.Controllers.Request;

namespace UserService.API.Validators;

public sealed class RegisterRequestValidator : AbstractValidator<RegisterRequest>
{
    private const string UserNamePattern = @"^(?=.{6,20}$)(?=.*[A-Za-z])(?=.*\d)[A-Za-z0-9][A-Za-z0-9._-]*$";
    private const string PasswordPattern = @"^(?=.*[A-Za-z])(?=.*\d).{6,}$";

    public RegisterRequestValidator()
    {
        // 1. 首先确保 Account 字段有值
        RuleFor(request => request.Account)
            .NotEmpty()
            .WithMessage("账号或邮箱不能为空。");

        // 2. 如果包含 '@'，则视其为邮箱，执行邮箱格式校验
        When(request => !string.IsNullOrWhiteSpace(request.Account) && request.Account.Contains('@'), () =>
        {
            RuleFor(request => request.Account)
                .EmailAddress()
                .WithMessage("邮箱格式不正确。");
        });

        // 3. 如果不包含 '@'，则视其为普通用户名，执行正则校验
        When(request => !string.IsNullOrWhiteSpace(request.Account) && !request.Account.Contains('@'), () =>
        {
            RuleFor(request => request.Account)
                .Matches(UserNamePattern)
                .WithMessage("用户名必须为6-20位，包含字母和数字，且以字母或数字开头。");
        });

        // 4. 密码校验保持不变
        RuleFor(request => request.Password)
            .NotEmpty()
            .WithMessage("密码不能为空。")
            .Matches(PasswordPattern)
            .WithMessage("密码至少6位，且必须包含字母和数字。");
    }
}
