# RAG Middleware

The .NET middleware is the public API for the React application. It owns browser authentication, PostgreSQL-backed Identity, refresh-token rotation, audit logging, and the authenticated proxy to the private FastAPI RAG service.

## Local prerequisites

- .NET SDK 10.0.302 or later feature band
- Docker Desktop
- PostgreSQL started with `docker compose -f middleware/docker-compose.yml up -d postgres`

Copy `.env.example` to `.env` and set a local PostgreSQL password. Put application secrets in .NET User Secrets; never commit them. See the root README runbook once the authentication and proxy phases are complete.

## Required User Secrets

Run from `middleware/src/RagMiddleware.Api` and replace every placeholder locally:

```powershell
dotnet user-secrets init
dotnet user-secrets set "ConnectionStrings:MiddlewareDb" "Host=localhost;Port=5432;Database=rag_middleware;Username=rag_app;Password=YOUR_PASSWORD"
dotnet user-secrets set "Google:ClientId" "YOUR_CLIENT_ID"
dotnet user-secrets set "Google:ClientSecret" "YOUR_CLIENT_SECRET"
dotnet user-secrets set "Jwt:SigningKey" "A_64_OR_MORE_CHARACTER_RANDOM_SECRET"
dotnet user-secrets set "Jwt:Issuer" "RagMiddleware"
dotnet user-secrets set "Jwt:Audience" "RagFrontend"
dotnet user-secrets set "RagApi:ApiKey" "A_SEPARATE_RANDOM_INTERNAL_KEY"
dotnet user-secrets set "Authorization:AdminEmails:0" "you@example.com"
```

Set the same internal key in the Python backend `.env` as `RAG_INTERNAL_API_KEY`. FastAPI must run on `127.0.0.1:8000`; it is not a browser-facing API anymore. Register `https://localhost:7184/signin-google` as the Google OAuth redirect URI and `http://localhost:5173` as its JavaScript origin.

## Run and operate

1. Start PostgreSQL: `docker compose -f middleware/docker-compose.yml up -d postgres`.
2. Apply the migration after setting secrets: `dotnet-ef database update --project middleware/src/RagMiddleware.Infrastructure --startup-project middleware/src/RagMiddleware.Api`.
3. Start FastAPI privately on `127.0.0.1:8000`, then start the .NET API in Visual Studio or with `dotnet run --project middleware/src/RagMiddleware.Api`.
4. Set `VITE_API_URL=https://localhost:7184/api/v1` and run the React app.

Access tokens remain only in React memory; refresh tokens are rotating, hashed in PostgreSQL, and sent only in a Secure, HttpOnly cookie. For production use environment variables or Azure Key Vault, private networking between .NET and FastAPI, HTTPS, PostgreSQL backups, migration review, and a 90-day initial audit-log retention policy. If a Google secret or RAG key is compromised, revoke/rotate it in Google or Key Vault and restart both affected services.
