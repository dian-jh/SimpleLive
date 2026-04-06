var builder = WebApplication.CreateBuilder(args);
builder.AddServiceDefaults();

// Add the reverse proxy capability to the server
builder.Services.AddReverseProxy()
    // Initialize the reverse proxy from the "ReverseProxy" section of configuration
    .LoadFromConfig(builder.Configuration.GetSection("ReverseProxy"))
    .AddServiceDiscoveryDestinationResolver();

var app = builder.Build();
// Register the reverse proxy routes
app.MapReverseProxy();
app.MapDefaultEndpoints();

app.Run();
