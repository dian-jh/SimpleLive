var builder = WebApplication.CreateBuilder(args);
builder.AddServiceDefaults();

// ===== 在这里添加 CORS =====
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
        policy.WithOrigins("http://localhost:5173")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials());
});

// Add the reverse proxy capability to the server
builder.Services.AddReverseProxy()
    // Initialize the reverse proxy from the "ReverseProxy" section of configuration
    //读取路由和目标服务配置
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
    .AddServiceDiscoveryDestinationResolver();

var app = builder.Build();

// CORS 中间件位置很重要！
app.UseCors("AllowFrontend");   // ← 必须放在 UseRouting / MapReverseProxy 之前

// Register the reverse proxy routes
//把 YARP 挂到 ASP.NET Core 的路由系统里
app.MapReverseProxy();
app.MapDefaultEndpoints();

app.Run();
