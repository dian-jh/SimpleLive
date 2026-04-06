using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using RoomService.Domain;
using RoomService.WebAPI.Controllers.Requests;

namespace RoomService.WebAPI.Controllers;

[ApiController]
[Route("api/liverooms/srs")]
public sealed class SrsWebhookController : ControllerBase
{
    private readonly RoomDomainService _domainService;

    public SrsWebhookController(RoomDomainService domainService)
    {
        _domainService = domainService;
    }

    [HttpPost("on_publish")]
    [AllowAnonymous]
    public async Task<IActionResult> OnPublish([FromBody] SrsWebhookRequest request, CancellationToken cancellationToken)
    {
        var (success, errorMessage) = await _domainService.HandleOnPublishAsync(
            request.Stream,
            DateTimeOffset.UtcNow,
            cancellationToken);

        if (!success)
        {
            return Unauthorized(new { Message = errorMessage });
        }

        return Ok(new {code = 0});
    }

    [HttpPost("on_unpublish")]
    [AllowAnonymous]
    public async Task<IActionResult> OnUnpublish([FromBody] SrsWebhookRequest request, CancellationToken cancellationToken)
    {
        var (success, errorMessage) = await _domainService.HandleOnUnpublishAsync(request.Stream, cancellationToken);
        if (!success)
        {
            return BadRequest(new { Message = errorMessage });
        }

        return Ok(new { code = 0 });
    }
}
