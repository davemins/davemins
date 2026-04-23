namespace davemins.DTOs;

public record WorkItemDto(
    int Id,
    string Title,
    string Description,
    string Category,
    string? ThumbnailUrl,
    string? ProjectUrl,
    int Year,
    List<string> Tags,
    string Content
);
