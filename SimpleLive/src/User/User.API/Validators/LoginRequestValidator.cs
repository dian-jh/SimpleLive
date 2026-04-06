using FluentValidation;
using UserService.API.Controllers.Request;

namespace UserService.API.Validators;

public sealed class LoginRequestValidator : AbstractValidator<LoginRequest>
{
    public LoginRequestValidator()
    {
        RuleFor(request => request.Account)
            .NotEmpty()
            .WithMessage("账号不能为空。");

        RuleFor(request => request.Password)
            .NotEmpty()
            .WithMessage("密码不能为空。");
    }
}
