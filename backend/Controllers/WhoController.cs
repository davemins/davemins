using davemins.Services;
using Microsoft.AspNetCore.Mvc;

namespace davemins.Controllers;

[ApiController]
[Route("api/who")]
public class WhoController(WhoService whoService) : ControllerBase
{
    [HttpGet]
    public IActionResult Get([FromQuery] string lang = "ko")
    {
        return Ok(whoService.GetProfile(lang));
    }
}
