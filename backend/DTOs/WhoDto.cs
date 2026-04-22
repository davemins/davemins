namespace davemins.DTOs;

public record SocialLinkDto(string Platform, string Url);

public record WhoDto(
    string Name,
    string Role,
    string Bio,
    List<string> Skills,
    List<SocialLinkDto> SocialLinks
);
