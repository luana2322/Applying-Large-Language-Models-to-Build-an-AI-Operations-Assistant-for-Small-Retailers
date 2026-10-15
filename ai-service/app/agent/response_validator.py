from typing import Optional, Dict, Any, List
from app.schemas.chat_response import ChatResponse, ToolCallRecord, ChatError

class ResponseValidator:
    def validate_and_normalize(
        self,
        request_id: str,
        session_id: str,
        raw_text: str,
        tool_records: List[ToolCallRecord],
        last_tool_data: Optional[Dict[str, Any]] = None,
        intent: Optional[str] = None
    ) -> ChatResponse:
        text = raw_text.strip() if raw_text else ""

        # Determine status
        status = "completed"
        if "?" in text and any(phrase in text.lower() for phrase in ["bạn muốn", "vui lòng làm rõ", "ngày nào", "khoảng thời gian"]):
            status = "needs_clarification"

        # Check for errors in tool records
        has_error = any(tr.status == "error" for tr in tool_records)
        has_success = any(tr.status == "success" for tr in tool_records)
        if has_error:
            if not text:
                status = "failed"
                text = "Đã xảy ra sự cố khi truy vấn số liệu nghiệp vụ. Vui lòng thử lại sau."
            elif status != "needs_clarification":
                # Controlled partial result: some grounded data is available,
                # but at least one tool call failed.
                status = "partial" if has_success else "failed"

        # Map intent if not provided
        if not intent:
            if any(tr.name == "get_sales_summary" for tr in tool_records):
                intent = "SALES_SUMMARY"
            elif any(tr.name == "get_profit_summary" for tr in tool_records):
                intent = "PROFIT_SUMMARY"
            elif any(tr.name == "get_top_products" for tr in tool_records):
                intent = "TOP_PRODUCTS"
            elif any(tr.name == "get_inventory_status" for tr in tool_records):
                intent = "INVENTORY_STATUS"
            elif any(tr.name == "get_slow_moving_products" for tr in tool_records):
                intent = "SLOW_MOVING_PRODUCTS"
            elif any(tr.name == "get_expense_summary" for tr in tool_records):
                intent = "EXPENSE_SUMMARY"
            elif any(tr.name == "get_restock_suggestions" for tr in tool_records):
                intent = "RESTOCK_SUGGESTION"
            elif status == "needs_clarification":
                intent = "CLARIFICATION_REQUIRED"
            else:
                intent = "GENERAL_HELP"

        return ChatResponse(
            request_id=request_id,
            session_id=session_id,
            status=status,
            answer=text,
            intent=intent,
            data=last_tool_data,
            tool_calls=tool_records,
            error=None
        )

response_validator = ResponseValidator()
