using davemins.DTOs;
using davemins.Services;
using Microsoft.AspNetCore.Mvc;

namespace davemins.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController(ContactService contactService) : ControllerBase
{
    [HttpPost]
    public IActionResult Post([FromBody] ContactRequest request)
    {
        var result = contactService.Receive(request);
        return Ok(result);
    }
}
