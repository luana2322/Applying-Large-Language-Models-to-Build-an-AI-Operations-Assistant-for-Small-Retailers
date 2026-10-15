import json
import hashlib
from typing import List, Dict, Any, Optional
from app.config import settings
from app.agent.prompt_builder import prompt_builder
from app.agent.context_manager import context_manager
from app.agent.response_validator import response_validator
from app.tools.registry import registry
from app.clients.business_api_client import BusinessApiClient
from app.llm.client import get_llm_adapter
from app.schemas.chat_request import ChatRequest
from app.schemas.chat_response import ChatResponse, ToolCallRecord, ChatError
import logging

logger = logging.getLogger(__name__)

class AgentOrchestrator:
    def __init__(self, business_client: Optional[BusinessApiClient] = None):
        self.business_client = business_client or BusinessApiClient()
        self.llm_adapter = get_llm_adapter()

    def _compute_fingerprint(self, name: str, args: Dict[str, Any]) -> str:
        serialized = f"{name}:{json.dumps(args, sort_keys=True)}"
        return hashlib.sha256(serialized.encode("utf-8")).hexdigest()

    @staticmethod
    def _cap_result(value: Any, max_chars: int) -> Any:
        """Bound the size of a tool result retained for audit/persistence."""
        if value is None:
            return None
        try:
            serialized = json.dumps(value, ensure_ascii=False, default=str)
        except Exception:
            return None
        if len(serialized) <= max_chars:
            return value
        return {
            "_truncated": True,
            "_original_chars": len(serialized),
            "preview": serialized[:max_chars],
        }

    async def run(self, request: ChatRequest, store_id: str) -> ChatResponse:
        session = context_manager.get_or_create_session(request.session_id, store_id)
        system_instruction = prompt_builder.build_system_instruction(
            timezone=request.context.timezone if request.context else "Asia/Ho_Chi_Minh"
        )

        tool_records: List[ToolCallRecord] = []
        executed_fingerprints = set()
        last_tool_data: Optional[Dict[str, Any]] = None

        tool_declarations = registry.to_gemini_declarations()
        
        # Add user message to history
        context_manager.add_message(request.session_id, "user", request.message)

        current_message = request.message
        turn_count = 0
        total_tool_calls = 0

        while turn_count < settings.max_turns_per_req:
            turn_count += 1
            history = context_manager.get_history(request.session_id)

            try:
                llm_response = await self.llm_adapter.generate(
                    system_instruction=system_instruction,
                    history=history,
                    message=current_message,
                    tool_declarations=tool_declarations
                )
            except Exception as e:
                logger.error(f"LLM Generation failure: {e}")
                return ChatResponse(
                    request_id=request.request_id,
                    session_id=request.session_id,
                    status="failed",
                    answer="Đã xảy ra lỗi khi giao tiếp với mô hình AI. Vui lòng thử lại sau.",
                    error=ChatError(code="LLM_PROVIDER_ERROR", message=str(e))
                )

            # If model produced a final text answer without tool call
            if not llm_response.is_tool_call or not llm_response.tool_calls:
                final_answer = llm_response.text or ""
                context_manager.add_message(request.session_id, "assistant", final_answer)
                return response_validator.validate_and_normalize(
                    request_id=request.request_id,
                    session_id=request.session_id,
                    raw_text=final_answer,
                    tool_records=tool_records,
                    last_tool_data=last_tool_data
                )

            # Handle Tool Calls
            for tc in llm_response.tool_calls:
                total_tool_calls += 1
                if total_tool_calls > settings.max_tool_calls_per_req:
                    logger.warning("Max tool calls exceeded guardrail limit")
                    return response_validator.validate_and_normalize(
                        request_id=request.request_id,
                        session_id=request.session_id,
                        raw_text="Yêu cầu vượt quá giới hạn truy vấn cho phép. Vui lòng đặt câu hỏi cụ thể hơn.",
                        tool_records=tool_records,
                        last_tool_data=last_tool_data
                    )

                # Check if tool is registered
                tool_def = registry.get_tool(tc.name)
                if not tool_def:
                    logger.warning(f"LLM requested unauthorized or nonexistent tool: {tc.name}")
                    tool_records.append(ToolCallRecord(
                        name=tc.name,
                        arguments=tc.arguments,
                        status="rejected",
                        error=f"Công cụ '{tc.name}' không được phép sử dụng."
                    ))
                    # Inform model that tool is rejected
                    context_manager.add_message(
                        request.session_id,
                        "tool",
                        {"error": f"Tool '{tc.name}' không tồn tại. Vui lòng chỉ sử dụng các công cụ đã đăng ký."},
                        name=tc.name
                    )
                    continue

                # Validate Arguments
                valid, err_msg = registry.validate_arguments(tc.name, tc.arguments)
                if not valid:
                    logger.warning(f"Invalid arguments for {tc.name}: {err_msg}")
                    tool_records.append(ToolCallRecord(
                        name=tc.name,
                        arguments=tc.arguments,
                        status="error",
                        error=err_msg
                    ))
                    context_manager.add_message(
                        request.session_id,
                        "tool",
                        {"error": err_msg},
                        name=tc.name
                    )
                    continue

                # Anti-looping guardrail
                fp = self._compute_fingerprint(tc.name, tc.arguments)
                if fp in executed_fingerprints:
                    logger.warning(f"Detected duplicate tool call loop for {tc.name}")
                    tool_records.append(ToolCallRecord(
                        name=tc.name,
                        arguments=tc.arguments,
                        status="rejected",
                        error="Phát hiện vòng lặp gọi lại cùng tham số."
                    ))
                    break
                executed_fingerprints.add(fp)

                # Execute Tool via Business API Client
                tool_result = await self.business_client.execute_tool(tc.name, tc.arguments, store_id)
                tool_status = "success" if tool_result.success else "error"
                err_str = tool_result.error.message if tool_result.error else None
                tool_records.append(ToolCallRecord(
                    name=tc.name,
                    arguments=tc.arguments,
                    status=tool_status,
                    error=err_str,
                    result=self._cap_result(tool_result.data, settings.max_tool_result_chars) if tool_result.success else None
                ))

                if tool_result.success and tool_result.data is not None:
                    last_tool_data = tool_result.data

                # Feed result back into conversation history
                context_manager.add_message(
                    request.session_id,
                    "tool",
                    tool_result.model_dump(),
                    name=tc.name
                )

            # Prepare for next turn
            current_message = "Vui lòng phân tích kết quả dữ liệu từ công cụ và trả lời câu hỏi của người dùng."

        # If turn limit reached
        return response_validator.validate_and_normalize(
            request_id=request.request_id,
            session_id=request.session_id,
            raw_text="Đã đạt số vòng điều phối tối đa mà chưa có kết luận hoàn chỉnh.",
            tool_records=tool_records,
            last_tool_data=last_tool_data
        )

orchestrator = AgentOrchestrator()
