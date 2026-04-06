namespace RoomService.Infrastructure.Options;

public sealed class LiveRoomOptions
{
    public const string SectionName = "LiveRoom";

    public long RoomNumberSeed { get; set; } = 100000;
    public string RoomNumberSequenceKey { get; set; } = "live:room:number:seq";

    public string StreamKeyAesSecret { get; set; } = "SimpleLive_LiveRoom_StreamKey_AES_Secret_2026";
    public int StreamKeyExpireMinutes { get; set; } = 120;

    public int ViewerHeartbeatExpireSeconds { get; set; } = 30;
    public string OnlineZSetKeyPrefix { get; set; } = "live:room:online";

    public string SrsIp { get; set; } = "127.0.0.1";
    public int SrsHttpFlvPort { get; set; } = 8080;
}
