using davemins.DTOs;
using davemins.Models;

namespace davemins.Services;

public class HowService
{
    private readonly List<Post> _posts = [
        new(
            Id: 1,
            Slug: "motion-graphic-basics",
            Title: new("모션 그래픽 시작하기", "Getting Started with Motion Graphics", "Empezando con Motion Graphics"),
            Summary: new(
                "After Effects 없이도 모션 그래픽을 만들 수 있는 방법을 소개합니다.",
                "Here's how you can create motion graphics without After Effects.",
                "Así es como puedes crear motion graphics sin After Effects."
            ),
            Content: new(
                Ko: "## 시작하기 전에\n\n모션 그래픽은 시간과 공간을 다루는 작업입니다.\n\n도구보다 중요한 건 움직임에 대한 감각입니다.",
                En: "## Before You Start\n\nMotion graphics is about working with time and space.\n\nWhat matters more than tools is a sense of movement.",
                Es: "## Antes de Empezar\n\nLos motion graphics tratan sobre trabajar con tiempo y espacio.\n\nLo que importa más que las herramientas es el sentido del movimiento."
            ),
            PublishedAt: new DateOnly(2025, 3, 10)
        ),
        new(
            Id: 2,
            Slug: "design-system-for-solo",
            Title: new("혼자 만드는 디자인 시스템", "Design System for Solo Creators", "Sistema de Diseño para Creadores"),
            Summary: new(
                "팀이 없어도 일관된 디자인을 유지하는 나만의 시스템을 만드는 방법.",
                "How to build your own system for maintaining consistent design without a team.",
                "Cómo construir tu propio sistema para mantener un diseño consistente sin un equipo."
            ),
            Content: new(
                Ko: "## 왜 디자인 시스템이 필요한가\n\n혼자 작업할 때도 일관성은 중요합니다.\n\n토큰과 컴포넌트로 작은 시스템을 만들어 보세요.",
                En: "## Why You Need a Design System\n\nConsistency matters even when working solo.\n\nTry building a small system with tokens and components.",
                Es: "## Por Qué Necesitas un Sistema de Diseño\n\nLa consistencia importa incluso trabajando solo.\n\nIntenta construir un pequeño sistema con tokens y componentes."
            ),
            PublishedAt: new DateOnly(2025, 5, 22)
        ),
    ];

    public List<PostListItemDto> GetAll(string lang)
    {
        return _posts
            .OrderByDescending(p => p.PublishedAt)
            .Select(p => new PostListItemDto(
                Id: p.Id,
                Slug: p.Slug,
                Title: p.Title.Get(lang),
                Summary: p.Summary.Get(lang),
                PublishedAt: p.PublishedAt.ToString("yyyy-MM-dd")
            ))
            .ToList();
    }

    public PostDetailDto? GetBySlug(string slug, string lang)
    {
        var post = _posts.FirstOrDefault(p => p.Slug == slug);
        if (post is null) return null;

        return new PostDetailDto(
            Id: post.Id,
            Slug: post.Slug,
            Title: post.Title.Get(lang),
            Summary: post.Summary.Get(lang),
            Content: post.Content.Get(lang),
            PublishedAt: post.PublishedAt.ToString("yyyy-MM-dd")
        );
    }
}
