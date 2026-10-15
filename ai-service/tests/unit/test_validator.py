import pytest
from app.agent.response_validator import response_validator
from app.schemas.chat_response import ToolCallRecord

def test_clarification_detection():
    resp = response_validator.validate_and_normalize(
        request_id="test-1",
        session_id="session-1",
        raw_text="Bạn muốn xem doanh thu ngày hôm qua hay ngày gần nhất có phát sinh giao dịch?",
        tool_records=[]
    )
    assert resp.status == "needs_clarification"
    assert resp.intent == "CLARIFICATION_REQUIRED"

def test_successful_sales_normalization():
    resp = response_validator.validate_and_normalize(
        request_id="test-2",
        session_id="session-2",
        raw_text="Doanh thu thuần là 15,000,000 VND.",
        tool_records=[ToolCallRecord(name="get_sales_summary", status="success")]
    )
    assert resp.status == "completed"
    assert resp.intent == "SALES_SUMMARY"
