import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app
from app.config import settings

@pytest.mark.asyncio
async def test_chat_unauthorized_token():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/internal/v1/ai/chat",
            json={"message": "Doanh thu hôm nay là bao nhiêu?"},
            headers={"X-Internal-Token": "invalid-token", "X-Store-Id": "1"}
        )
        assert response.status_code == 401

@pytest.mark.asyncio
async def test_chat_missing_store_id():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/internal/v1/ai/chat",
            json={"message": "Doanh thu hôm nay là bao nhiêu?"},
            headers={"X-Internal-Token": settings.internal_auth_token}
        )
        assert response.status_code == 422 # FastAPI missing header validation

@pytest.mark.asyncio
async def test_chat_health_check():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.get("/health")
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "healthy"
        assert "Retail Operations" in body["service"]

@pytest.mark.asyncio
async def test_chat_clarification_flow():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/internal/v1/ai/chat",
            json={"message": "Hôm trước bán được bao nhiêu?"},
            headers={"X-Internal-Token": settings.internal_auth_token, "X-Store-Id": "1"}
        )
        assert response.status_code == 200
        body = response.json()
        assert body["status"] == "needs_clarification"
        assert body["intent"] == "CLARIFICATION_REQUIRED"


@pytest.mark.asyncio
async def test_chat_missing_message_is_rejected():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        response = await ac.post(
            "/internal/v1/ai/chat",
            json={"session_id": "s1"},
            headers={"X-Internal-Token": settings.internal_auth_token, "X-Store-Id": "1"}
        )
        assert response.status_code == 422


@pytest.mark.asyncio
async def test_chat_multi_turn_follow_up_uses_context():
    """Second, context-dependent question in the same session is understood."""
    transport = ASGITransport(app=app)
    session_id = "it-followup-" + __import__("uuid").uuid4().hex
    headers = {"X-Internal-Token": settings.internal_auth_token, "X-Store-Id": "1"}
    async with AsyncClient(transport=transport, base_url="http://test") as ac:
        first = await ac.post(
            "/internal/v1/ai/chat",
            json={"session_id": session_id, "message": "Doanh thu hôm nay là bao nhiêu?"},
            headers=headers,
        )
        assert first.status_code == 200
        assert first.json()["session_id"] == session_id

        follow_up = await ac.post(
            "/internal/v1/ai/chat",
            json={"session_id": session_id, "message": "còn tuần trước thì sao?"},
            headers=headers,
        )
        assert follow_up.status_code == 200
        body = follow_up.json()
        assert body["session_id"] == session_id
        assert body["intent"] == "SALES_SUMMARY"
