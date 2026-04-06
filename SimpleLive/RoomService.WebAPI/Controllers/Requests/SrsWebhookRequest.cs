using System.Text.Json.Serialization;

namespace RoomService.WebAPI.Controllers.Requests;

public sealed class SrsWebhookRequest
{
    [JsonPropertyName("stream")]
    public string Stream { get; set; } = string.Empty;
}
