var builder = DistributedApplication.CreateBuilder(args);

var userDb = builder.AddConnectionString("userdb");
var roomDb = builder.AddConnectionString("roomdb");

var redis = builder.AddRedis("redis");
var rabbitMq = builder.AddRabbitMQ("eventbus")
                      .WithManagementPlugin();

var userApi = builder.AddProject<Projects.UserService_API>("userservice-api")
                     .WithReference(userDb)
                     .WithReference(rabbitMq);

var roomApi = builder.AddProject<Projects.RoomService_WebAPI>("roomservice-webapi")
                    .WithReference(roomDb)
                    .WithReference(redis)
                    .WithReference(rabbitMq);

builder.AddProject<Projects.InteractionService_WebAPI>("interactionservice-webapi");

builder.Build().Run();
