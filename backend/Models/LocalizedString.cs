namespace davemins.Models;

public record LocalizedString(string Ko, string En, string Es)
{
    public string Get(string lang) => lang switch
    {
        "en" => En,
        "es" => Es,
        _ => Ko
    };
}
