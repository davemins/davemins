namespace davemins.Models;

public record Post(
    int Id,
    string Slug,
    LocalizedString Title,
    LocalizedString Summary,
    LocalizedString Content,
    DateOnly PublishedAt
);
