using davemins.DTOs;
using davemins.Models;

namespace davemins.Services;

public class WhatService
{
    private readonly List<WorkItem> _items = [
        new(
            Id: 1,
            Title: new("일상의 빛", "Light of Everyday", "Luz del Cotidiano"),
            Description: new("도시의 빛과 그림자를 담은 사진 시리즈", "A photo series capturing light and shadow in the city", "Una serie fotográfica que captura luz y sombra en la ciudad"),
            Category: "visual",
            ThumbnailUrl: null,
            ProjectUrl: "https://www.behance.net/davemins",
            Year: 2024
        ),
        new(
            Id: 2,
            Title: new("프레임 사이", "Between Frames", "Entre Fotogramas"),
            Description: new("정지와 움직임 사이의 순간을 담은 그래픽 작업", "Graphic work capturing moments between stillness and movement", "Trabajo gráfico que captura momentos entre quietud y movimiento"),
            Category: "visual",
            ThumbnailUrl: null,
            ProjectUrl: "https://www.behance.net/davemins",
            Year: 2024
        ),
        new(
            Id: 3,
            Title: new("흐름", "Flow", "Flujo"),
            Description: new("유체 시뮬레이션 기반의 모션 그래픽", "Motion graphics based on fluid simulation", "Gráficos en movimiento basados en simulación de fluidos"),
            Category: "motion",
            ThumbnailUrl: null,
            ProjectUrl: "https://vimeo.com/davemins",
            Year: 2025
        ),
        new(
            Id: 4,
            Title: new("루프", "Loop", "Bucle"),
            Description: new("반복과 변주로 만든 애니메이션 루프", "Animation loop made with repetition and variation", "Bucle de animación creado con repetición y variación"),
            Category: "motion",
            ThumbnailUrl: null,
            ProjectUrl: "https://vimeo.com/davemins",
            Year: 2025
        ),
    ];

    public List<WorkItemDto> GetAll(string lang, string? category = null)
    {
        var items = string.IsNullOrEmpty(category)
            ? _items
            : _items.Where(i => i.Category == category).ToList();

        return items.Select(i => ToDto(i, lang)).ToList();
    }

    public WorkItemDto? GetById(int id, string lang)
    {
        var item = _items.FirstOrDefault(i => i.Id == id);
        return item is null ? null : ToDto(item, lang);
    }

    private static WorkItemDto ToDto(WorkItem item, string lang) => new(
        Id: item.Id,
        Title: item.Title.Get(lang),
        Description: item.Description.Get(lang),
        Category: item.Category,
        ThumbnailUrl: item.ThumbnailUrl,
        ProjectUrl: item.ProjectUrl,
        Year: item.Year
    );
}
