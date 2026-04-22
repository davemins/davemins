using davemins.Services;
using Microsoft.AspNetCore.Mvc;

namespace davemins.Controllers;

[ApiController]
[Route("api/what")]
public class WhatController(WhatService whatService) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll([FromQuery] string? category, [FromQuery] string lang = "ko")
    {
        return Ok(whatService.GetAll(lang, category));
    }

    [HttpGet("{id:int}")]
    public IActionResult GetById(int id, [FromQuery] string lang = "ko")
    {
        var item = whatService.GetById(id, lang);
        return item is null ? NotFound() : Ok(item);
    }
}
