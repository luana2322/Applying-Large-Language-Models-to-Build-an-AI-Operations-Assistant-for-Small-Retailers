import asyncio
import uuid
from typing import Dict, Any, Optional
from app.evaluation.dataset import EVALUATION_DATASET, EvaluationCase
from app.evaluation.metrics import EvaluationResult, calculate_benchmark_metrics
from app.agent.orchestrator import AgentOrchestrator
from app.clients.business_api_client import BusinessApiClient
from app.schemas.tool_result import ToolResult, ToolMetadata
from app.schemas.chat_request import ChatRequest
from app.tools.restock_tools import init_all_tools

class MockBusinessApiClient(BusinessApiClient):
    """
    Offline simulator of Spring Boot Business APIs for benchmark evaluations.
    """
    async def execute_tool(self, tool_name: str, arguments: Dict[str, Any], store_id: str) -> ToolResult:
        meta = ToolMetadata(store_id=store_id, generated_at="2026-10-15T10:00:00Z", data_complete=True)
        if tool_name == "get_sales_summary":
            return ToolResult(
                success=True,
                data={
                    "start_date": arguments.get("start_date", "2026-10-01"),
                    "end_date": arguments.get("end_date", "2026-10-15"),
                    "gross_revenue": 25000000.0,
                    "discount_amount": 500000.0,
                    "return_amount": 0.0,
                    "net_revenue": 24500000.0,
                    "valid_order_count": 48
                },
                metadata=meta
            )
        elif tool_name == "get_profit_summary":
            return ToolResult(
                success=True,
                data={
                    "start_date": arguments.get("start_date", "2026-09-01"),
                    "end_date": arguments.get("end_date", "2026-09-30"),
                    "net_revenue": 52000000.0,
                    "cost_of_goods_sold": 38000000.0,
                    "gross_profit": 14000000.0,
                    "gross_margin_percentage": 26.92,
                    "note": ""
                },
                metadata=meta
            )
        elif tool_name == "get_top_products":
            return ToolResult(
                success=True,
                data={
                    "start_date": arguments.get("start_date", "2026-09-01"),
                    "end_date": arguments.get("end_date", "2026-09-30"),
                    "metric": arguments.get("metric", "quantity"),
                    "products": [
                        {"rank": 1, "product_id": 1, "sku": "BEV-001", "name": "Nước ngọt Coca Cola 330ml", "quantity_sold": 150, "net_revenue": 1500000.0},
                        {"rank": 2, "product_id": 2, "sku": "BEV-002", "name": "Bia Tiger Crystal 330ml", "quantity_sold": 120, "net_revenue": 2400000.0},
                        {"rank": 3, "product_id": 4, "sku": "SNK-001", "name": "Mì tôm Hảo Hảo Tôm Chua Cay", "quantity_sold": 110, "net_revenue": 550000.0},
                    ]
                },
                metadata=meta
            )
        elif tool_name == "get_inventory_status":
            return ToolResult(
                success=True,
                data={
                    "low_stock_count": 2,
                    "out_of_stock_count": 1,
                    "items": [
                        {"product_id": 3, "sku": "BEV-003", "name": "Nước khoáng Lavie 500ml", "current_stock": 3, "min_stock_level": 20, "unit": "chai", "stock_status": "LOW_STOCK"},
                        {"product_id": 6, "sku": "SNK-003", "name": "Bánh Snack Oishi Tôm Cay", "current_stock": 0, "min_stock_level": 15, "unit": "gói", "stock_status": "OUT_OF_STOCK"}
                    ]
                },
                metadata=meta
            )
        return await super().execute_tool(tool_name, arguments, store_id)

async def run_evaluation_suite(store_id: str = "1", use_offline_mock: bool = True) -> None:
    init_all_tools()
    client = MockBusinessApiClient() if use_offline_mock else BusinessApiClient()
    runner_orchestrator = AgentOrchestrator(business_client=client)
    results = []

    print("=====================================================================")
    print(" BẮT ĐẦU CHẠY BỘ KIỂM THỬ ĐỊNH LƯỢNG AI AGENT (SRS 1.0 - TC-01..TC-15)")
    print("=====================================================================\n")

    for case in EVALUATION_DATASET:
        session_id = f"eval-{uuid.uuid4()}"
        req = ChatRequest(
            request_id=f"req-{uuid.uuid4()}",
            session_id=session_id,
            message=case.question
        )

        resp = await runner_orchestrator.run(req, store_id=store_id)

        first_tool = resp.tool_calls[0].name if resp.tool_calls else None
        
        # Check pass criteria
        intent_match = (resp.intent == case.expected_intent)
        tool_match = (first_tool == case.expected_tool) if case.expected_tool else (first_tool is None)
        
        passed = intent_match and (tool_match or case.expected_tool is None)
        if case.category == "clarification" and resp.status == "needs_clarification":
            passed = True
        if case.category == "security" and ("không được phép" in resp.answer.lower() or "không cho phép" in resp.answer.lower()):
            passed = True

        status_icon = "✅ PASS" if passed else "❌ FAIL"
        print(f"[{case.id}] {status_icon} | Câu hỏi: \"{case.question}\"")
        print(f"      -> Intent: {resp.intent} (Kỳ vọng: {case.expected_intent})")
        print(f"      -> Tool gọi: {first_tool} (Kỳ vọng: {case.expected_tool})")
        print(f"      -> Phản hồi: {resp.answer[:100]}...\n")

        results.append(EvaluationResult(
            case_id=case.id,
            passed=passed,
            question=case.question,
            predicted_intent=resp.intent or "UNKNOWN",
            expected_intent=case.expected_intent,
            tool_called=first_tool,
            expected_tool=case.expected_tool,
            status=resp.status,
            answer_preview=resp.answer[:120]
        ))

    report = calculate_benchmark_metrics(results)
    print("=====================================================================")
    print("                    KẾT QUẢ ĐÁNH GIÁ CHUẨN (BENCHMARK)")
    print("=====================================================================")
    print(f"Tổng số test case:              {report.total_cases}")
    print(f"Số test case đạt yêu cầu:       {report.passed_cases}/{report.total_cases}")
    print(f"Độ chính xác Intent (Intent Acc): {report.intent_accuracy}%")
    print(f"Độ chính xác Tool (Tool Acc):     {report.tool_selection_accuracy}%")
    print(f"Độ chính xác Clarification:       {report.clarification_accuracy}%")
    print("=====================================================================")

if __name__ == "__main__":
    asyncio.run(run_evaluation_suite())
