# RAG Middleware

The .NET middleware is the public API for the React application. It owns browser authentication, PostgreSQL-backed Identity, refresh-token rotation, audit logging, and the authenticated proxy to the private FastAPI RAG service.

## Local prerequisites

- .NET SDK 10.0.302 or later feature band
- Docker Desktop
- PostgreSQL started with `docker compose -f middleware/docker-compose.yml up -d postgres`

Copy `.env.example` to `.env` and set a local PostgreSQL password. Put application secrets in .NET User Secrets; never commit them. See the root README runbook once the authentication and proxy phases are complete.
