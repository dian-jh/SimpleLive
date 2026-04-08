using InteractionService.Domain.Services;
using InteractionService.Infrastructure.Services;
using InteractionService.WebAPI.Hubs;

var builder = WebApplication.CreateBuilder(args);

builder.AddServiceDefaults();

// Add services to the container.

builder.Services.AddControllers();
// Learn more about configuring OpenAPI at https://aka.ms/aspnet/openapi
builder.Services.AddOpenApi();
builder.Services.AddSignalR()
    //解决跨节点(多实例)广播
    //TODO：有握手失败问题，解决方案：开启粘性会话
    //YARP的路由配置中，开启 SessionAffinity
    .AddStackExchangeRedis(builder.Configuration.GetConnectionString("redis") ?? "localhost:6379"); ;
builder.Services.AddSingleton<IRoomConnectionTracker, RedisRoomConnectionTracker>();
var app = builder.Build();

app.MapDefaultEndpoints();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.MapOpenApi();
}

app.UseHttpsRedirection();

app.UseAuthorization();

app.MapControllers();
app.MapHub<LiveRoomHub>("/hubs/liveroom");

app.Run();
