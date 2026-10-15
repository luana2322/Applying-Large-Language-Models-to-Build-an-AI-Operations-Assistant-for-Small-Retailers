import uuid

import pytest

from app.agent.orchestrator import AgentOrchestrator
from app.config import settings
from app.llm.provider_adapter import BaseLLMAdapter, LLMResponse, LLMToolCall
from app.schemas.chat_request import ChatRequest
from app.schemas.tool_result import ToolError, ToolMetadata, ToolResult
from app.tools.registry import registry
from app.tools.restock_tools import init_all_tools


@pytest.fixture(autouse=True)
def setup_tools():
    init_all_tools()


class FakeBusinessClient:
    def __init__(self, result):
        self.result = result
        self.calls = []

    async def execute_tool(self, tool_name, arguments, store_id):
        self.calls.append({"name": tool_name, "arguments": arguments, "store_id": store_id})
        return self.result


def _success_result():
    return ToolResult(
        success=True,
        data={"net_revenue": 123456.0, "valid_order_count": 7, "start_date": "2026-10-01", "end_date": "2026-10-15"},
        metadata=ToolMetadata(store_id="1", data_complete=True),
    )


def _failure_result():
    return ToolResult(
        success=False,
        data=None,
        metadata=ToolMetadata(store_id="1", data_complete=False),
        error=ToolError(code="BUSINESS_API_ERROR", message="Hệ thống nghiệp vụ gặp sự cố."),
    )


def _req(message="Doanh thu hôm nay là bao nhiêu?"):
    return ChatRequest(message=message, session_id=str(uuid.uuid4()))


@pytest.mark.asyncio
async def test_orchestrator_grounded_success_flow():
    client = FakeBusinessClient(_success_result())
    orch = AgentOrchestrator(business_client=client)

    resp = await orch.run(_req(), "1")

    assert resp.status == "completed"
    assert resp.intent == "SALES_SUMMARY"
    assert resp.tool_calls[0].name == "get_sales_summary"
    assert resp.tool_calls[0].status == "success"
    assert resp.tool_calls[0].result is not None
    assert client.calls[0]["store_id"] == "1"
    # Number is grounded in the tool payload (not hallucinated)
    assert "123,456" in resp.answer


@pytest.mark.asyncio
async def test_orchestrator_surfaces_tool_failure_honestly():
    client = FakeBusinessClient(_failure_result())
    orch = AgentOrchestrator(business_client=client)

    resp = await orch.run(_req(), "1")

    assert resp.status == "failed"
    assert resp.tool_calls[0].status == "error"
    assert "sự cố" in resp.answer.lower() or "sự cố" in resp.answer


@pytest.mark.asyncio
async def test_orchestrator_rejects_unregistered_tool():
    class BadToolAdapter(BaseLLMAdapter):
        async def generate(self, system_instruction, history, message, tool_declarations):
            return LLMResponse(
                is_tool_call=True,
                tool_calls=[LLMToolCall(name="run_sql", arguments={"q": "DROP TABLE orders"})],
            )

    orch = AgentOrchestrator(business_client=FakeBusinessClient(_success_result()))
    orch.llm_adapter = BadToolAdapter()

    resp = await orch.run(_req(), "1")

    rejected = [tr for tr in resp.tool_calls if tr.status == "rejected"]
    assert rejected, "Unregistered tool calls must be rejected"
    assert rejected[0].name == "run_sql"


@pytest.mark.asyncio
async def test_orchestrator_enforces_max_tool_calls_guardrail(monkeypatch):
    class TwoToolsAdapter(BaseLLMAdapter):
        async def generate(self, system_instruction, history, message, tool_declarations):
            return LLMResponse(
                is_tool_call=True,
                tool_calls=[
                    LLMToolCall(name="get_sales_summary", arguments={"start_date": "2026-10-01", "end_date": "2026-10-15"}),
                    LLMToolCall(name="get_top_products", arguments={"start_date": "2026-10-01", "end_date": "2026-10-15"}),
                ],
            )

    monkeypatch.setattr(settings, "max_tool_calls_per_req", 1)
    orch = AgentOrchestrator(business_client=FakeBusinessClient(_success_result()))
    orch.llm_adapter = TwoToolsAdapter()

    resp = await orch.run(_req(), "1")

    assert "giới hạn" in resp.answer


@pytest.mark.asyncio
async def test_orchestrator_detects_duplicate_tool_loop():
    class LoopingAdapter(BaseLLMAdapter):
        async def generate(self, system_instruction, history, message, tool_declarations):
            return LLMResponse(
                is_tool_call=True,
                tool_calls=[LLMToolCall(name="get_sales_summary", arguments={"start_date": "2026-10-01", "end_date": "2026-10-15"})],
            )

    orch = AgentOrchestrator(business_client=FakeBusinessClient(_success_result()))
    orch.llm_adapter = LoopingAdapter()

    resp = await orch.run(_req(), "1")

    assert any(tr.status == "rejected" and "vòng lặp" in (tr.error or "") for tr in resp.tool_calls)


@pytest.mark.asyncio
async def test_orchestrator_handles_llm_provider_error():
    class ExplodingAdapter(BaseLLMAdapter):
        async def generate(self, system_instruction, history, message, tool_declarations):
            raise RuntimeError("provider down")

    orch = AgentOrchestrator(business_client=FakeBusinessClient(_success_result()))
    orch.llm_adapter = ExplodingAdapter()

    resp = await orch.run(_req(), "1")

    assert resp.status == "failed"
    assert resp.error is not None
    assert resp.error.code == "LLM_PROVIDER_ERROR"


def test_cap_result_passes_small_payloads_through():
    orch = AgentOrchestrator(business_client=FakeBusinessClient(_success_result()))
    small = {"a": 1, "b": "ok"}
    assert orch._cap_result(small, 1000) == small


def test_cap_result_truncates_large_payloads():
    orch = AgentOrchestrator(business_client=FakeBusinessClient(_success_result()))
    big = {"blob": "x" * 5000}
    capped = orch._cap_result(big, 100)
    assert capped["_truncated"] is True
    assert capped["_original_chars"] > 100
    assert len(capped["preview"]) == 100


def test_fingerprint_is_stable_regardless_of_key_order():
    orch = AgentOrchestrator(business_client=FakeBusinessClient(_success_result()))
    fp1 = orch._compute_fingerprint("get_sales_summary", {"a": 1, "b": 2})
    fp2 = orch._compute_fingerprint("get_sales_summary", {"b": 2, "a": 1})
    assert fp1 == fp2
