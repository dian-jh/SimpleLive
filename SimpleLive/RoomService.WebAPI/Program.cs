using FluentValidation;
using FluentValidation.AspNetCore;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RoomService.Domain;
using RoomService.Domain.Services;
using RoomService.Infrastructure;
using RoomService.Infrastructure.Extensions;
using RoomService.Infrastructure.Services;
using RoomService.WebAPI;
using RoomService.WebAPI.Events.IntegrationEvents;
using RoomService.WebAPI.Validators;
using SimpleLive.ServiceDefaults;
using ZD.JWT;

var builder = WebApplication.CreateBuilder(args);
//跨越问题，配置CORS，之后放到网关那里统一处理，这里进行测试
//TODO
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://localhost:5173") // 允许你的 Vite 开发服务器
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

builder.AddServiceDefaults();

builder.Services.AddControllers();
builder.Services.AddFluentValidationAutoValidation();
builder.Services.AddValidatorsFromAssemblyContaining<CreateLiveRoomRequestValidator>();
builder.Services.AddMediatR(cfg => cfg.RegisterServicesFromAssemblyContaining<Program>());

builder.Services.AddZdJwt(builder.Configuration);

builder.Services.AddExceptionHandler<ValidationExceptionHandler>();
builder.Services.AddProblemDetails();

builder.Services.AddRoomInfrastructure(builder.Configuration);


builder.Services.AddDbContext<RoomDbContext>(options =>
{
    options.UseNpgsql(builder.Configuration.GetConnectionString("roomdb"));
});

builder.Services.AddScoped<RoomDomainService>();
builder.Services.AddScoped<IRoomRepository, RoomRepository>();
builder.Services.AddSingleton<ILiveRosterTracker, RedisLiveRosterTracker>();

builder.AddRabbitMqEventBus("eventbus")
    .AddSubscription<UserProfileUpdatedIntegrationEvent, UserProfileUpdatedIntegrationEventHandler>();

builder.AddDefaultOpenApi();

var app = builder.Build();

app.UseExceptionHandler();
//app.UseHttpsRedirection(); SRS服务器重定向会有问题，暂时注释掉，因为本地使用的是http
app.UseCors("AllowFrontend");
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapDefaultEndpoints();

app.UseDefaultOpenApi();

app.Run();
