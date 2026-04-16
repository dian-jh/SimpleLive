var builder = DistributedApplication.CreateBuilder(args);

var userDb = builder.AddConnectionString("userdb");
var roomDb = builder.AddConnectionString("roomdb");

var redis = builder.AddRedis("redis");
var rabbitMq = builder.AddRabbitMQ("eventbus")
                      .WithManagementPlugin();

var userApi = builder.AddProject<Projects.UserService_API>("userservice-api")
                     .WithReference(userDb)
                     .WithReference(redis)
                     .WithReference(rabbitMq);

var roomApi = builder.AddProject<Projects.RoomService_WebAPI>("roomservice-webapi")
                    .WithReference(roomDb)
                    .WithReference(redis)
                    .WithReference(rabbitMq);

var interactionApi = builder.AddProject<Projects.InteractionService_WebAPI>("interactionservice-webapi")
                    .WithReference(redis);

var gateway = builder.AddProject<Projects.ApiGateway>("apigateway")  // 项目名称改成你实际的
                     .WithReference(userApi)
                     .WithReference(roomApi)
                     .WithReference(interactionApi)
                     .WaitFor(userApi)      // 可选：等待后端启动
                     .WaitFor(roomApi)
                     .WaitFor(interactionApi)
                     .WithExternalHttpEndpoints();  // 重要：暴露给外部访问

builder.Build().Run();
