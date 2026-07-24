# CIS Security Assistant

A full-stack Retrieval-Augmented Generation (RAG) assistant for CIS Critical Security Controls v8. It gives security teams grounded answers with source citations, persistent conversations, response versions, and a feedback loop for continuous improvement.

## What it delivers

- Source-backed answers over the CIS Controls knowledge base
- Token-by-token streaming responses with Markdown rendering
- Clickable citations, source snippets, and response metadata
- Saved conversations, thread switching, rename, delete, and resume
- Regenerate answers in the same response slot and switch between versions
- Thumbs up/down feedback with reasons and optional comments
- Guided first-use tour and an analytics view
- Security middleware foundation: Google sign-in, short-lived JWTs, rotating refresh tokens, audit logs, rate limits, and user isolation

## Architecture

```text
Browser (React / Vite :5173)
          |
          | Google sign-in, access JWT in memory
          v
.NET Middleware (:7184)
  - Identity, PostgreSQL, refresh-token rotation, audit logs
  - rate limits, correlation IDs, secure RAG proxy
          |
          | X-RAG-API-Key + trusted X-User-Id
          v
FastAPI RAG (:8000, private)
  - retrieval, reranking, streaming, conversation ownership
     |                 |                 |
     v                 v                 v
 MongoDB           Weaviate           Ollama
 chats/feedback    CIS retrieval      answer generation
```

### Why this split?

The existing RAG components stay in Python, where the retrieval and local-model ecosystem already lives. The .NET service is the public security boundary: it owns browser authentication, PostgreSQL-backed identity, refresh tokens, audit logging, rate limiting, and the private credential used to call FastAPI. This avoids rewriting working RAG code while making user identity and access control explicit.

## Technology stack

| Layer | Technology |
| --- | --- |
| Frontend | React 19, Vite, React Markdown, Lucide, Recharts |
| Public API/security | .NET 10, ASP.NET Core Identity, JWT bearer auth, Google OAuth, Scalar/OpenAPI |
| RAG API | FastAPI, Motor, Pydantic Settings |
| Retrieval | Weaviate, BAAI `bge-small-en-v1.5`, BAAI cross-encoder reranker |
| Generation | Ollama with `qwen2.5:7b` |
| Data | MongoDB for RAG data; PostgreSQL for users, sessions, and audit logs |
| Local infrastructure | Docker Compose, PostgreSQL 17, Weaviate |

## Repository layout

```text
.
├── frontend/                 React chat application
├── backend/                  FastAPI RAG API and MongoDB routes
├── middleware/               .NET 10 public middleware solution
│   ├── src/                  API, Application, Domain, Infrastructure
│   ├── tests/                unit and integration test projects
│   └── docker-compose.yml    PostgreSQL development service
├── src/rag_pipeline/         parsing, embedding, retrieval, reranking, generation
├── evaluation/               DeepEval and human-in-the-loop evaluation scripts
├── output/                   generated parsed/chunked document artefacts
├── deliverables/             presentation deck and final handoff material
└── tools/                    local project utilities
```

## Prerequisites

- Windows 10/11, macOS, or Linux
- Python 3.12+
- Node.js 22+
- .NET SDK 10.0.302+
- Docker Desktop
- MongoDB (local service or Atlas)
- Ollama with the configured model available
- A Weaviate instance containing the CIS Controls collection
- A Google Cloud OAuth web client for authenticated browser use

## Quick start

These steps use PowerShell from the repository root. Paths containing spaces must be wrapped in quotes when changing directories.

### 1. Install application dependencies

```powershell
# Python/RAG dependencies
uv sync

# Frontend dependencies
Set-Location frontend
npm install
Set-Location ..
```

### 2. Configure FastAPI and MongoDB

Create `backend/.env`. This file is ignored by Git.

```env
MONGO_URL=mongodb://localhost:27017
DATABASE_NAME=cis_rag
RAG_INTERNAL_API_KEY=replace-with-the-same-value-as-RagApi:ApiKey
```

Use your Atlas connection string instead of the local `MONGO_URL` when applicable. Start MongoDB before FastAPI. On Windows with the MongoDB service installed:

```powershell
sc start MongoDB
```

### 3. Start PostgreSQL for the middleware

Copy `middleware/.env.example` to `middleware/.env`, choose a local development password, then run:

```powershell
docker compose -f middleware/docker-compose.yml up -d postgres
docker compose -f middleware/docker-compose.yml ps
```

The PostgreSQL container should show `healthy` on port `5432`.

### 4. Configure .NET User Secrets

Never put these secrets in `appsettings.json` or Git. Set them in the `RagMiddleware.Api` project instead.

```powershell
$api = "middleware/src/RagMiddleware.Api"
dotnet user-secrets init --project $api

dotnet user-secrets set "ConnectionStrings:MiddlewareDb" "Host=localhost;Port=5432;Database=rag_middleware;Username=rag_app;Password=YOUR_POSTGRES_PASSWORD" --project $api
dotnet user-secrets set "Jwt:Issuer" "RagMiddleware" --project $api
dotnet user-secrets set "Jwt:Audience" "RagFrontend" --project $api
dotnet user-secrets set "Jwt:SigningKey" "USE_A_RANDOM_64_PLUS_CHARACTER_SECRET" --project $api
dotnet user-secrets set "RagApi:ApiKey" "USE_A_SEPARATE_RANDOM_INTERNAL_KEY" --project $api
dotnet user-secrets set "Authorization:AdminEmails:0" "YOUR_GOOGLE_EMAIL" --project $api
```

Set the exact same internal key as `RAG_INTERNAL_API_KEY` in `backend/.env`.

### 5. Create the PostgreSQL schema

Set the connection string for the EF design-time factory, then apply the committed migration:

```powershell
$env:ConnectionStrings__MiddlewareDb = "Host=localhost;Port=5432;Database=rag_middleware;Username=rag_app;Password=YOUR_POSTGRES_PASSWORD"

dotnet-ef database update `
  --project middleware/src/RagMiddleware.Infrastructure `
  --startup-project middleware/src/RagMiddleware.Api
```

### 6. Configure Google OAuth

In Google Cloud Console, create a **Web application** OAuth client. Use these values exactly:

| Setting | Value |
| --- | --- |
| Authorized JavaScript origin | `http://localhost:5173` |
| Authorized redirect URI | `https://localhost:7184/signin-google` |

Add your account as a test user on the OAuth audience page. Store the client details in User Secrets:

```powershell
dotnet user-secrets set "Google:ClientId" "YOUR_CLIENT_ID" --project $api
dotnet user-secrets set "Google:ClientSecret" "YOUR_CLIENT_SECRET" --project $api
```

The redirect URI must match exactly, including its protocol, port, and path.

### 7. Start local services

Start these services in separate terminals and keep them running.

```powershell
# Terminal A: FastAPI (run from backend/)
Set-Location backend
python -m uvicorn app.main:app --host 127.0.0.1 --port 8000
```

```powershell
# Terminal B: .NET public middleware
dotnet dev-certs https --trust
dotnet run --launch-profile https --project middleware/src/RagMiddleware.Api
```

```powershell
# Terminal C: React
Set-Location frontend
npm run dev
```

Open `http://localhost:5173`, sign in with Google, and ask a CIS Controls question.

## Local health checks

| URL | Expected result |
| --- | --- |
| `http://127.0.0.1:8000/health` | FastAPI liveness JSON |
| `https://localhost:7184/health` | .NET liveness JSON |
| `https://localhost:7184/health/ready` | PostgreSQL readiness JSON |
| `https://localhost:7184/scalar` | Development API reference |
| `http://localhost:5173` | React sign-in screen/chat workspace |

FastAPI is intentionally not browser-facing. A direct request to `/conversations` without the internal headers should return `401 Unauthorized`.

## Authentication and data ownership

1. The user begins Google sign-in through .NET.
2. .NET creates or updates the ASP.NET Identity user and assigns `User`; configured allowlist emails also receive `Admin`.
3. .NET sets a rotating Secure, HttpOnly refresh-token cookie and returns short-lived access JWTs only to React memory.
4. React sends the access token to .NET; it never stores either token in local or session storage.
5. .NET forwards only trusted `X-User-Id`, `X-RAG-API-Key`, and correlation headers to FastAPI.
6. FastAPI filters every new conversation, message, response version, and feedback record by `user_id`.

Legacy MongoDB documents without `user_id` remain untouched but invisible to authenticated users.

## API surface

All browser-facing endpoints live under `https://localhost:7184/api/v1`.

| Area | Examples |
| --- | --- |
| Authentication | `GET /auth/google/login`, `POST /auth/refresh`, `GET /auth/me`, `POST /auth/logout` |
| Chat | `POST /chat`, `POST /chat/stream`, `POST /chat/regenerate/stream` |
| Conversations | `GET /conversations`, `GET /conversations/{id}/messages`, `PATCH` and `DELETE /conversations/{id}` |
| Feedback | `GET/POST /feedback`, `GET /feedback/stats`, `DELETE /feedback/{messageId}` |
| Administration | `GET /admin/audit-logs` (Admin role only) |

Streaming retains the existing Server-Sent Event format: `token`, `sources`, `done`, `error`, and `[DONE]`.

## RAG pipeline

The offline pipeline in `src/rag_pipeline/` processes the CIS source document into retrievable chunks:

```text
PDF → parsing → cleaning → structure restoration → chunking
    → embeddings → Weaviate → hybrid retrieval → reranking → Ollama
```

Configured models:

- Embeddings: `BAAI/bge-small-en-v1.5`
- Reranker: `BAAI/bge-reranker-base`
- Generator: `qwen2.5:7b` through Ollama

Run ingestion only after Weaviate is available and the source document is configured:

```powershell
python main.py
```

## Testing and quality checks

```powershell
# Python syntax check for the API modules
python -m py_compile backend/app/main.py backend/app/security.py

# Frontend
Set-Location frontend
npm run lint
npm test
npm run format:check
npm run build
Set-Location ..

# .NET
dotnet restore middleware/RagMiddleware.slnx --locked-mode
dotnet build middleware/RagMiddleware.slnx --no-restore
dotnet test middleware/RagMiddleware.slnx --no-build
dotnet list middleware/RagMiddleware.slnx package --vulnerable --include-transitive
```

## Troubleshooting

| Symptom | Resolution |
| --- | --- |
| `password authentication failed for user rag_app` | Make `middleware/.env`, User Secrets, and the PostgreSQL container password match; recreate the unused local middleware volume only if necessary. |
| FastAPI says `app is not a package` | Run `python -m uvicorn app.main:app` from `backend/`, not repository root, because root contains `app.py`. |
| Port `8000` is in use | Find the local listener with `Get-NetTCPConnection -LocalPort 8000 -State Listen`, stop only that stale FastAPI process, then restart it. |
| Google `redirect_uri_mismatch` | Verify the exact `https://localhost:7184/signin-google` URI in Google Cloud Console. |
| Browser cannot call FastAPI directly | Expected: only .NET may call FastAPI with the internal key and trusted user ID. |
| HTTPS development warning | Run `dotnet dev-certs https --trust`, restart the middleware, and reload the browser. |

## Operational guidance

- Keep FastAPI on `127.0.0.1:8000` locally and on a private network in production.
- Store production secrets in environment variables or Azure Key Vault, not User Secrets.
- Rotate the Google client secret and FastAPI internal API key if they are exposed.
- Back up PostgreSQL and review EF migrations before deployment.
- Start with a 90-day audit-log retention policy and review it with security/compliance stakeholders.
- Never commit `.env` files, OAuth client secrets, JWT keys, or database credentials.

## Deliverables

- [Three-slide demo deck](deliverables/CIS_RAG_Assistant_Demo_Deck.pptx)
- `.NET middleware` solution under `middleware/`
- React frontend under `frontend/`
- FastAPI RAG API under `backend/`
- Evaluation scripts under `evaluation/`

## Demo flow

1. Sign in with Google.
2. Start a new chat using a suggested CIS Controls prompt.
3. Show a streaming answer and open a citation/source snippet.
4. Regenerate the response and switch its version.
5. Submit thumbs-down feedback with a reason.
6. Refresh the page and resume the saved conversation.
7. Explain why the .NET boundary protects FastAPI and keeps user data isolated.
