var builder = DistributedApplication.CreateBuilder(args);

builder.AddProject<Projects.ApiGateway>("apigateway");

builder.Build().Run();
