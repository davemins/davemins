namespace davemins.DTOs;

public record PostListItemDto(
    int Id,
    string Slug,
    string Title,
    string Summary,
    string PublishedAt
);

public record PostDetailDto(
    int Id,
    string Slug,
    string Title,
    string Summary,
    string Content,
    string PublishedAt
);
