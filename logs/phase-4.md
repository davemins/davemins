# Phase 4 — 페이지 구현

## 개요

각 라우트에 실제 화면을 구현한다.  
커스텀 Hook이 API를 호출하고, 페이지 컴포넌트는 받은 데이터를 렌더링하는 역할만 담당한다.

---

## 패키지 설치

```bash
cd frontend
npm install react-markdown remark-gfm
```

- `react-markdown`: 마크다운 문자열을 React 컴포넌트로 렌더링
- `remark-gfm`: GitHub Flavored Markdown 확장 (표, 취소선 등)

---

## 파일 구조

```
frontend/src/
  hooks/
    useWho.ts
    useWorks.ts
    usePosts.ts
    usePost.ts
  pages/
    HomePage.tsx + HomePage.module.css
    WhoPage.tsx + WhoPage.module.css
    WhatPage.tsx + WhatPage.module.css
    HowPage.tsx + HowPage.module.css
    HowDetailPage.tsx + HowDetailPage.module.css
```

---

## Hook 패턴

모든 커스텀 Hook은 동일한 구조를 따른다.

```typescript
export function useWho(lang = 'ko') {
  const [data, setData] = useState<WhoData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    setLoading(true)
    fetchWho(lang)
      .then(setData)
      .catch(setError)
      .finally(() => setLoading(false))
  }, [lang])

  return { data, loading, error }
}
```

| Hook | 반환 타입 | API 함수 |
|------|-----------|----------|
| `useWho(lang)` | `WhoData \| null` | `fetchWho` |
| `useWorks(lang, category?)` | `WorkItem[]` | `fetchWorks` |
| `usePosts(lang)` | `PostListItem[]` | `fetchPosts` |
| `usePost(slug, lang)` | `PostDetail \| null` | `fetchPost` |

---

## Step 1. HomePage (/)

```tsx
import { Link } from 'react-router-dom'

const LINKS = [
  { to: '/who', label: 'who', desc: '어떤 사람인지' },
  { to: '/what', label: 'what', desc: '무엇을 만들었는지' },
  { to: '/how', label: 'how', desc: '어떻게 생각하는지' },
]

function HomePage() {
  return (
    <main>
      <section>
        <p>davemins</p>
        <p>영상, 디자인, 코드로 이야기를 만듭니다.</p>
      </section>
      <nav>
        {LINKS.map(({ to, label, desc }) => (
          <Link key={to} to={to}>
            <span>{label}</span>
            <span>{desc}</span>
          </Link>
        ))}
      </nav>
    </main>
  )
}
```

**레이아웃:**
- 페이지 중앙 정렬, 최대 너비 `--max-width` (720px)
- 이름 + 태그라인 → 세 링크 목록 (구분선)
- 링크 hover 시 opacity 감소

---

## Step 2. WhoPage (/who)

```tsx
function WhoPage() {
  const { data, loading } = useWho()

  if (loading) return null

  return (
    <main>
      <section>
        <h1>{data?.name}</h1>
        <p>{data?.role}</p>
        <p>{data?.bio}</p>
      </section>
      <section>
        <h2>skills</h2>
        <ul>
          {data?.skills.map(skill => <li key={skill}>{skill}</li>)}
        </ul>
      </section>
      <section>
        <h2>links</h2>
        <ul>
          {data?.socialLinks.map(({ platform, url }) => (
            <li key={platform}>
              <a href={url} target="_blank" rel="noopener noreferrer">{platform} ↗</a>
            </li>
          ))}
        </ul>
      </section>
    </main>
  )
}
```

**레이아웃:**
- 섹션 타이틀: uppercase, 소문자, letter-spacing
- Skills: 태그 형태 (border + border-radius: 99px)
- 로딩 중: `return null` (빈 화면)

---

## Step 3. WhatPage (/what)

```tsx
function WhatPage() {
  const [category, setCategory] = useState<WorkCategory | undefined>(undefined)
  const { data, loading } = useWorks('ko', category)

  return (
    <main>
      <nav>
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={label}
            className={category === value ? 'active' : ''}
            onClick={() => setCategory(value)}
          >
            {label}
          </button>
        ))}
      </nav>
      <ul>
        {data.map(item => (
          <li key={item.id}>
            <div className="thumb" />   {/* 썸네일 자리 */}
            <span>{item.category}</span>
            <h2>{item.title}</h2>
            <p>{item.description}</p>
            <span>{item.year}</span>
          </li>
        ))}
      </ul>
    </main>
  )
}
```

**카테고리 탭:**
- `all` / `visual` / `motion` 버튼
- 선택된 탭: `bg-subtle` 배경
- category가 `undefined`이면 전체 조회

**그리드:**
- `grid-template-columns: repeat(auto-fill, minmax(280px, 1fr))`
- 썸네일: `aspect-ratio: 4/3`, `background: bg-subtle` (이미지 없을 때 회색 박스)

---

## Step 4. HowPage (/how)

```tsx
function HowPage() {
  const { data, loading } = usePosts()

  if (loading) return null

  return (
    <main>
      <ul>
        {data.map(post => (
          <li key={post.slug}>
            <Link to={`/how/${post.slug}`}>
              <time>{post.publishedAt}</time>
              <h2>{post.title}</h2>
              <p>{post.summary}</p>
            </Link>
          </li>
        ))}
      </ul>
    </main>
  )
}
```

**레이아웃:**
- 최대 너비 `--max-width` (720px)
- 각 항목 하단 구분선
- hover 시 opacity 감소

---

## Step 5. HowDetailPage (/how/:slug)

```tsx
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

function HowDetailPage() {
  const { slug } = useParams<{ slug: string }>()
  const { data, loading } = usePost(slug ?? '')

  if (loading) return null
  if (!data) return (
    <main>
      <p>글을 찾을 수 없습니다.</p>
      <Link to="/how">← 목록으로</Link>
    </main>
  )

  return (
    <main>
      <Link to="/how">← how</Link>
      <header>
        <time>{data.publishedAt}</time>
        <h1>{data.title}</h1>
        <p>{data.summary}</p>
      </header>
      <article>
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {data.content}
        </ReactMarkdown>
      </article>
    </main>
  )
}
```

**마크다운 스타일 (article 내):**
- `h2`, `h3`: 색상 `var(--fg)`, font-weight 500
- `code`: monospace, 배경 `var(--bg-subtle)`, 테두리
- `blockquote`: 좌측 2px 실선, serif 폰트
- 단락 간격: `gap: var(--space-6)` (flexbox column)

---

## 디자인 원칙 적용

| 원칙 | 적용 |
|------|------|
| 여백 최우선 | 섹션 간 `gap: space-16`, 페이지 패딩 `space-24` |
| 타이포그래피 중심 | 썸네일 없어도 텍스트만으로 완성된 레이아웃 |
| 단순한 인터랙션 | hover: opacity / color 변화만. 애니메이션 최소 |
| 로딩 처리 | `return null` — 빈 화면 유지 (스켈레톤 없음) |

---

## 빌드 확인

```bash
cd frontend
npm run build
```
