# Phase 2 — 백엔드 API 구현

## 개요

ASP.NET Core 8 기반의 REST API를 구현한다.  
데이터는 in-memory로 관리하며 (DB 미사용), 이후 EF Core + PostgreSQL로 전환 예정.  
모든 엔드포인트는 `?lang=ko|en|es` 쿼리 파라미터로 다국어를 지원한다.

---

## API 명세

| 메서드 | 경로 | 설명 |
|--------|------|------|
| GET | `/api/who` | 소개, 이력, 소셜 링크 |
| GET | `/api/what` | 전체 작업물 목록 |
| GET | `/api/what?category=visual` | 카테고리 필터 (visual / motion / ...) |
| GET | `/api/what/{id}` | 작업물 상세 |
| GET | `/api/how` | 글 목록 (최신순) |
| GET | `/api/how/{slug}` | 글 상세 |
| POST | `/api/contact` | 연락 메시지 수신 |

**다국어 파라미터:** 모든 GET 엔드포인트에 `?lang=ko|en|es` 적용 가능. 기본값 `ko`.

---

## 아키텍처

```
HTTP 요청
  └── Controller  (요청/응답 처리)
        └── Service    (비즈니스 로직 + in-memory 데이터)
              └── Model / DTO
```

- **Controller**: 라우팅과 HTTP 응답만 담당. 로직 없음.
- **Service**: 데이터 보관 및 lang 파라미터 적용.
- **Model**: 내부 데이터 구조 (LocalizedString 포함).
- **DTO**: API 응답으로 내보내는 형태 (언어 적용 완료된 string만 포함).

---

## 파일 구조

```
backend/
  Controllers/
    WhoController.cs
    WhatController.cs
    HowController.cs
    ContactController.cs
  DTOs/
    WhoDto.cs
    WorkItemDto.cs
    PostDto.cs
    ContactDto.cs
  Models/
    LocalizedString.cs
    WhoProfile.cs
    WorkItem.cs
    Post.cs
  Services/
    WhoService.cs
    WhatService.cs
    HowService.cs
    ContactService.cs
  Program.cs              ← 서비스 등록 추가
```

---

## Step 1. 다국어 모델 (LocalizedString)

`backend/Models/LocalizedString.cs`

```csharp
namespace davemins.Models;

public record LocalizedString(string Ko, string En, string Es)
{
    public string Get(string lang) => lang switch
    {
        "en" => En,
        "es" => Es,
        _ => Ko
    };
}
```

- `ko`, `en`, `es` 세 언어 값을 하나의 타입으로 묶는다.
- `Get(lang)` 호출 시 해당 언어 값 반환. 알 수 없는 lang은 `ko` 반환.

---

## Step 2. 데이터 모델 (Models)

### WhoProfile.cs

```csharp
namespace davemins.Models;

public record SocialLink(string Platform, string Url);

public record WhoProfile(
    LocalizedString Name,
    LocalizedString Role,
    LocalizedString Bio,
    List<LocalizedString> Skills,
    List<SocialLink> SocialLinks
);
```

### WorkItem.cs

```csharp
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
```

- `Category`: `"visual"` | `"motion"` | (추후 확장 예정: `"web"`, `"audio"`, `"game"`)

### Post.cs

```csharp
namespace davemins.Models;

public record Post(
    int Id,
    string Slug,
    LocalizedString Title,
    LocalizedString Summary,
    LocalizedString Content,
    DateOnly PublishedAt
);
```

- `Slug`: URL에서 사용하는 고유 식별자. 예: `"motion-graphic-basics"`
- `Content`: 마크다운 문자열. 언어별로 분리 보관.

---

## Step 3. DTO

API 응답에서는 `LocalizedString` 대신 이미 언어가 적용된 `string`만 내보낸다.

### WhoDto.cs

```csharp
namespace davemins.DTOs;

public record SocialLinkDto(string Platform, string Url);

public record WhoDto(
    string Name,
    string Role,
    string Bio,
    List<string> Skills,
    List<SocialLinkDto> SocialLinks
);
```

### WorkItemDto.cs

```csharp
namespace davemins.DTOs;

public record WorkItemDto(
    int Id,
    string Title,
    string Description,
    string Category,
    string? ThumbnailUrl,
    string? ProjectUrl,
    int Year
);
```

### PostDto.cs

글 목록(List)과 글 상세(Detail)를 분리한다. 목록에는 Content를 포함하지 않는다.

```csharp
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
```

### ContactDto.cs

```csharp
namespace davemins.DTOs;

public record ContactRequest(string Name, string Email, string Message);

public record ContactResponse(bool Success, string Message);
```

---

## Step 4. 서비스 (Services)

### WhoService.cs

in-memory로 프로필 데이터를 보관하고 `lang`을 적용해 DTO를 반환한다.

```csharp
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
```

### WhatService.cs

카테고리 필터와 단건 조회를 지원한다.

```csharp
using davemins.DTOs;
using davemins.Models;

namespace davemins.Services;

public class WhatService
{
    private readonly List<WorkItem> _items = [ /* 샘플 데이터 */ ];

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
```

### HowService.cs

slug로 단건 조회, 목록은 최신순 정렬.

```csharp
using davemins.DTOs;
using davemins.Models;

namespace davemins.Services;

public class HowService
{
    private readonly List<Post> _posts = [ /* 샘플 데이터 */ ];

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
```

### ContactService.cs

실제 메일 발송 전까지 서버 로그로 수신을 확인한다.

```csharp
using davemins.DTOs;

namespace davemins.Services;

public class ContactService(ILogger<ContactService> logger)
{
    // 실제 메일 발송 전까지 로그로 수신 확인
    public ContactResponse Receive(ContactRequest request)
    {
        logger.LogInformation("연락 메시지 수신: {Name} <{Email}>", request.Name, request.Email);
        return new ContactResponse(true, "메시지가 전달되었습니다.");
    }
}
```

---

## Step 5. 컨트롤러 (Controllers)

Controller는 요청을 받아 Service를 호출하고 결과를 반환하는 것만 담당한다.

### WhoController.cs

```csharp
using davemins.Services;
using Microsoft.AspNetCore.Mvc;

namespace davemins.Controllers;

[ApiController]
[Route("api/who")]
public class WhoController(WhoService whoService) : ControllerBase
{
    [HttpGet]
    public IActionResult Get([FromQuery] string lang = "ko")
    {
        return Ok(whoService.GetProfile(lang));
    }
}
```

### WhatController.cs

```csharp
using davemins.Services;
using Microsoft.AspNetCore.Mvc;

namespace davemins.Controllers;

[ApiController]
[Route("api/what")]
public class WhatController(WhatService whatService) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll([FromQuery] string? category, [FromQuery] string lang = "ko")
    {
        return Ok(whatService.GetAll(lang, category));
    }

    [HttpGet("{id:int}")]
    public IActionResult GetById(int id, [FromQuery] string lang = "ko")
    {
        var item = whatService.GetById(id, lang);
        return item is null ? NotFound() : Ok(item);
    }
}
```

### HowController.cs

```csharp
using davemins.Services;
using Microsoft.AspNetCore.Mvc;

namespace davemins.Controllers;

[ApiController]
[Route("api/how")]
public class HowController(HowService howService) : ControllerBase
{
    [HttpGet]
    public IActionResult GetAll([FromQuery] string lang = "ko")
    {
        return Ok(howService.GetAll(lang));
    }

    [HttpGet("{slug}")]
    public IActionResult GetBySlug(string slug, [FromQuery] string lang = "ko")
    {
        var post = howService.GetBySlug(slug, lang);
        return post is null ? NotFound() : Ok(post);
    }
}
```

### ContactController.cs

```csharp
using davemins.DTOs;
using davemins.Services;
using Microsoft.AspNetCore.Mvc;

namespace davemins.Controllers;

[ApiController]
[Route("api/contact")]
public class ContactController(ContactService contactService) : ControllerBase
{
    [HttpPost]
    public IActionResult Post([FromBody] ContactRequest request)
    {
        var result = contactService.Receive(request);
        return Ok(result);
    }
}
```

---

## Step 6. Program.cs 서비스 등록

```csharp
using davemins.Services;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
builder.Services.AddSingleton<WhoService>();
builder.Services.AddSingleton<WhatService>();
builder.Services.AddSingleton<HowService>();
builder.Services.AddSingleton<ContactService>();
builder.Services.AddCors(options =>
{
    options.AddDefaultPolicy(policy =>
    {
        policy.WithOrigins("http://localhost:5173", "http://localhost:3000")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

var app = builder.Build();

app.UseCors();
app.UseAuthorization();
app.MapControllers();

app.Run();
```

- 서비스를 `AddSingleton`으로 등록하면 앱 생명주기 동안 단일 인스턴스를 유지한다.
- in-memory 데이터가 서비스 내부에 있으므로 Singleton이 적합하다.

---

## Step 7. 빌드 및 동작 확인

```bash
cd backend
dotnet build
dotnet run
```

서버가 `http://localhost:5000` 에서 실행되면 아래 요청으로 동작을 확인한다.

```bash
# 기본 (한국어)
curl http://localhost:5000/api/who
curl http://localhost:5000/api/what
curl http://localhost:5000/api/how

# 언어 파라미터
curl "http://localhost:5000/api/who?lang=en"
curl "http://localhost:5000/api/who?lang=es"

# 카테고리 필터
curl "http://localhost:5000/api/what?category=visual"
curl "http://localhost:5000/api/what?category=motion"

# 단건 조회
curl http://localhost:5000/api/what/1
curl http://localhost:5000/api/how/motion-graphic-basics

# 연락 메시지
curl -X POST http://localhost:5000/api/contact \
  -H "Content-Type: application/json" \
  -d '{"name":"테스트","email":"test@test.com","message":"안녕하세요"}'
```

---

## 응답 예시

### GET /api/who

```json
{
  "name": "davemins",
  "role": "크리에이터",
  "bio": "영상, 디자인, 코드로 이야기를 만드는 크리에이터입니다...",
  "skills": ["영상 촬영 · 편집", "모션 그래픽", "UI/UX 디자인", "프론트엔드 개발"],
  "socialLinks": [
    { "platform": "GitHub", "url": "https://github.com/davemins" },
    { "platform": "Instagram", "url": "https://instagram.com/davemins" }
  ]
}
```

### GET /api/what?category=motion

```json
[
  { "id": 3, "title": "흐름", "description": "유체 시뮬레이션 기반의 모션 그래픽", "category": "motion", "thumbnailUrl": null, "projectUrl": null, "year": 2025 },
  { "id": 4, "title": "루프", "description": "반복과 변주로 만든 애니메이션 루프", "category": "motion", "thumbnailUrl": null, "projectUrl": null, "year": 2025 }
]
```

### GET /api/how

```json
[
  { "id": 2, "slug": "design-system-for-solo", "title": "혼자 만드는 디자인 시스템", "summary": "...", "publishedAt": "2025-05-22" },
  { "id": 1, "slug": "motion-graphic-basics", "title": "모션 그래픽 시작하기", "summary": "...", "publishedAt": "2025-03-10" }
]
```

### POST /api/contact

```json
{ "success": true, "message": "메시지가 전달되었습니다." }
```
