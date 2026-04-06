using FluentValidation;
using FluentValidation.AspNetCore;
using Microsoft.EntityFrameworkCore;
using SimpleLive.ServiceDefaults;
using UserService.API.Events;
using UserService.API.Validators;
using UserService.Domain;
using UserService.Infrastructure;
using UserService.Infrastructure.Extensions;
using ZD.IntegrationEventLogEF.Services;
using ZD.IntegrationEvents;
using ZD.JWT;
using ZD.Transaction;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

builder.Services.AddControllers(options =>
{
    options.Filters.Add<TransactionFilter>();
});
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<RegisterRequestValidator>();

builder.Services.AddUserInfrastructure(builder.Configuration);
builder.Services.AddZdJwt(builder.Configuration);

builder.Services.AddDbContext<UserDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("userdb"));
});
builder.Services.AddMediatR(cfg =>
{
    cfg.RegisterServicesFromAssembly(typeof(Program).Assembly);           // 当前项目
    cfg.RegisterServicesFromAssembly(typeof(UserDomainService).Assembly); // Domain 项目
});

builder.Services.AddScoped<ITransactionManager>(sp => sp.GetRequiredService<UserDbContext>());

builder.Services.AddScoped<IUserRepository, UserRepository>();
builder.Services.AddScoped<UserDomainService>();

builder.Services.AddScoped<IIntegrationEventService, UserIntegrationEventService>();
builder.Services.AddScoped<IIntegrationEventLogService, IntegrationEventLogService<UserDbContext>>();

builder.AddRabbitMqEventBus("eventbus");

builder.AddDefaultOpenApi();

var app = builder.Build();

app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapDefaultEndpoints();

app.UseDefaultOpenApi();

app.Run();
