namespace davemins.Models;

public record SocialLink(string Platform, string Url);

public record WhoProfile(
    LocalizedString Name,
    LocalizedString Role,
    LocalizedString Bio,
    List<LocalizedString> Skills,
    List<SocialLink> SocialLinks
);
