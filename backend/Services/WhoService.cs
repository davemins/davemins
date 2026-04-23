using System.Text.Json;
using davemins.DTOs;

namespace davemins.Services;

public class WhoService(string contentRoot)
{
    private static readonly JsonSerializerOptions _jsonOptions = new() { PropertyNameCaseInsensitive = true };

    public WhoDto? GetProfile(string lang)
    {
        var path = Path.Combine(contentRoot, "who", $"{lang}.json");
        if (!File.Exists(path))
            path = Path.Combine(contentRoot, "who", "ko.json");
        if (!File.Exists(path)) return null;

        var json = File.ReadAllText(path);
        return JsonSerializer.Deserialize<WhoDto>(json, _jsonOptions);
    }
}
