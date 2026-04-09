var builder = WebApplication.CreateBuilder(args);
builder.AddServiceDefaults();

// Add the reverse proxy capability to the server
builder.Services.AddReverseProxy()
    // Initialize the reverse proxy from the "ReverseProxy" section of configuration
    //读取路由和目标服务配置
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
    .AddServiceDiscoveryDestinationResolver();

var app = builder.Build();
// Register the reverse proxy routes
//把 YARP 挂到 ASP.NET Core 的路由系统里
app.MapReverseProxy();
app.MapDefaultEndpoints();

app.Run();
