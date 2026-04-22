namespace davemins.Models;

public record WorkItem(
    int Id,
    LocalizedString Title,
    LocalizedString Description,
    string Category,
    string? ThumbnailUrl,
    string? ProjectUrl,
    int Year
);
