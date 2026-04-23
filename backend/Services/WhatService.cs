using davemins.DTOs;
using davemins.Utils;

namespace davemins.Services;

public class WhatService(string contentRoot)
{
    private List<WorkItemDto> LoadAll(string lang)
    {
        var dir = Path.Combine(contentRoot, "works");
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
                var tags = (meta.GetValueOrDefault("tags") ?? "")
                    .Split(',')
                    .Select(t => t.Trim())
                    .Where(t => !string.IsNullOrEmpty(t))
                    .ToList();

                return new WorkItemDto(
                    Id: int.TryParse(meta.GetValueOrDefault("id"), out var id) ? id : 0,
                    Title: meta.GetValueOrDefault($"title_{lang}") ?? meta.GetValueOrDefault("title_ko") ?? "",
                    Description: meta.GetValueOrDefault($"description_{lang}") ?? meta.GetValueOrDefault("description_ko") ?? "",
                    Category: meta.GetValueOrDefault("category") ?? "",
                    ThumbnailUrl: meta.GetValueOrDefault("thumbnailUrl"),
                    ProjectUrl: meta.GetValueOrDefault("projectUrl"),
                    Year: int.TryParse(meta.GetValueOrDefault("year"), out var year) ? year : 0,
                    Tags: tags,
                    Content: body
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
}
