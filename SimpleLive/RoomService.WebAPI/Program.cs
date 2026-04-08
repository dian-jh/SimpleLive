using FluentValidation;
using FluentValidation.AspNetCore;
using MediatR;
using Microsoft.EntityFrameworkCore;
using RoomService.Domain;
using RoomService.Infrastructure;
using RoomService.Infrastructure.Extensions;
using RoomService.WebAPI;
using RoomService.WebAPI.Events.IntegrationEvents;
using RoomService.WebAPI.Validators;
using SimpleLive.ServiceDefaults;
using ZD.JWT;

var builder = WebApplication.CreateBuilder(args);

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

builder.AddRabbitMqEventBus("eventbus")
    .AddSubscription<UserProfileUpdatedIntegrationEvent, UserProfileUpdatedIntegrationEventHandler>();

builder.AddDefaultOpenApi();

var app = builder.Build();

app.UseExceptionHandler();
//app.UseHttpsRedirection(); SRS服务器重定向会有问题，暂时注释掉，因为本地使用的是http
app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();
app.MapDefaultEndpoints();

app.UseDefaultOpenApi();

app.Run();
