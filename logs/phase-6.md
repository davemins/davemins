# Phase 6 — 배포 (Render + Vercel) + 분석 도구

## 개요

Phase 6는 로컬에서만 돌아가던 프로젝트를 실제로 인터넷에 올리는 단계다.
비용 없이 운영할 수 있는 무료 조합을 선택했다.

| 역할 | 서비스 | 비용 |
|------|--------|------|
| 백엔드 (ASP.NET Core) | Render | 무료 |
| 프론트엔드 (React) | Vercel | 무료 |
| 슬립 방지 | UptimeRobot | 무료 |
| 방문자 통계 | Google Analytics | 무료 |
| 행동 분석 | Microsoft Clarity | 무료 |

포함된 커밋:
- `22b2776` — `chore(deploy): Render 배포 준비 — Dockerfile 추가 및 ALLOWED_ORIGINS 환경변수 지원`
- `65f9f18` — `chore(deploy): Vercel SPA 라우팅 설정 추가`
- `b672a82` — `fix(deploy): content .md 파일 publish 출력에 포함되도록 csproj 수정`
- `9d4dec7` — `feat(init): Google Analytics 추가`
- `e01bc50` — `feat(init): Microsoft Clarity 추가`

---

## 1. 배포 플랫폼 선택 과정

### 처음에 고려한 옵션들

| 옵션 | 장점 | 단점 |
|------|------|------|
| AWS EC2 + S3 | 자유도 높음 | 프리티어 1년 만료 시 과금 위험 |
| Azure App Service + Static Web Apps | .NET과 궁합 좋음, 슬립 없음 | Azure 계정 설정 복잡 |
| Render + Vercel | 완전 무료, GitHub 연동 자동 배포 | Render 무료 티어 슬립 문제 |
| 백엔드 제거 + GitHub Pages | 완전 무료, 배포 가장 단순 | 백엔드 사라짐, Contact 폼 불가 |

**선택: Render(백엔드) + Vercel(프론트엔드)**

이유:
- 과금 위험이 0이다. AWS 과금 폭탄 경험으로 AWS는 제외.
- 풀스택 구조를 유지하고 싶었다 (백엔드 제거 방식 제외).
- Render는 Docker를 지원하므로 ASP.NET Core 그대로 올릴 수 있다.
- GitHub push → 자동 배포까지 설정이 간단하다.

**Render 무료 티어 단점:** 15분 비활성 시 슬립. 첫 요청에 30초 딜레이 발생.
→ UptimeRobot으로 5분마다 헬스체크를 걸어 슬립을 방지했다.

---

## 2. 배포 준비 — csproj 수정

### 문제: .md 파일이 Docker 빌드 출력에 포함되지 않음

배포 후 `/api/what`, `/api/how`가 빈 배열(`[]`)을 반환했다.
`/api/who`는 정상이었는데 `what`과 `how`만 안 됐다.

**원인 분석:**

| API | 파일 형식 | 결과 |
|-----|----------|------|
| `/api/who` | `.json` | 정상 |
| `/api/what` | `.md` | 빈 배열 |
| `/api/how` | `.md` | 빈 배열 |

ASP.NET Core Web SDK는 `.json` 파일을 암묵적으로 Content 항목에 포함한다.
하지만 `.md` 파일은 암묵적으로 포함하지 않는다.

초기 `csproj` 설정에서 `Include`를 `Update`로 바꿔두었는데,
`Update`는 이미 포함된 항목의 메타데이터를 수정하는 것이다.
`.md` 파일은 애초에 포함되지 않았으므로 `Update`가 아무 효과도 내지 않았다.

**수정 전 (문제 있음)**
```xml
<ItemGroup>
  <Content Update="content\**\*" CopyToOutputDirectory="PreserveNewest" CopyToPublishDirectory="PreserveNewest" />
</ItemGroup>
```

**수정 후 (정상)**
```xml
<ItemGroup>
  <!-- Remove 후 Include: .json(암묵적 포함)과 .md(미포함) 모두 명시적으로 등록 -->
  <Content Remove="content\**\*" />
  <Content Include="content\**\*" CopyToOutputDirectory="PreserveNewest" CopyToPublishDirectory="PreserveNewest" />
</ItemGroup>
```

`Remove`로 기존 암묵적 항목을 먼저 제거하고, `Include`로 전체를 다시 명시적으로 등록.
이렇게 하면 중복 등록 에러 없이 `.json`과 `.md` 모두 publish 출력에 포함된다.

> **기억할 것:** ASP.NET Core Web 프로젝트에서 `.md` 같은 비표준 파일을 배포에 포함하려면
> `Update`가 아닌 `Remove` + `Include` 조합이 필요하다.

### 최초 csproj 에러 원인

Phase 5까지 `csproj`에 `Include`로 되어 있었는데 빌드 시 중복 에러가 발생했다.

```
error NETSDK1022: 'Content' 중복 항목이 포함되었습니다.
중복 항목: 'content\who\en.json'; 'content\who\es.json'; 'content\who\ko.json'
```

SDK가 `.json`을 암묵적으로 포함하는데, `csproj`에도 `Include`로 명시되어 중복이 생긴 것.
당시 임시 수정으로 `Update`를 사용했다가 배포에서 `.md` 누락 문제가 드러났다.

---

## 3. Dockerfile 작성

Render가 백엔드를 Docker 컨테이너로 실행하므로 Dockerfile이 필요하다.

**`backend/Dockerfile`**
```dockerfile
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /app
COPY *.csproj ./
RUN dotnet restore
COPY . ./
RUN dotnet publish -c Release -o /out

FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app
COPY --from=build /out ./
ENTRYPOINT ["dotnet", "davemins.dll"]
```

**멀티 스테이지 빌드:**
- `build` 스테이지: SDK 이미지(크기 큼)에서 빌드
- 런타임 스테이지: aspnet 이미지(크기 작음)에 결과물만 복사

결과적으로 배포 이미지는 런타임만 포함하므로 크기가 작다.

**동작 흐름:**
1. `COPY *.csproj` → `dotnet restore` (NuGet 패키지 복원, 레이어 캐시 활용)
2. `COPY . .` (소스코드 + content 폴더 전체 복사)
3. `dotnet publish -c Release -o /out` (Release 빌드, `/out`에 출력)
4. 런타임 이미지에서 `/out` 전체를 `/app`으로 복사
5. `dotnet davemins.dll`로 실행

---

## 4. CORS + PORT 환경변수 지원

배포 환경에서는 포트와 허용 도메인이 달라지므로 환경변수로 주입받아야 한다.

**`backend/Program.cs`**
```csharp
// Render 등 클라우드 환경에서 PORT 환경변수로 포트 지정
var port = Environment.GetEnvironmentVariable("PORT") ?? "5000";
builder.WebHost.UseUrls($"http://0.0.0.0:{port}");

// ALLOWED_ORIGINS 환경변수로 배포 프론트엔드 도메인 추가 (쉼표 구분)
var extraOrigins = Environment.GetEnvironmentVariable("ALLOWED_ORIGINS")
    ?.Split(',', StringSplitOptions.RemoveEmptyEntries | StringSplitOptions.TrimEntries)
    ?? [];
allowedOrigins = [.. allowedOrigins, .. extraOrigins];
```

- **PORT:** Render는 컨테이너 실행 시 사용할 포트를 `PORT` 환경변수로 전달한다. 없으면 로컬 기본값 `5000` 사용.
- **ALLOWED_ORIGINS:** 배포된 프론트엔드 도메인을 런타임에 주입. `appsettings.json`의 로컬 도메인과 합쳐서 CORS 정책에 적용.

`appsettings.json`은 그대로 두고 환경변수로만 추가하는 방식이라,
코드 수정 없이 Render 대시보드에서 도메인을 추가/변경할 수 있다.

---

## 5. Phase 6-1. Render 백엔드 배포

### 설정 값

| 항목 | 값 |
|------|----|
| Source | `davemins/davemins` GitHub 리포 |
| Language | Docker |
| Branch | main |
| Root Directory | `backend` |
| Instance Type | Free |

Root Directory를 `backend`로 지정하면 Render가 자동으로:
- Docker Build Context → `backend/`
- Dockerfile Path → `backend/Dockerfile`

로 잡아준다. 별도로 Dockerfile 경로를 지정할 필요가 없다.

### 첫 배포 소요 시간

약 7~10분. .NET SDK 이미지(`mcr.microsoft.com/dotnet/sdk:8.0`) 다운로드가 대부분을 차지한다.
이후 재배포는 레이어 캐시로 훨씬 빠르다.

### 배포 URL

`https://davemins.onrender.com`

---

## 6. Phase 6-2. Vercel 프론트엔드 배포

### 설정 값

| 항목 | 값 |
|------|----|
| Source | `davemins/davemins` GitHub 리포 |
| Framework Preset | Vite (자동 감지) |
| Root Directory | `frontend` |
| Build Command | `npm run build` (자동) |
| Output Directory | `dist` (자동) |
| 환경변수 `VITE_API_BASE_URL` | `https://davemins.onrender.com` |

`VITE_API_BASE_URL`은 Vite 빌드 타임에 코드에 삽입된다 (`import.meta.env.VITE_API_BASE_URL`).
배포 전에 설정해야 하며, 변경 시 재배포가 필요하다.

**`frontend/src/services/api.ts`**
```typescript
const API_BASE = import.meta.env.VITE_API_BASE_URL ?? ''
// 개발: '' → Vite proxy가 /api/* → localhost:5000으로 전달
// 배포: 'https://davemins.onrender.com' → 직접 백엔드 호출
```

### 배포 URL

`https://davemins.vercel.app`

---

## 7. 발생한 문제들과 해결

### 문제 1 — CORS 에러

```
Access to fetch at 'https://davemins.onrender.com/api/who?lang=ko'
from origin 'https://davemins.vercel.app' has been blocked by CORS policy:
No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

**원인:** Render에 `ALLOWED_ORIGINS` 환경변수를 추가했지만 자동 재배포가 되지 않았다.

**해결:** Render 대시보드 → Environment → `ALLOWED_ORIGINS=https://davemins.vercel.app` 저장 후 **Manual Deploy** 실행.

**검증:**
```bash
curl -I -H "Origin: https://davemins.vercel.app" https://davemins.onrender.com/api/who?lang=ko
# → access-control-allow-origin: https://davemins.vercel.app 확인
```

### 문제 2 — Vercel SPA 라우팅 404

```
404: NOT_FOUND — Code: NOT_FOUND
```

`/ko/how` 같은 경로를 직접 입력하거나 새로고침하면 Vercel이 해당 파일을 찾지 못해 404를 반환한다.

**원인:** React는 SPA(Single Page Application)라 실제 파일은 `index.html` 하나뿐이다.
`/ko/how`라는 실제 파일이 없으므로 Vercel이 404를 내보낸다.

**해결:** `frontend/vercel.json` 추가

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

모든 경로 요청을 `index.html`로 rewrite하면, React Router가 경로를 처리한다.

### 문제 3 — what, how API 빈 배열

위의 2번 항목(`csproj 수정`)에서 설명한 `.md` 파일 누락 문제.

---

## 8. Phase 6-3. UptimeRobot — 슬립 방지

### Render 무료 티어 슬립 동작

Render 무료 인스턴스는 **15분** 동안 HTTP 요청이 없으면 슬립 상태로 전환된다.
슬립 후 첫 요청 시 인스턴스를 깨우는 데 **30초** 내외가 소요된다.

포트폴리오 특성상 방문자가 드문드문 오므로 슬립이 자주 걸린다.
방문자 입장에서 첫 페이지 로딩에 30초가 걸리면 이탈 가능성이 높다.

### UptimeRobot 설정

[uptimerobot.com](https://uptimerobot.com) 무료 플랜:
- 모니터 50개까지 무료
- 5분 간격 체크
- 이메일 알림

| 항목 | 값 |
|------|----|
| Monitor Type | HTTP(s) |
| URL | `https://davemins.onrender.com/api/who?lang=ko` |
| Interval | 5 minutes |

5분마다 `/api/who?lang=ko`에 요청을 보내 인스턴스가 슬립에 들어가지 않도록 유지한다.
헬스체크 전용 엔드포인트(`/healthz`)를 따로 만들지 않고 기존 API를 활용했다.

---

## 9. Phase 6-4. Google Analytics — 방문자 통계

방문자 수, 국가, 유입 경로, 체류 시간 등을 집계한다.

**추가 위치:** `frontend/index.html` `<head>` 내부

```html
<!-- Google tag (gtag.js) -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

GA4는 SPA 라우팅에서 `pushState` 기반 페이지 전환을 자동으로 감지한다.
별도 설정 없이 각 페이지(`/ko`, `/ko/who`, `/ko/what` 등) 조회수를 수집한다.

**데이터 반영 시간:**
- 실시간 탭: 즉시 (수 초~수 분)
- 일반 보고서: 24~48시간

---

## 10. Phase 6-5. Microsoft Clarity — 행동 분석

클릭, 스크롤, 마우스 이동, 세션 녹화, 히트맵을 제공한다.
GA가 "얼마나 왔는가"를 보여준다면, Clarity는 "어떻게 사용하는가"를 보여준다.

**추가 위치:** `frontend/index.html` `<head>` 내부, GA 코드 위

```html
<!-- Microsoft Clarity -->
<script type="text/javascript">
  (function(c,l,a,r,i,t,y){
    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
  })(window, document, "clarity", "script", "[project-id]");
</script>
```

**Clarity에서 확인할 수 있는 것:**
- 어떤 버튼을 가장 많이 클릭하는가
- 어느 지점에서 스크롤을 멈추는가
- 어디서 이탈하는가
- 실제 세션 녹화 (마우스 움직임 포함)

데이터는 배포 후 수 분 내로 수집 시작.

---

## 11. 최종 아키텍처

```
GitHub (davemins/davemins)
  ├── main push
  │     ├── Render 자동 재배포 (backend/)
  │     └── Vercel 자동 재배포 (frontend/)
  │
  ├── Render (백엔드)
  │     URL: https://davemins.onrender.com
  │     환경변수: PORT, ALLOWED_ORIGINS
  │     ← UptimeRobot이 5분마다 헬스체크
  │
  └── Vercel (프론트엔드)
        URL: https://davemins.vercel.app
        환경변수: VITE_API_BASE_URL
        → Render API 직접 호출
        → GA, Clarity 스크립트 포함
```

---

## 12. 배포 완료 체크리스트

```
[v] https://davemins.onrender.com/api/who?lang=ko   → JSON 응답
[v] https://davemins.onrender.com/api/what?lang=ko  → 데이터 배열
[v] https://davemins.onrender.com/api/how?lang=ko   → 데이터 배열
[v] https://davemins.vercel.app/ko                  → 페이지 로딩
[v] /who, /what, /how 데이터 정상 표시
[v] 새로고침 시 404 없음 (vercel.json)
[v] F12 콘솔 CORS 에러 없음
[v] UptimeRobot 모니터 Up 상태
[v] GA 실시간 탭 카운트 확인
[v] Clarity 세션 수집 확인
```

---

## 13. 발생할 수 있는 추가 오류

### Render 재배포가 자동으로 안 될 때

환경변수 저장 후에도 재배포가 안 되는 경우가 있다.
Render 대시보드 우측 상단 **Manual Deploy** → **Deploy latest commit** 으로 강제 재배포.

### ALLOWED_ORIGINS 여러 개 설정

프론트엔드 도메인이 여러 개인 경우 (예: Vercel 미리보기 URL 추가):

```
ALLOWED_ORIGINS=https://davemins.vercel.app,https://davemins-preview.vercel.app
```

쉼표로 구분하면 `Program.cs`의 `Split(',')` 로직이 분리해서 처리한다.
