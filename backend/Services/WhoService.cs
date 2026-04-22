using davemins.DTOs;
using davemins.Models;

namespace davemins.Services;

public class WhoService
{
    private readonly WhoProfile _profile = new(
        Name: new("davemins", "davemins", "davemins"),
        Role: new("크리에이터", "Creator", "Creador"),
        Bio: new(
            "영상, 디자인, 코드로 이야기를 만드는 크리에이터입니다. IT 회사 PM 경험을 바탕으로 콘텐츠와 제품을 함께 만들어갑니다.",
            "A creator who tells stories through video, design, and code. Building content and products with experience as an IT PM.",
            "Un creador que cuenta historias a través de video, diseño y código. Construyendo contenido y productos con experiencia como PM de TI."
        ),
        Skills: [
            new("영상 촬영 · 편집", "Videography · Editing", "Videografía · Edición"),
            new("모션 그래픽", "Motion Graphics", "Gráficos en movimiento"),
            new("UI/UX 디자인", "UI/UX Design", "Diseño UI/UX"),
            new("프론트엔드 개발", "Frontend Development", "Desarrollo Frontend"),
        ],
        SocialLinks: [
            new("GitHub", "https://github.com/davemins"),
            new("Instagram", "https://instagram.com/davemins"),
        ]
    );

    public WhoDto GetProfile(string lang)
    {
        return new WhoDto(
            Name: _profile.Name.Get(lang),
            Role: _profile.Role.Get(lang),
            Bio: _profile.Bio.Get(lang),
            Skills: _profile.Skills.Select(s => s.Get(lang)).ToList(),
            SocialLinks: _profile.SocialLinks.Select(s => new SocialLinkDto(s.Platform, s.Url)).ToList()
        );
    }
}
