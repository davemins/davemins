# Phase 3 — 프론트엔드 기반 구성

## 개요

React + Vite + TypeScript 프론트엔드의 기반을 잡는다.  
라우팅, 디자인 토큰, 공통 레이아웃(Navbar/Footer), API 서비스 레이어, TypeScript 타입을 구성한다.  
각 페이지 컴포넌트는 이 단계에서 빈 껍데기만 만들고, 실제 화면은 Phase 4에서 구현한다.

---

## 패키지 설치

```bash
cd frontend
npm install react-router-dom
```

---

## 파일 구조

```
frontend/src/
  components/
    Navbar.tsx
    Navbar.module.css
    Footer.tsx
    Footer.module.css
  pages/
    HomePage.tsx
    WhoPage.tsx
    WhatPage.tsx
    HowPage.tsx
    HowDetailPage.tsx
  services/
    api.ts               ← API 호출 레이어
  types/
    who.ts
    what.ts
    how.ts
  App.tsx                ← BrowserRouter + Routes
  index.css              ← 디자인 토큰 + 전역 리셋
  main.tsx               ← (변경 없음)
```

---

## Step 1. 디자인 토큰 (index.css)

CSS 변수로 색상, 타이포그래피, 간격, 레이아웃 기준값을 정의한다.  
모든 컴포넌트는 하드코딩된 값 대신 이 변수를 사용한다.

```css
/* index.css */
:root {
  /* 색상 */
  --bg: #ffffff;
  --bg-subtle: #f9f9f8;
  --border: #ebebea;
  --fg: #111110;
  --fg-muted: #6f6e6b;
  --fg-subtle: #aeada9;
  --accent: #111110;

  /* 타이포그래피 */
  --font-sans: 'Pretendard', system-ui, -apple-system, sans-serif;
  --font-serif: 'Georgia', 'Times New Roman', serif;
  --font-mono: 'JetBrains Mono', ui-monospace, monospace;

  --text-xs: 0.75rem;    /* 12px */
  --text-sm: 0.875rem;   /* 14px */
  --text-base: 1rem;     /* 16px */
  --text-lg: 1.125rem;   /* 18px */
  --text-xl: 1.25rem;    /* 20px */
  --text-2xl: 1.5rem;    /* 24px */
  --text-3xl: 1.875rem;  /* 30px */
  --text-4xl: 2.25rem;   /* 36px */

  /* 간격 (4px 기준) */
  --space-1: 0.25rem;
  --space-2: 0.5rem;
  --space-3: 0.75rem;
  --space-4: 1rem;
  --space-5: 1.25rem;
  --space-6: 1.5rem;
  --space-8: 2rem;
  --space-10: 2.5rem;
  --space-12: 3rem;
  --space-16: 4rem;
  --space-20: 5rem;
  --space-24: 6rem;

  /* 레이아웃 */
  --max-width: 720px;
  --max-width-wide: 1080px;
}

/* 다크모드 */
@media (prefers-color-scheme: dark) {
  :root {
    --bg: #111110;
    --bg-subtle: #1a1a19;
    --border: #282826;
    --fg: #f0efec;
    --fg-muted: #9b9a96;
    --fg-subtle: #62615d;
    --accent: #f0efec;
  }
}
```

이어서 전역 리셋:

```css
*, *::before, *::after {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

body {
  font-family: var(--font-sans);
  font-size: var(--text-base);
  line-height: 1.6;
  color: var(--fg);
  background: var(--bg);
  -webkit-font-smoothing: antialiased;
}

a { color: inherit; text-decoration: none; }
img, video { max-width: 100%; display: block; }

#root {
  min-height: 100svh;
  display: flex;
  flex-direction: column;
}
```

---

## Step 2. TypeScript 타입 정의 (types/)

백엔드 DTO와 1:1 대응하는 타입을 정의한다.

### types/who.ts

```typescript
export interface SocialLink {
  platform: string
  url: string
}

export interface WhoData {
  name: string
  role: string
  bio: string
  skills: string[]
  socialLinks: SocialLink[]
}
```

### types/what.ts

```typescript
export type WorkCategory = 'visual' | 'motion' | 'web' | 'audio' | 'game'

export interface WorkItem {
  id: number
  title: string
  description: string
  category: WorkCategory
  thumbnailUrl: string | null
  projectUrl: string | null
  year: number
}
```

### types/how.ts

```typescript
export interface PostListItem {
  id: number
  slug: string
  title: string
  summary: string
  publishedAt: string
}

export interface PostDetail extends PostListItem {
  content: string
}
```

---

## Step 3. API 서비스 레이어 (services/api.ts)

모든 fetch 호출을 한 파일에 모은다. 컴포넌트는 fetch를 직접 쓰지 않는다.

```typescript
import type { WhoData } from '../types/who'
import type { WorkItem, WorkCategory } from '../types/what'
import type { PostListItem, PostDetail } from '../types/how'

const BASE = '/api'

// 공통 GET 래퍼 — 쿼리 파라미터를 객체로 받아 URL에 붙여준다
async function get<T>(path: string, params?: Record<string, string>): Promise<T> {
  const url = new URL(path, window.location.origin)
  if (params) {
    Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, v))
  }
  const res = await fetch(url.toString())
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}

export function fetchWho(lang = 'ko') {
  return get<WhoData>(`${BASE}/who`, { lang })
}

export function fetchWorks(lang = 'ko', category?: WorkCategory) {
  const params: Record<string, string> = { lang }
  if (category) params.category = category
  return get<WorkItem[]>(`${BASE}/what`, params)
}

export function fetchWork(id: number, lang = 'ko') {
  return get<WorkItem>(`${BASE}/what/${id}`, { lang })
}

export function fetchPosts(lang = 'ko') {
  return get<PostListItem[]>(`${BASE}/how`, { lang })
}

export function fetchPost(slug: string, lang = 'ko') {
  return get<PostDetail>(`${BASE}/how/${slug}`, { lang })
}

export async function sendContact(name: string, email: string, message: string) {
  const res = await fetch(`${BASE}/contact`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email, message }),
  })
  if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
  return res.json()
}
```

- `/api/*` 요청은 Vite proxy가 `http://localhost:5000`으로 전달한다 (Phase 1에서 설정).
- `lang` 기본값은 `'ko'`. 추후 i18n 상태에서 주입.

---

## Step 4. Navbar 컴포넌트

```tsx
// components/Navbar.tsx
import { NavLink } from 'react-router-dom'
import styles from './Navbar.module.css'

const NAV_ITEMS = [
  { to: '/who', label: 'who' },
  { to: '/what', label: 'what' },
  { to: '/how', label: 'how' },
]

function Navbar() {
  return (
    <header className={styles.header}>
      <NavLink to="/" className={styles.logo}>davemins</NavLink>
      <nav className={styles.nav}>
        {NAV_ITEMS.map(({ to, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              isActive ? `${styles.link} ${styles.active}` : styles.link
            }
          >
            {label}
          </NavLink>
        ))}
      </nav>
    </header>
  )
}

export default Navbar
```

```css
/* components/Navbar.module.css */
.header {
  position: sticky;
  top: 0;
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 var(--space-6);
  height: 56px;
  background: var(--bg);
  border-bottom: 1px solid var(--border);
}

.logo { font-size: var(--text-sm); font-weight: 500; color: var(--fg); }
.nav { display: flex; gap: var(--space-6); }
.link { font-size: var(--text-sm); color: var(--fg-muted); transition: color 0.15s; }
.link:hover, .active { color: var(--fg); }
```

---

## Step 5. Footer 컴포넌트

```tsx
// components/Footer.tsx
import styles from './Footer.module.css'

function Footer() {
  return (
    <footer className={styles.footer}>
      <span className={styles.copy}>© {new Date().getFullYear()} davemins</span>
    </footer>
  )
}

export default Footer
```

---

## Step 6. 라우터 설정 (App.tsx)

```tsx
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import HomePage from './pages/HomePage'
import WhoPage from './pages/WhoPage'
import WhatPage from './pages/WhatPage'
import HowPage from './pages/HowPage'
import HowDetailPage from './pages/HowDetailPage'

function App() {
  return (
    <BrowserRouter>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/who" element={<WhoPage />} />
        <Route path="/what" element={<WhatPage />} />
        <Route path="/how" element={<HowPage />} />
        <Route path="/how/:slug" element={<HowDetailPage />} />
      </Routes>
      <Footer />
    </BrowserRouter>
  )
}

export default App
```

---

## Step 7. 빌드 확인

```bash
cd frontend
npm run build
```

`✓ built in X.XXs` 가 나오면 정상.

---

## 개발 서버 실행 (전체)

```bash
# 터미널 1 — 백엔드
cd backend
dotnet run

# 터미널 2 — 프론트엔드
cd frontend
npm run dev
```

`http://localhost:5173` 에서 Navbar와 라우팅이 동작하면 Phase 3 완료.
