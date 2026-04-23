using davemins.DTOs;
using davemins.Utils;

namespace davemins.Services;

public class WhatService(string contentRoot)
{
    private List<WorkItemDto> LoadAll(string lang)
    {
        var dir = Path.Combine(contentRoot, "works", lang);
        if (!Directory.Exists(dir))
            dir = Path.Combine(contentRoot, "works", "ko");
        if (!Directory.Exists(dir)) return [];

        return Directory.GetFiles(dir, "*.md")
            .OrderBy(f => f)
            .Select(path =>
            {
                var (meta, body) = FrontmatterParser.Parse(File.ReadAllText(path));
                return (meta, body);
            })
            .Where(x => x.meta.Count > 0)
            .Select(x =>
            {
                var (meta, body) = x;
                return new WorkItemDto(
                    Id: int.TryParse(meta.GetValueOrDefault("id"), out var id) ? id : 0,
                    Title: meta.GetValueOrDefault("title") ?? "",
                    Description: meta.GetValueOrDefault("description") ?? "",
                    Category: meta.GetValueOrDefault("category") ?? "",
                    ThumbnailUrl: meta.GetValueOrDefault("thumbnailUrl"),
                    ProjectUrl: NullIfEmpty(meta.GetValueOrDefault("projectUrl")),
                    Year: int.TryParse(meta.GetValueOrDefault("year"), out var year) ? year : 0,
                    Tags: ParseList(meta.GetValueOrDefault("tags")),
                    Content: body,
                    CoverImage: NullIfEmpty(meta.GetValueOrDefault("coverImage")),
                    Images: ParseList(meta.GetValueOrDefault("images"))
                );
            })
            .ToList();
    }

    public List<WorkItemDto> GetAll(string lang, string? category = null)
    {
        var items = LoadAll(lang);
        return string.IsNullOrEmpty(category)
            ? items
            : items.Where(i => i.Category == category).ToList();
    }

    public WorkItemDto? GetById(int id, string lang)
    {
        return LoadAll(lang).FirstOrDefault(i => i.Id == id);
    }

    private static List<string> ParseList(string? value) =>
        string.IsNullOrWhiteSpace(value) ? [] :
        value.Split(',').Select(s => s.Trim()).Where(s => !string.IsNullOrEmpty(s)).ToList();

    private static string? NullIfEmpty(string? value) =>
        string.IsNullOrWhiteSpace(value) ? null : value;
}
