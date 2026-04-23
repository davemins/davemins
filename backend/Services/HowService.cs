using davemins.DTOs;
using davemins.Utils;

namespace davemins.Services;

public class HowService(string contentRoot)
{
    private List<(Dictionary<string, string> Meta, string Body, string Slug)> LoadPosts(string lang)
    {
        var dir = Path.Combine(contentRoot, "posts", lang);
        if (!Directory.Exists(dir))
            dir = Path.Combine(contentRoot, "posts", "ko");
        if (!Directory.Exists(dir)) return [];

        return Directory.GetFiles(dir, "*.md")
            .Select(path =>
            {
                var (meta, body) = FrontmatterParser.Parse(File.ReadAllText(path));
                var slug = Path.GetFileNameWithoutExtension(path);
                return (meta, body, slug);
            })
            .Where(x => x.meta.Count > 0)
            .OrderByDescending(x => x.meta.GetValueOrDefault("publishedAt") ?? "")
            .ToList();
    }

    public List<PostListItemDto> GetAll(string lang)
    {
        return LoadPosts(lang)
            .Select((x, i) => new PostListItemDto(
                Id: i + 1,
                Slug: x.Slug,
                Title: x.Meta.GetValueOrDefault("title") ?? "",
                Summary: x.Meta.GetValueOrDefault("summary") ?? "",
                PublishedAt: x.Meta.GetValueOrDefault("publishedAt") ?? ""
            ))
            .ToList();
    }

    public PostDetailDto? GetBySlug(string slug, string lang)
    {
        var path = Path.Combine(contentRoot, "posts", lang, $"{slug}.md");
        if (!File.Exists(path))
            path = Path.Combine(contentRoot, "posts", "ko", $"{slug}.md");
        if (!File.Exists(path)) return null;

        var (meta, body) = FrontmatterParser.Parse(File.ReadAllText(path));

        return new PostDetailDto(
            Id: 0,
            Slug: slug,
            Title: meta.GetValueOrDefault("title") ?? "",
            Summary: meta.GetValueOrDefault("summary") ?? "",
            Content: body,
            PublishedAt: meta.GetValueOrDefault("publishedAt") ?? ""
        );
    }
}
