namespace davemins.DTOs;

public record SocialLinkDto(string Platform, string Url);
public record ExperienceDto(string Title, string Company, string Period);

public class WhoDto
{
    public string Name { get; set; } = "";
    public List<string> Bio { get; set; } = [];
    public List<string> Makes { get; set; } = [];
    public List<ExperienceDto> Experience { get; set; } = [];
    public List<SocialLinkDto> SocialLinks { get; set; } = [];
}
