import httpx
from typing import Dict, Any, Optional
from app.config import settings
from app.schemas.tool_result import ToolResult, ToolMetadata, ToolError
import logging

logger = logging.getLogger(__name__)

class BusinessApiClient:
    def __init__(self, base_url: Optional[str] = None):
        self.base_url = (base_url or settings.business_api_base_url).rstrip("/")
        self.internal_token = settings.internal_auth_token

    async def execute_tool(self, tool_name: str, arguments: Dict[str, Any], store_id: str) -> ToolResult:
        endpoint_map = {
            "get_sales_summary": "/sales-summary",
            "get_profit_summary": "/profit-summary",
            "get_top_products": "/top-products",
            "get_inventory_status": "/inventory-status",
            "get_slow_moving_products": "/slow-moving-products",
            "get_expense_summary": "/expense-summary",
            "get_restock_suggestions": "/restock-suggestions",
        }

        if tool_name not in endpoint_map:
            return ToolResult(
                success=False,
                data=None,
                metadata=ToolMetadata(store_id=store_id, data_complete=False),
                error=ToolError(code="TOOL_NOT_ALLOWED", message=f"Công cụ '{tool_name}' không nằm trong danh sách cho phép.")
            )

        path = endpoint_map[tool_name]
        url = f"{self.base_url}{path}"
        headers = {
            "Content-Type": "application/json",
            "X-Internal-Token": self.internal_token,
            "X-Store-Id": str(store_id),
        }

        try:
            async with httpx.AsyncClient(timeout=settings.tool_timeout_seconds) as client:
                response = await client.post(url, json=arguments, headers=headers)
                if response.status_code == 200:
                    body = response.json()
                    return ToolResult(
                        success=body.get("success", True),
                        data=body.get("data"),
                        metadata=ToolMetadata(
                            store_id=store_id,
                            generated_at=body.get("metadata", {}).get("generated_at"),
                            data_complete=body.get("metadata", {}).get("data_complete", True)
                        ),
                        error=None
                    )
                else:
                    logger.error(f"Business API error {response.status_code} for {tool_name}: {response.text}")
                    return ToolResult(
                        success=False,
                        data=None,
                        metadata=ToolMetadata(store_id=store_id, data_complete=False),
                        error=ToolError(
                            code="BUSINESS_API_ERROR",
                            message=f"Hệ thống nghiệp vụ phản hồi mã lỗi {response.status_code}."
                        )
                    )
        except httpx.TimeoutException:
            logger.error(f"Timeout connecting to Business API for {tool_name}")
            return ToolResult(
                success=False,
                data=None,
                metadata=ToolMetadata(store_id=store_id, data_complete=False),
                error=ToolError(code="BUSINESS_API_TIMEOUT", message="Hết thời gian chờ phản hồi từ hệ thống nghiệp vụ.")
            )
        except Exception as e:
            logger.error(f"Exception connecting to Business API for {tool_name}: {e}")
            return ToolResult(
                success=False,
                data=None,
                metadata=ToolMetadata(store_id=store_id, data_complete=False),
                error=ToolError(code="BUSINESS_DATA_UNAVAILABLE", message="Không thể kết nối đến máy chủ nghiệp vụ.")
            )
