# Phase 1 — 프로젝트 초기 설정

## 개요

davemins 포트폴리오 + 블로그 프로젝트의 monorepo 초기 구조를 설정한다.  
백엔드(ASP.NET Core 8)와 프론트엔드(React + Vite + TypeScript)를 각각 폴더에 구성한다.

---

## 사전 준비

아래 도구가 설치되어 있어야 한다.

| 도구 | 버전 (확인 명령어) | 비고 |
|------|-------------------|------|
| Git | `git --version` | 2.x 이상 |
| .NET SDK | `dotnet --version` | 8.x 또는 9.x |
| Node.js | `node --version` | 20.17.0 이상 (단, Vite 8은 20.19.0+ 필요 → Vite 7 사용) |
| npm | `npm --version` | 10.x 이상 |

---

## 작업 디렉토리

```
d:/develop/davemins/   ← 프로젝트 루트 (monorepo)
  backend/             ← ASP.NET Core 8 Web API
  frontend/            ← React + Vite + TypeScript
  logs/                ← 단계별 작업 로그 (이 파일)
  .gitignore
```

---

## Step 1. Git 초기화

```bash
cd d:/develop/davemins
git init
```

- 현재 디렉토리를 Git 저장소로 초기화한다.

---

## Step 2. .gitignore 생성

루트에 `.gitignore` 파일을 아래 내용으로 생성한다.

```gitignore
# ===== Backend (.NET) =====
backend/bin/
backend/obj/
backend/*.user
backend/.vs/
backend/appsettings.Development.json

# ===== Frontend (Node) =====
frontend/node_modules/
frontend/dist/
frontend/.env
frontend/.env.local

# ===== 민감 파일 =====
claude.md

# ===== OS =====
.DS_Store
Thumbs.db

# ===== Editor =====
.vscode/
.idea/
*.suo
```

---

## Step 3. 백엔드 초기화 (ASP.NET Core 8 Web API)

```bash
dotnet new webapi -n davemins --output backend --framework net8.0 --no-openapi
```

| 옵션 | 설명 |
|------|------|
| `webapi` | Web API 템플릿 |
| `-n davemins` | 프로젝트 이름 (네임스페이스, .csproj 파일명) |
| `--output backend` | 생성 위치를 `backend/` 폴더로 지정 |
| `--framework net8.0` | .NET 8 타겟 |
| `--no-openapi` | Swagger 제외 (불필요한 의존성 제거) |

생성 직후 기본 구조:

```
backend/
  Properties/
    launchSettings.json   ← 포트, 환경변수 설정
  Controllers/            ← (비어 있음, 직접 생성)
  Program.cs              ← 앱 진입점
  appsettings.json        ← 환경설정
  davemins.csproj         ← 프로젝트 파일
```

### 3-1. launchSettings.json 수정

`backend/Properties/launchSettings.json` — HTTP 포트를 5000으로 고정하고 불필요한 프로파일을 제거한다.

```json
{
  "$schema": "http://json.schemastore.org/launchsettings.json",
  "iisSettings": {
    "windowsAuthentication": false,
    "anonymousAuthentication": true,
    "iisExpress": {
      "applicationUrl": "http://localhost:40913",
      "sslPort": 44337
    }
  },
  "profiles": {
    "http": {
      "commandName": "Project",
      "dotnetRunMessages": true,
      "launchBrowser": false,
      "applicationUrl": "http://localhost:5000",
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    },
    "IIS Express": {
      "commandName": "IISExpress",
      "launchBrowser": true,
      "environmentVariables": {
        "ASPNETCORE_ENVIRONMENT": "Development"
      }
    }
  }
}
```

### 3-2. Program.cs 초기화

기본 생성된 WeatherForecast 보일러플레이트를 모두 제거하고  
CORS + Controller 라우팅만 남긴다.

```csharp
var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();
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

- `localhost:5173` → Vite 개발 서버
- `localhost:3000` → 추후 대비

### 3-3. 백엔드 폴더 구조 생성

```bash
mkdir backend/Controllers backend/Services backend/Models backend/DTOs
```

| 폴더 | 역할 |
|------|------|
| `Controllers/` | HTTP 요청/응답 처리 |
| `Services/` | 비즈니스 로직 |
| `Models/` | 도메인 데이터 모델 |
| `DTOs/` | API 응답용 전달 객체 |

Git은 빈 폴더를 추적하지 않으므로 각 폴더에 `.gitkeep` 파일을 생성한다.

```bash
touch backend/Controllers/.gitkeep backend/Services/.gitkeep backend/Models/.gitkeep backend/DTOs/.gitkeep
```

### 3-4. 빌드 확인

```bash
cd backend
dotnet build
```

오류 0개, 경고 0개가 나오면 정상.

---

## Step 4. 프론트엔드 초기화 (React + Vite + TypeScript)

```bash
cd d:/develop/davemins
npm create vite@latest frontend -- --template react-ts
```

| 옵션 | 설명 |
|------|------|
| `vite@latest` | 최신 Vite 스캐폴딩 도구 사용 |
| `frontend` | 생성 폴더명 |
| `--template react-ts` | React + TypeScript 템플릿 |

패키지 설치:

```bash
cd frontend
npm install
```

> **주의**: Node.js 20.17.0 환경에서 Vite 8은 호환되지 않는다 (20.19.0 이상 필요).  
> Vite 7로 다운그레이드한다.

```bash
npm install vite@^7.0.0 @vitejs/plugin-react@^4.0.0
```

### 4-1. vite.config.ts 수정

`/api/*` 요청을 백엔드(5000)로 프록시한다.

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
      },
    },
  },
})
```

### 4-2. App.tsx 초기화

Vite 기본 보일러플레이트를 제거하고 빈 껍데기만 남긴다.

```tsx
function App() {
  return <div>davemins</div>
}

export default App
```

### 4-3. index.css 초기화

기본 스타일을 제거하고 최소한의 리셋만 남긴다.

```css
*, *::before, *::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  font-family: system-ui, -apple-system, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
```

### 4-4. 프론트엔드 폴더 구조 생성

```bash
mkdir frontend/src/pages frontend/src/components frontend/src/hooks \
      frontend/src/services frontend/src/types frontend/src/i18n
touch frontend/src/pages/.gitkeep frontend/src/components/.gitkeep \
      frontend/src/hooks/.gitkeep frontend/src/services/.gitkeep \
      frontend/src/types/.gitkeep frontend/src/i18n/.gitkeep
```

| 폴더 | 역할 |
|------|------|
| `pages/` | 라우트별 최상위 컴포넌트 |
| `components/` | 재사용 가능한 UI 컴포넌트 |
| `hooks/` | 커스텀 Hook (API 호출, 상태 관리) |
| `services/` | API 호출 레이어 |
| `types/` | 공용 TypeScript 타입 정의 |
| `i18n/` | 다국어 번역 데이터 |

### 4-5. 빌드 확인

```bash
npm run build
```

`✓ built in X.XXs` 가 나오면 정상.

---

## Step 5. 원격 저장소 연결 및 최초 Push

```bash
# 원격 저장소 추가
git remote add origin https://github.com/davemins/davemins.git

# 원격에 이미 커밋이 있는 경우 fetch
git fetch origin

# 로컬 파일 스테이징 및 커밋
git add .
git commit -m "chore(init): 프로젝트 초기 구조 설정 (monorepo)"
git commit -m "feat(init): ASP.NET Core 8 백엔드 + React/Vite/TS 프론트엔드 초기 설정"

# 원격에 기존 커밋이 있다면 병합 후 push
git merge origin/main --allow-unrelated-histories -m "chore(init): 기존 README.md 병합"
git push -u origin master:main
```

---

## 최종 폴더 구조

```
davemins/
├── .gitignore
├── logs/
│   └── phase-1.md          ← 이 파일
├── backend/
│   ├── Controllers/
│   ├── DTOs/
│   ├── Models/
│   ├── Services/
│   ├── Properties/
│   │   └── launchSettings.json
│   ├── Program.cs
│   ├── appsettings.json
│   └── davemins.csproj
└── frontend/
    ├── src/
    │   ├── components/
    │   ├── hooks/
    │   ├── i18n/
    │   ├── pages/
    │   ├── services/
    │   ├── types/
    │   ├── App.tsx
    │   ├── index.css
    │   └── main.tsx
    ├── public/
    ├── index.html
    ├── package.json
    ├── tsconfig.json
    └── vite.config.ts
```

---

## 개발 서버 실행

```bash
# 백엔드 (포트 5000)
cd backend
dotnet run

# 프론트엔드 (포트 5173)
cd frontend
npm run dev
```

프론트엔드에서 `/api/*` 요청은 Vite proxy를 통해 자동으로 백엔드(5000)로 전달된다.
