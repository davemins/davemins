using davemins.Services;
using Microsoft.AspNetCore.Mvc;

namespace davemins.Controllers;

[ApiController]
[Route("api/how")]
public class HowController(HowService howService) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll([FromQuery] string lang = "ko")
    {
        return Ok(howService.GetAll(lang));
    }

    [HttpGet("{slug}")]
    public IActionResult GetBySlug(string slug, [FromQuery] string lang = "ko")
    {
        var post = howService.GetBySlug(slug, lang);
        return post is null ? NotFound() : Ok(post);
    }
}
