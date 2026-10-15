from fastapi import Header, HTTPException, status
from app.config import settings

async def verify_internal_auth(
    x_internal_token: str = Header(..., alias="X-Internal-Token"),
    x_store_id: str = Header(..., alias="X-Store-Id")
) -> str:
    if x_internal_token != settings.internal_auth_token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="UNAUTHORIZED: Invalid internal service token"
        )
    if not x_store_id or not x_store_id.strip():
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="BAD_REQUEST: Missing X-Store-Id header"
        )
    return x_store_id.strip()
