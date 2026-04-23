# Phase 5 — 다국어 지원 (i18n) + 파일 기반 콘텐츠 관리

## 개요

Phase 5는 크게 두 축으로 진행됐다.

1. **URL 기반 다국어 라우팅** — `/ko`, `/en`, `/es` 경로로 언어를 구분하고 전 페이지에 번역 적용
2. **파일 기반 콘텐츠 관리** — 하드코딩된 예시 데이터를 `backend/content/` 폴더의 파일로 분리

포함된 커밋:
- `fc55fb1` — `feat(i18n): 다국어 라우팅 및 언어 전환 구현 (ko/en/es)`
- `b0a0329` — `style(nav): 언어 전환 버튼 수직 정렬 수정`
- `d26d8ac` — `feat(api): 파일 기반 콘텐츠 관리 구조로 전환 (content/)`
- `27a7ad0` — `feat(what): 상세 페이지 콘텐츠 파일 기반으로 전환 (tags, content)`
- `ae4479b` — `feat(what): works 언어별 파일 분리 및 이미지 보드 추가`
- `f700544` — `style(what): tag 상하 정렬 수정 및 예시 이미지 추가`
- `e1333aa` — `style(what): skill/tag 텍스트 시각적 상하 중앙 정렬 보정`
- `cb737a7` — `feat(what): 전체 works 이미지 추가 및 how 포스트 내용 보강`

---

## 1. 다국어 라우팅 설계 — URL 기반

### 왜 URL 기반인가

i18n 구현 방식은 크게 세 가지가 있다.

| 방식 | 예시 | 특징 |
|------|------|------|
| URL 기반 | `/ko/what`, `/en/what` | SEO 최적화, 공유 가능, 새로고침 유지 |
| 쿠키/localStorage | `?lang=ko` 또는 저장값 | 구현 간단하지만 SEO 불리 |
| 서브도메인 | `ko.davemins.com` | 규모 큰 서비스에 적합, 설정 복잡 |

davemins는 포트폴리오 사이트이므로 **SEO**와 **링크 공유**가 중요하다. URL에 언어가 포함되면 특정 언어 페이지를 직접 공유할 수 있고, 검색엔진도 각 언어 페이지를 별개로 인덱싱할 수 있다. → URL 기반 선택.

### 라우트 구조

**`frontend/src/App.tsx`**
```tsx
<Routes>
  <Route path="/" element={<Navigate to="/ko" replace />} />
  <Route path="/:lang" element={<LangProvider />}>
    <Route index element={<HomePage />} />
    <Route path="who" element={<WhoPage />} />
    <Route path="what" element={<WhatPage />} />
    <Route path="what/:id" element={<WhatDetailPage />} />
    <Route path="how" element={<HowPage />} />
    <Route path="how/:slug" element={<HowDetailPage />} />
  </Route>
</Routes>
```

- `/` → `/ko` 자동 리다이렉트 (기본 언어: 한국어)
- `/:lang` 경로 아래 모든 페이지 중첩
- `LangProvider`가 `<Outlet />`을 감싸는 래퍼 역할

---

## 2. LangContext — 언어 상태 전역 관리

라이브러리(`react-i18next` 등) 없이 직접 구현. 번역 볼륨이 적고 외부 의존성을 줄이기 위해 선택.

**`frontend/src/contexts/LangContext.tsx`**
```tsx
export function LangProvider() {
  const { lang } = useParams<{ lang: string }>()
  const navigate = useNavigate()
  const location = useLocation()

  // 유효하지 않은 언어 코드 → /ko로 리다이렉트
  useEffect(() => {
    if (!isValidLang(lang)) {
      navigate('/ko' + location.pathname.slice(3), { replace: true })
    }
  }, [lang])

  if (!isValidLang(lang)) return null

  const t = translations[lang as Lang]

  return (
    <LangContext.Provider value={{ lang: lang as Lang, t }}>
      <Outlet />
    </LangContext.Provider>
  )
}

export function useLang() {
  return useContext(LangContext)
}
```

**핵심 설계 결정:**
- `LangProvider`가 직접 `<Outlet />`을 렌더링 → React Router의 중첩 라우트 패턴 활용
- `isValidLang()` 체크로 `/fr`, `/jp` 같은 미지원 언어 접근 시 자동 fallback
- 모든 하위 페이지는 `useLang()`으로 `{ lang, t }` 접근

---

## 3. 번역 파일 구조

**`frontend/src/i18n/index.ts`**
```typescript
export type Lang = 'ko' | 'en' | 'es'
export const LANGS: Lang[] = ['ko', 'en', 'es']
export const translations = { ko, en, es }

export function isValidLang(lang: unknown): lang is Lang {
  return typeof lang === 'string' && LANGS.includes(lang as Lang)
}
```

**`frontend/src/i18n/ko.ts`** (구조 예시)
```typescript
export const ko = {
  home: {
    tagline: '영상, 디자인, 코드로\n이야기를 만듭니다.',
    whoDesc: '어떤 사람인지',
    whatDesc: '어떤 걸 만들었는지',
    howDesc: '어떻게 생각하는지',
  },
  what: {
    back: '← what',
    notFound: '작업물을 찾을 수 없습니다.',
    projectLink: '프로젝트 보기 ↗',
    processTitle: '작업 과정',
  },
  how: {
    back: '← how',
    backToList: '← 목록으로',
    notFound: '글을 찾을 수 없습니다.',
  },
}
```

- **ko**: 한국어 (기본)
- **en**: 영어
- **es**: 스페인어

번역 키 구조는 페이지 단위(`home`, `what`, `how`)로 구분. `who` 페이지는 UI 고정 문자열이 없어 생략.

---

## 4. Navbar — 언어 전환 버튼

Navbar는 `LangProvider` **바깥**에 위치해 `useLang()`을 쓸 수 없다. 대신 `useLocation()`으로 현재 경로에서 언어를 직접 파싱한다.

**`frontend/src/components/Navbar.tsx`**
```tsx
function Navbar() {
  const location = useLocation()
  const pathParts = location.pathname.split('/')
  const currentLang = isValidLang(pathParts[1]) ? pathParts[1] : 'ko'

  // 현재 페이지를 유지하면서 언어만 교체
  function switchLangPath(lang: Lang) {
    const parts = location.pathname.split('/')
    parts[1] = lang
    return parts.join('/')
  }

  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <NavLink to={`/${currentLang}`} className={styles.logo}>davemins</NavLink>
        <nav className={styles.nav}>
          <NavLink to={`/${currentLang}/who`}>who</NavLink>
          <NavLink to={`/${currentLang}/what`}>what</NavLink>
          <NavLink to={`/${currentLang}/how`}>how</NavLink>
          <div className={styles.langs}>
            {LANGS.map(lang => (
              <NavLink
                key={lang}
                to={switchLangPath(lang)}
                className={currentLang === lang ? styles.langActive : styles.langBtn}
              >
                {lang}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </header>
  )
}
```

**`switchLangPath` 동작 예시:**
- `/ko/what/3` → 언어를 `en`으로 전환 → `/en/what/3`
- `/es/how/motion-basics` → `ko`로 전환 → `/ko/how/motion-basics`

현재 보던 페이지를 유지한 채로 언어만 바뀐다.

### 언어 버튼 스타일

**`frontend/src/components/Navbar.module.css`**
```css
.langs {
  display: flex;
  align-items: center;      /* 수직 정렬 */
  gap: var(--space-3);
  padding-left: var(--space-4);
  border-left: 1px solid var(--border);
  margin-left: var(--space-2);
}

.langBtn {
  font-size: var(--text-xs);
  color: var(--fg-subtle);
  transition: color 0.15s;
}

.langActive {
  font-size: var(--text-xs);
  color: var(--fg);
}
```

- `border-left`로 nav 링크들과 시각적으로 구분
- 현재 언어는 `--fg`(밝은 색), 나머지는 `--fg-subtle`(흐린 색)

### 수정 사항 — 수직 정렬 버그 (b0a0329)

초기 구현에서 `ko · en · es` 버튼들의 상하 여백이 다르게 보이는 문제 발생. `.langs`에 `align-items: center`가 누락되어 있었음. 1줄 추가로 해결.

---

## 5. 파일 기반 콘텐츠 관리 구조

### 기존 문제

Phase 4까지 모든 콘텐츠(works, posts, who)가 서비스 코드에 하드코딩되어 있었다.

```csharp
// 기존 WhatService.cs — 하드코딩
private static readonly List<WorkItemDto> _works = new()
{
    new(Id: 1, Title: "일상의 빛", Description: "...", ...),
    new(Id: 2, Title: "프레임 사이", Description: "...", ...),
};
```

콘텐츠를 수정하려면 코드를 직접 수정하고 다시 빌드해야 했다.

### 해결 — content/ 폴더

```
backend/content/
  who/
    ko.json
    en.json
    es.json
  works/
    ko/
      001-light-of-everyday.md
      002-between-frames.md
      003-flow.md
      004-loop.md
    en/
      (동일 구조)
    es/
      (동일 구조)
  posts/
    ko/
      design-system-for-solo.md
      motion-graphic-basics.md
    en/
      (동일 구조)
    es/
      (동일 구조)
```

- **who**: JSON (구조적 데이터 — 이름, 직책, skills, links)
- **works**: Markdown + frontmatter (메타데이터 + 작업 과정 본문)
- **posts**: Markdown + frontmatter (글 목록 + 본문)

콘텐츠 파일만 수정하면 백엔드 재시작으로 반영 가능. (현재 in-memory, hot reload 미지원)

---

## 6. FrontmatterParser — 마크다운 파싱

외부 라이브러리 없이 직접 구현.

**`backend/Utils/FrontmatterParser.cs`**
```csharp
public static class FrontmatterParser
{
    public static (Dictionary<string, string> Meta, string Body) Parse(string content)
    {
        var meta = new Dictionary<string, string>();
        var lines = content.Split('\n');

        if (lines[0].Trim() != "---")
            return (meta, content);

        var endIndex = -1;
        for (int i = 1; i < lines.Length; i++)
        {
            if (lines[i].Trim() == "---")
            {
                endIndex = i;
                break;
            }
            var colonIndex = lines[i].IndexOf(':');
            if (colonIndex > 0)
            {
                var key = lines[i][..colonIndex].Trim();
                var value = lines[i][(colonIndex + 1)..].Trim();
                meta[key] = value;
            }
        }

        var body = endIndex >= 0
            ? string.Join('\n', lines[(endIndex + 1)..]).Trim()
            : content;

        return (meta, body);
    }
}
```

**파싱 규칙:**
- `---`으로 시작하는 블록을 frontmatter로 인식
- `key: value` 형식으로 딕셔너리에 저장
- frontmatter 이후 나머지가 `Body` (마크다운 본문)

---

## 7. WhoService — JSON 기반

**`backend/content/who/ko.json`** 구조
```json
{
  "name": "davemins",
  "role": "Visual Artist & Developer",
  "bio": "영상, 그래픽, 코드를 넘나들며 작업합니다...",
  "skills": ["영상 편집", "모션 그래픽", "UI/UX 디자인", "프론트엔드 개발"],
  "links": [
    { "label": "GitHub", "url": "https://github.com/davemins" },
    { "label": "Behance", "url": "https://www.behance.net/davemins" }
  ]
}
```

**`backend/Services/WhoService.cs`**
```csharp
public class WhoService(string contentRoot)
{
    public WhoDto? GetWho(string lang)
    {
        // lang 파일 없으면 ko로 fallback
        var path = Path.Combine(contentRoot, "who", $"{lang}.json");
        if (!File.Exists(path))
            path = Path.Combine(contentRoot, "who", "ko.json");

        var json = File.ReadAllText(path);
        return JsonSerializer.Deserialize<WhoDto>(json, _options);
    }
}
```

언어별 파일이 없으면 `ko.json`으로 자동 fallback. 번역이 준비되지 않은 언어도 빈 화면 없이 동작.

---

## 8. WhatService — Markdown 기반

**works 파일 구조 (예: `001-light-of-everyday.md`)**
```markdown
---
id: 1
title: 일상의 빛
description: 도시의 빛과 그림자를 담은 사진 시리즈
category: visual
year: 2024
projectUrl: https://www.behance.net/davemins
tags: Lightroom, Capture One, Sony A7C
thumbnailUrl: https://images.unsplash.com/...
coverImage: https://images.unsplash.com/...
images: https://...1, https://...2, https://...3
---

본문 내용 (작업 과정 설명)
```

**`backend/Services/WhatService.cs`** 핵심 로직
```csharp
public List<WorkItemDto> GetWorks(string lang, string? category = null)
{
    var dir = Path.Combine(_contentRoot, "works", lang);

    // lang 폴더 없으면 ko로 fallback
    if (!Directory.Exists(dir))
        dir = Path.Combine(_contentRoot, "works", "ko");

    return Directory.GetFiles(dir, "*.md")
        .Select(ParseWork)
        .Where(w => category == null || w.Category == category)
        .OrderBy(w => w.Id)
        .ToList();
}

private WorkItemDto ParseWork(string filePath)
{
    var content = File.ReadAllText(filePath);
    var (meta, body) = FrontmatterParser.Parse(content);

    return new WorkItemDto(
        Id:           int.Parse(meta.GetValueOrDefault("id", "0")),
        Title:        meta.GetValueOrDefault("title", ""),
        Description:  meta.GetValueOrDefault("description", ""),
        Category:     meta.GetValueOrDefault("category", "visual"),
        ThumbnailUrl: NullIfEmpty(meta.GetValueOrDefault("thumbnailUrl")),
        ProjectUrl:   NullIfEmpty(meta.GetValueOrDefault("projectUrl")),
        Year:         int.Parse(meta.GetValueOrDefault("year", "0")),
        Tags:         ParseList(meta.GetValueOrDefault("tags")),
        Content:      body,
        CoverImage:   NullIfEmpty(meta.GetValueOrDefault("coverImage")),
        Images:       ParseList(meta.GetValueOrDefault("images"))
    );
}

// 쉼표로 구분된 문자열 → List<string>
private static List<string> ParseList(string? value)
    => string.IsNullOrWhiteSpace(value)
        ? []
        : value.Split(',').Select(s => s.Trim()).Where(s => s.Length > 0).ToList();

// 빈 문자열 → null
private static string? NullIfEmpty(string? value)
    => string.IsNullOrWhiteSpace(value) ? null : value;
```

---

## 9. works 상세 페이지 콘텐츠 파일 기반 전환

Phase 4까지 WhatDetailPage의 tags, content, images는 하드코딩 또는 임시값이었다.

**기존 (하드코딩)**
```tsx
const PLACEHOLDER_TAGS = ['Figma', 'Illustrator', 'After Effects']
const PLACEHOLDER_IMAGES = ['https://...', ...]

<div className={styles.tags}>
  {PLACEHOLDER_TAGS.map(tag => <span key={tag}>{tag}</span>)}
</div>
```

**변경 후 (파일에서 읽어옴)**
```tsx
{data.tags.length > 0 && (
  <div className={styles.tags}>
    {data.tags.map(tag => <span key={tag} className={styles.tag}>{tag}</span>)}
  </div>
)}

{data.content && (
  <div className={styles.section}>
    <h2 className={styles.sectionTitle}>{t.what.processTitle}</h2>
    <p className={styles.body}>{data.content}</p>
  </div>
)}

{data.images.length > 0 && (
  <div className={styles.board}>
    {data.images.map((src, i) => (
      <img key={i} src={src} alt={`${data.title} ${i + 1}`} className={styles.boardImg} />
    ))}
  </div>
)}
```

조건부 렌더링으로 값이 없으면 섹션 자체가 안 보임.

### 이미지 보드 레이아웃

2열 그리드로 이미지를 배치. 홀수 개일 때 첫 번째 이미지가 전체 너비를 차지.

**`WhatDetailPage.module.css`**
```css
.board {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--space-3);
}

.boardImg {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid var(--border);
  display: block;
}

/* 홀수 개일 때 첫 번째 이미지 전체 너비 */
.boardImg:first-child:nth-last-child(odd) {
  grid-column: 1 / -1;
  aspect-ratio: 16 / 9;
}
```

`:first-child:nth-last-child(odd)` — 형제 요소가 홀수 개일 때만 첫 번째 이미지에 적용.

---

## 10. works 언어별 파일 분리

초기에는 `content/works/*.md` 단일 폴더로 시작했다가, posts와 동일하게 언어별 폴더로 분리.

```
# 변경 전
backend/content/works/
  001-light-of-everyday.md  (단일 파일)

# 변경 후
backend/content/works/
  ko/001-light-of-everyday.md
  en/001-light-of-everyday.md
  es/001-light-of-everyday.md
```

**변경 이유:**
- 작업물 제목, 설명, 본문이 언어마다 다른 내용이어야 함
- posts가 이미 같은 구조를 쓰고 있어 일관성 확보

---

## 11. WhatPage 카드 — 썸네일 이미지 조건부 렌더링

기존 카드는 썸네일 자리에 회색 placeholder div만 있었다.

**`frontend/src/pages/WhatPage.tsx`**
```tsx
{item.thumbnailUrl
  ? <img src={item.thumbnailUrl} alt={item.title} className={styles.thumbImg} />
  : <div className={styles.thumb} />
}
```

**`frontend/src/pages/WhatPage.module.css`**
```css
.thumbImg {
  width: 100%;
  aspect-ratio: 4 / 3;
  object-fit: cover;
  border: 1px solid var(--border);
  border-radius: 8px;
  display: block;
}
```

`thumbnailUrl`이 있으면 이미지, 없으면 기존 빈 박스. 콘텐츠 없는 상태에서도 레이아웃 무너지지 않음.

---

## 12. API — 다국어 파라미터

모든 API 엔드포인트에 `?lang=ko|en|es` 쿼리 파라미터 추가.

```
GET /api/who?lang=en
GET /api/what?lang=es
GET /api/what?lang=ko&category=visual
GET /api/what/1?lang=en
GET /api/how?lang=ko
GET /api/how/design-system-for-solo?lang=es
```

파라미터 미전달 시 기본값 `ko`.

**컨트롤러 예시**
```csharp
[HttpGet]
public IActionResult GetWorks([FromQuery] string lang = "ko", [FromQuery] string? category = null)
{
    var works = _whatService.GetWorks(lang, category);
    return Ok(works);
}
```

---

## 13. tag 상하 정렬 수정

### 문제 1 — inline-flex 미적용

`WhoPage` skill 태그와 `WhatDetailPage` 태그의 텍스트가 상하 가운데 정렬이 안 됨.

**수정 (WhoPage `.skill`, WhatDetailPage `.tag`)**
```css
display: inline-flex;
align-items: center;
line-height: 1;
```

### 문제 2 — 폰트 descender로 인한 시각적 쏠림

`inline-flex + align-items: center`를 적용했음에도 텍스트가 미세하게 아래로 내려가 보이는 현상.

**원인:** 폰트의 descender(하강 자형) 공간이 em-square 아래쪽에 치우쳐 있어, 수학적 중앙과 시각적 중앙이 어긋남.

**잘못된 시도:** `padding-top +1px, padding-bottom -1px` → 오히려 더 내려감.

**올바른 수정:**
```css
/* top을 줄이고 bottom을 늘려 텍스트를 시각적으로 위로 올림 */
padding: calc(var(--space-2) - 1px) var(--space-3) calc(var(--space-2) + 1px);
```

`padding-bottom`을 1px 더 줌으로써 텍스트가 시각적으로 위쪽에 자리 잡음.

> **기억할 것:** pill/tag 형태 요소에서 텍스트가 아래로 쏠려 보이면 `padding-top -1px, padding-bottom +1px`.
> `padding-top`을 늘리면 오히려 더 내려간다.

---

## 14. how 포스트 콘텐츠 보강

기존 포스트가 2~3줄의 플레이스홀더 수준이었음. 실제 읽을 수 있는 내용으로 보강.

| 파일 | 내용 |
|------|------|
| `design-system-for-solo.md` | 왜 혼자도 디자인 시스템이 필요한지 → 토큰 → 컴포넌트 → 문서화 흐름 |
| `motion-graphic-basics.md` | 이징(ease-in/out/in-out) 설명, 작게 시작하기, blockquote 포함 |

ko/en/es 3개 언어 각각 작성.

---

## 15. Program.cs — 서비스 등록 방식 변경

파일 기반 서비스는 `contentRoot` 경로를 생성자 파라미터로 받아야 함.

**`backend/Program.cs`**
```csharp
var contentRoot = Path.Combine(builder.Environment.ContentRootPath, "content");

builder.Services.AddSingleton(new WhoService(contentRoot));
builder.Services.AddSingleton(new WhatService(contentRoot));
builder.Services.AddSingleton(new HowService(contentRoot));
```

`AddSingleton<T>()` 대신 인스턴스를 직접 넘기는 `AddSingleton(instance)` 방식 사용.  
의존성 주입 컨테이너가 생성자를 호출할 수 없으므로 (contentRoot가 DI로 등록된 값이 아니기 때문).

---

## 16. 발생했던 문제들

### 백엔드 포트 점유 문제

서비스 코드를 수정할 때마다 실행 중인 프로세스를 직접 종료해야 했다.  
`dotnet run`은 파일 변경 감지(hot reload)가 제한적이고, 서비스 클래스는 재로딩 안 됨.

```bash
# PID 확인
netstat -ano | grep ":5000" | grep LISTENING

# 강제 종료
taskkill /F /PID {pid}

# 재시작
dotnet run
```

### WhatService 첫 로딩 시 빈 목록

파일 경로 오류로 works가 안 나오는 현상. `content/works/` 폴더를 ko/en/es로 분리한 직후 기존 경로(`content/works/*.md`)를 바라보던 코드가 남아 있었음.  
서비스 코드 수정 후 백엔드 재시작으로 해결.

---

## 빌드 확인

```bash
cd frontend
npm run build
# ✓ built in ~3s, no type errors

cd backend
dotnet build
# Build succeeded. 0 Error(s)
```

---

## 최종 파일 구조

```
backend/
  content/
    who/
      ko.json / en.json / es.json
    works/
      ko/ en/ es/
        001-light-of-everyday.md
        002-between-frames.md
        003-flow.md
        004-loop.md
    posts/
      ko/ en/ es/
        design-system-for-solo.md
        motion-graphic-basics.md
  Services/
    WhoService.cs   ← JSON 파일 읽기
    WhatService.cs  ← Markdown + frontmatter 파싱
    HowService.cs   ← Markdown + frontmatter 파싱
  Utils/
    FrontmatterParser.cs

frontend/
  src/
    i18n/
      ko.ts / en.ts / es.ts / index.ts
    contexts/
      LangContext.tsx
    components/
      Navbar.tsx  ← 언어 전환 버튼 포함
```
