# Phase 4 Refinements — 스타일 개선 및 /what 기능 추가

## 개요

Phase 4 페이지 구현 이후 실제 브라우저에서 직접 확인하면서 발견한 문제들을 수정하고,  
`/what` 페이지에 상세 페이지 이동 및 관련 기능을 추가한 작업 로그.

포함된 커밋:
- `65cfde2` — `style(nav,home,what,how): 폰트 교체, 레이아웃 간격 조정`
- `5a4c560` — `feat(what): 상세 페이지 및 프로젝트 링크 추가`
- `028d90f` — `style(nav): favicon 모서리 둥글게 수정`

---

## 1. 폰트 교체 — Noto Sans KR

### 문제

기본 시스템 폰트(`system-ui`)만 사용 중이어서 한글이 어색하게 렌더링됨.

### 해결

Google Fonts CDN으로 **Noto Sans KR** 적용.

**`frontend/index.html`**
```html
<link rel="preconnect" href="https://fonts.googleapis.com" />
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500&display=swap" rel="stylesheet" />
```

**`frontend/src/index.css`**
```css
--font-sans: 'Noto Sans KR', system-ui, -apple-system, sans-serif;
```

- `wght@300;400;500` — 라이트, 레귤러, 미디엄만 불러와 불필요한 로딩 최소화
- `display=swap` — 폰트 로딩 중 시스템 폰트로 먼저 보여주고 교체

---

## 2. Navbar 너비 제한

### 문제

전체화면(wide viewport)에서 Navbar 콘텐츠가 화면 끝까지 늘어나 좌우 간격이 너무 넓어짐.  
`padding`을 늘리는 방식으로는 해결 불가 — 뷰포트 너비에 따라 간격이 달라짐.

### 해결

Navbar 내부에 `.inner` 래퍼 div를 추가하고 `max-width` + `margin: 0 auto` 적용.

**`frontend/src/components/Navbar.tsx`**
```tsx
<header className={styles.header}>
  <div className={styles.inner}>
    <NavLink to="/" className={styles.logo}>davemins</NavLink>
    <nav className={styles.nav}>...</nav>
  </div>
</header>
```

**`frontend/src/components/Navbar.module.css`**
```css
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: var(--max-width);   /* 720px */
  margin: 0 auto;
  padding: 0 var(--space-6);
  height: 54px;
}
```

- `--max-width` (720px)로 본문과 동일한 너비로 정렬됨
- 높이는 초기 48px → 54px로 약간 늘림 (여백감 개선)

---

## 3. Navbar / 홈 폰트 사이즈 통일

### 문제

홈(`/`) 메뉴 링크(who / what / how)와 Navbar 링크의 폰트 크기가 달라 일관성이 없음.

### 해결

Navbar `.link`, `.logo` 와 홈 메뉴 링크 모두 `--text-base`로 통일.

**`frontend/src/components/Navbar.module.css`**
```css
.logo {
  font-size: var(--text-base);
}

.link {
  font-size: var(--text-base);
}
```

**`frontend/src/pages/HomePage.module.css`**
```css
.menuLabel {
  font-size: var(--text-base);
}
```

---

## 4. /what 그리드 2열로 변경

### 문제

기존 `auto-fill` 그리드가 wide 화면에서 3열로 표시되어 카드가 너무 작아짐.

### 해결

**`frontend/src/pages/WhatPage.module.css`**
```css
.grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: var(--space-6);
}
```

- 항상 2열 고정 → 카드 크기 일정하게 유지
- 좁아진 Navbar 너비(720px)에도 자연스럽게 맞음

---

## 5. 스크롤바로 인한 레이아웃 쉬프트 수정

### 문제

`/what` 페이지만 콘텐츠가 많아 스크롤바가 생기고,  
다른 탭(`/who`, `/how`)과 왔다갔다 할 때 레이아웃이 살짝 밀리는 현상 발생.

### 원인

스크롤바가 생길 때 `body` 너비가 줄어들면서 콘텐츠가 오른쪽으로 밀림.

### 해결

**`frontend/src/index.css`**
```css
html {
  scrollbar-gutter: stable;
}
```

- `scrollbar-gutter: stable` — 스크롤바 유무와 관계없이 스크롤바 영역을 항상 예약해둠
- 레이아웃 쉬프트 없이 자연스러운 탭 전환 가능

---

## 6. Favicon — GitHub 아바타 적용

### 배경

커스텀 SVG 로고 대신 GitHub 프로필 이미지(`https://avatars.githubusercontent.com/u/69416617`)를 파비콘으로 사용.  
davemins GitHub 계정과 동일한 이미지로 아이덴티티 일관성 유지.

### 적용 과정

1. GitHub 아바타 URL에서 이미지 다운로드
2. `frontend/public/favicon.png`로 저장
3. `frontend/index.html`에 연결

```html
<link rel="icon" type="image/png" href="/favicon.png" />
```

### 모서리 둥글게 처리

`sharp` 라이브러리로 SVG 마스크를 이용해 PNG에 둥근 모서리(rx=64) 적용.

```bash
cd frontend
npm install sharp --save-dev
node scripts/make-favicon.mjs
npm uninstall sharp  # 작업 후 제거
```

**`scripts/make-favicon.mjs`** (임시 스크립트, 실행 후 삭제)
```javascript
import sharp from 'sharp'

const SIZE = 256
const RADIUS = 64

const mask = Buffer.from(
  `<svg width="${SIZE}" height="${SIZE}">
    <rect x="0" y="0" width="${SIZE}" height="${SIZE}" rx="${RADIUS}" ry="${RADIUS}" fill="white"/>
  </svg>`
)

sharp('public/favicon.png')
  .resize(SIZE, SIZE)
  .composite([{ input: mask, blend: 'dest-in' }])
  .png()
  .toFile('public/favicon.png')
```

- SVG `<rect>`의 `rx`, `ry`로 모서리 반경 지정
- `blend: 'dest-in'` — 원본 이미지를 마스크 모양으로 잘라냄

---

## 7. /what 상세 페이지 (WhatDetailPage)

### 신규 파일

```
frontend/src/
  hooks/
    useWork.ts              ← 단일 작업물 조회 Hook
  pages/
    WhatDetailPage.tsx
    WhatDetailPage.module.css
```

### useWork Hook

```typescript
// frontend/src/hooks/useWork.ts
export function useWork(id: number, lang = 'ko') {
  const [data, setData] = useState<WorkItem | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchWork(id, lang)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [id, lang])

  return { data, loading, error }
}
```

### App.tsx 라우트 추가

```tsx
// frontend/src/App.tsx
<Route path="/what/:id" element={<WhatDetailPage />} />
```

### WhatDetailPage 구조

```tsx
function WhatDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { data, loading } = useWork(Number(id))

  return (
    <main>
      <Link to="/what">← what</Link>

      {/* 히어로 이미지 (16:9) */}
      <div className={styles.hero}>
        <img src={PLACEHOLDER_IMAGES[data.id % 3]} alt={data.title} />
      </div>

      <div className={styles.info}>
        {/* 메타: category · year */}
        <div className={styles.meta}>
          <span>{data.category}</span>
          <span>·</span>
          <span>{data.year}</span>
        </div>

        {/* 제목 + 프로젝트 링크 나란히 */}
        <div className={styles.titleRow}>
          <h1>{data.title}</h1>
          {data.projectUrl && (
            <a href={data.projectUrl} target="_blank" rel="noopener noreferrer">
              프로젝트 보기 ↗
            </a>
          )}
        </div>

        <p>{data.description}</p>

        {/* 툴 태그 (임시 고정값) */}
        <div className={styles.tags}>
          {['Figma', 'Illustrator', 'After Effects'].map(tag => (
            <span key={tag}>{tag}</span>
          ))}
        </div>

        {/* 작업 과정 설명 (임시 고정값) */}
        <section>
          <h2>작업 과정</h2>
          <p>...</p>
        </section>

        {/* 갤러리 이미지 (임시 Unsplash) */}
        <div className={styles.gallery}>...</div>
      </div>
    </main>
  )
}
```

### WhatDetailPage 레이아웃

| 요소 | 설명 |
|------|------|
| 히어로 이미지 | `aspect-ratio: 16/9`, `object-fit: cover`, 테두리+둥근 모서리 |
| titleRow | `display: flex`, `align-items: baseline` — 제목과 링크 기준선 맞춤 |
| 프로젝트 링크 | 버튼 없이 텍스트 링크만 (`--fg-muted` → hover `--fg`) |
| 태그 | `border`, `border-radius: 4px`, `padding: space-2 space-3`, `line-height: 1` |
| 갤러리 | 2열 그리드, 첫 번째 이미지 `grid-column: 1 / -1` (전체 너비) |

### WhatPage 카드 클릭 → 상세 이동

```tsx
// frontend/src/pages/WhatPage.tsx
const navigate = useNavigate()

<li onClick={() => navigate(`/what/${item.id}`)}>
  ...
</li>
```

---

## 8. 백엔드 — projectUrl 예시 데이터 추가

기존에 모두 `null`이었던 `projectUrl`에 예시 URL 추가.  
visual 작업물: behance, motion 작업물: vimeo 링크.

**`backend/Services/WhatService.cs`**
```csharp
new(Id: 1, ..., ProjectUrl: "https://www.behance.net/davemins", Year: 2024),
new(Id: 2, ..., ProjectUrl: "https://www.behance.net/davemins", Year: 2024),
new(Id: 3, ..., ProjectUrl: "https://vimeo.com/davemins", Year: 2025),
new(Id: 4, ..., ProjectUrl: "https://vimeo.com/davemins", Year: 2025),
```

> 실제 작업물 링크가 생기면 교체 필요.

---

## 9. 시도했다가 제거한 것들

### 연도 필터 (제거)

`/what` 페이지에 연도 필터를 클라이언트 사이드로 구현했다가 제거.

```tsx
// 추가했다가 제거된 코드
const years = useMemo(() => {
  const set = new Set(data.map(item => item.year))
  return Array.from(set).sort((a, b) => b - a)
}, [data])

const filtered = useMemo(() => {
  return year ? data.filter(item => item.year === year) : data
}, [data, year])
```

**제거 이유:** 실제 사용 흐름에서 연도 필터가 필요하지 않다고 판단.  
카테고리 필터만으로 충분.

### 프로젝트 링크 버튼 스타일 (변경)

처음엔 테두리 있는 버튼 형태로 구현.

```css
/* 초기 버전 — 제거됨 */
.linkBtn {
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: var(--space-2) var(--space-4);
}
```

**변경 이유:** 제목 옆에 있는 버튼이 너무 크고 무거워 보임.  
텍스트 링크(`프로젝트 보기 ↗`)만으로 충분.

### 프로젝트 링크 위치 (변경)

처음엔 페이지 맨 하단에 구분선과 함께 배치.  
→ 제목 바로 옆(`titleRow`)으로 이동.

**변경 이유:** 스크롤해야만 보이는 위치보다 제목과 함께 바로 보이는 게 자연스러움.

---

## 빌드 확인

```bash
cd frontend
npm run build
# ✓ built in ~3s
```

```bash
cd backend
dotnet build
# Build succeeded
```
