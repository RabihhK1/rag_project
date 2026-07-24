import secrets
from dataclasses import dataclass
from uuid import UUID

from fastapi import Header, HTTPException, Request, status

from app.config import settings


@dataclass(frozen=True)
class TrustedRequestContext:
    user_id: str


async def require_internal_request(
    request: Request,
    x_rag_api_key: str | None = Header(default=None),
    x_user_id: str | None = Header(default=None),
) -> TrustedRequestContext:
    if not x_rag_api_key or not secrets.compare_digest(x_rag_api_key, settings.RAG_INTERNAL_API_KEY):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized")

    try:
        user_id = str(UUID(x_user_id or ""))
    except ValueError as error:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Unauthorized") from error

    context = TrustedRequestContext(user_id=user_id)
    request.state.rag_context = context
    return context
