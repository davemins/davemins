# Setup

## 로컬 개발 환경

### 사전 요구사항

- [.NET 8 SDK](https://dotnet.microsoft.com/download)
- [Node.js 20+](https://nodejs.org/)

### 백엔드 실행

```bash
cd backend
dotnet run
# http://localhost:5000
```

### 프론트엔드 실행

```bash
cd frontend
npm install
npm run dev
# http://localhost:5173
```

프론트엔드는 `/api/*` 요청을 Vite proxy를 통해 백엔드(5000포트)로 자동 전달합니다.

---

## 콘텐츠 관리

콘텐츠는 `backend/content/` 폴더에서 파일로 관리합니다. 백엔드를 재시작하면 변경사항이 반영됩니다.

```
backend/content/
  who/
    ko.json        ← /who 페이지 데이터 (이름, 소개, 스킬, 링크)
    en.json
    es.json
  works/
    ko/ en/ es/
      001-*.md     ← /what 작업물 (frontmatter + 본문)
  posts/
    ko/ en/ es/
      *.md         ← /how 글 (frontmatter + 본문)
```

### works 파일 형식

```markdown
---
id: 1
title: 작업물 제목
description: 한 줄 설명
category: visual          # visual | motion | web | audio | game
year: 2024
projectUrl: https://...
tags: Figma, After Effects
thumbnailUrl: https://...  # /what 카드 썸네일
coverImage: https://...    # 상세 페이지 커버 (16:9)
images: https://...1, https://...2  # 갤러리 이미지 (쉼표 구분)
---

본문 내용 (작업 과정 등)
```

### posts 파일 형식

```markdown
---
title: 글 제목
summary: 한 줄 요약
publishedAt: 2025-05-22
---

본문 (Markdown)
```

---

## API

```
GET /api/who?lang=ko
GET /api/what?lang=ko&category=visual
GET /api/what/:id?lang=ko
GET /api/how?lang=ko
GET /api/how/:slug?lang=ko
POST /api/contact
```

---

## 배포

### 프론트엔드 (S3 + CloudFront)

```bash
cd frontend
cp .env.example .env
# .env에서 VITE_API_BASE_URL 설정 (백엔드 도메인)
npm run build
# dist/ 폴더를 S3에 업로드
```

CloudFront 설정:
- `/*` → S3 버킷
- SPA 라우팅: 오류 페이지 403/404 → `/index.html` (200)

### 백엔드 (EC2)

`appsettings.json`의 `AllowedOrigins`에 프론트엔드 도메인 추가:

```json
{
  "AllowedOrigins": [
    "https://davemins.com",
    "https://www.davemins.com"
  ]
}
```

```bash
cd backend
dotnet publish -c Release -o ./publish
# publish/ 폴더를 EC2에 배포
```
