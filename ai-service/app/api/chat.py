from fastapi import APIRouter, Depends
from app.schemas.chat_request import ChatRequest
from app.schemas.chat_response import ChatResponse
from app.security.internal_auth import verify_internal_auth
from app.agent.orchestrator import orchestrator

router = APIRouter(prefix="/internal/v1/ai", tags=["AI Chat"])

@router.post("/chat", response_model=ChatResponse)
async def chat_endpoint(
    request: ChatRequest,
    store_id: str = Depends(verify_internal_auth)
) -> ChatResponse:
    return await orchestrator.run(request, store_id=store_id)
