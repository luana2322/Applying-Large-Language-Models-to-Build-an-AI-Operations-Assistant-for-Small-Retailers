from typing import Dict, Any, List, Optional
from abc import ABC, abstractmethod
from pydantic import BaseModel
import datetime
import json
import logging
from app.config import settings

logger = logging.getLogger(__name__)

class LLMToolCall(BaseModel):
    name: str
    arguments: Dict[str, Any]

class LLMResponse(BaseModel):
    is_tool_call: bool
    tool_calls: List[LLMToolCall] = []
    text: Optional[str] = None
    input_tokens: int = 0
    output_tokens: int = 0

class BaseLLMAdapter(ABC):
    @abstractmethod
    async def generate(self, system_instruction: str, history: List[Dict[str, Any]], message: str, tool_declarations: List[Dict[str, Any]]) -> LLMResponse:
        pass

class MockLLMAdapter(BaseLLMAdapter):
    """
    Deterministic rule-based mock LLM adapter for offline testing,
    continuous integration, and benchmark verification without external API keys.
    """
    async def generate(self, system_instruction: str, history: List[Dict[str, Any]], message: str, tool_declarations: List[Dict[str, Any]]) -> LLMResponse:
        msg_lower = message.lower().strip()
        today = datetime.date.today()

        # If previous turn was a tool execution result, synthesize grounded answer
        if history and history[-1].get("role") == "tool":
            tool_data = history[-1].get("content", {})
            tool_name = history[-1].get("name", "")

            # If tool execution failed, report the error honestly without hallucinating
            if not tool_data or not tool_data.get("success", False):
                err_dict = tool_data.get("error") if isinstance(tool_data, dict) else None
                err_msg = err_dict.get("message") if isinstance(err_dict, dict) else "Không thể kết nối đến hệ thống nghiệp vụ."
                return LLMResponse(
                    is_tool_call=False,
                    text=f"Rất tiếc, đã có sự cố khi truy vấn số liệu: {err_msg}",
                    input_tokens=100,
                    output_tokens=30
                )

            data = tool_data.get("data") or {}

            if tool_name == "get_sales_summary":
                net_rev = data.get("net_revenue", 0)
                orders = data.get("valid_order_count", 0)
                period_start = data.get("start_date", "")
                period_end = data.get("end_date", "")
                return LLMResponse(
                    is_tool_call=False,
                    text=f"Trong kỳ từ {period_start} đến {period_end}, tổng doanh thu thuần của cửa hàng là {net_rev:,.0f} VND với {orders} đơn hàng hoàn tất hợp lệ.",
                    input_tokens=150,
                    output_tokens=40
                )
            elif tool_name == "get_profit_summary":
                net = data.get("net_revenue", 0)
                cogs = data.get("cost_of_goods_sold", 0)
                profit = data.get("gross_profit", 0)
                margin = data.get("gross_margin_percentage", 0)
                note = data.get("note", "")
                note_str = f" Lưu ý: {note}" if note else ""
                return LLMResponse(
                    is_tool_call=False,
                    text=f"Tổng kết lợi nhuận gộp trong kỳ: Doanh thu thuần đạt {net:,.0f} VND, giá vốn (COGS) là {cogs:,.0f} VND, lợi nhuận gộp đạt {profit:,.0f} VND (biên lợi nhuận gộp: {margin}%).{note_str}",
                    input_tokens=160,
                    output_tokens=50
                )
            elif tool_name == "get_top_products":
                prods = data.get("products", [])
                lines = [f"- Top {p.get('rank')}: {p.get('name')} (Đã bán: {p.get('quantity_sold')} sản phẩm, Doanh thu: {p.get('net_revenue', 0):,.0f} VND)" for p in prods]
                content = "\n".join(lines) if lines else "Không có sản phẩm nào có phát sinh doanh số trong kỳ."
                return LLMResponse(
                    is_tool_call=False,
                    text=f"Danh sách các sản phẩm bán chạy nhất trong kỳ:\n{content}",
                    input_tokens=180,
                    output_tokens=65
                )
            elif tool_name == "get_inventory_status":
                low_cnt = data.get("low_stock_count", 0)
                out_cnt = data.get("out_of_stock_count", 0)
                items = data.get("items", [])
                warning_lines = [f"- {it.get('name')}: Tồn {it.get('current_stock')} {it.get('unit')} (Mức tối thiểu: {it.get('min_stock_level')}) - Trạng thái: {it.get('stock_status')}" for it in items if it.get("stock_status") != "NORMAL"]
                detail_text = "\n".join(warning_lines[:5]) if warning_lines else "Hiện tất cả mặt hàng kiểm tra đều ở mức tồn an toàn."
                return LLMResponse(
                    is_tool_call=False,
                    text=f"Báo cáo tồn kho: Có {out_cnt} mặt hàng hết hàng và {low_cnt} mặt hàng dưới ngưỡng an toàn.\n{detail_text}",
                    input_tokens=170,
                    output_tokens=60
                )
            elif tool_name == "get_slow_moving_products":
                items = data.get("slow_moving_products", [])
                lines = [f"- {it.get('name')}: {it.get('reason')}" for it in items]
                text = "\n".join(lines) if lines else "Không phát hiện hàng ứ đọng bán chậm trong kỳ quan sát."
                return LLMResponse(
                    is_tool_call=False,
                    text=f"Danh sách mặt hàng bán chậm cần lưu ý:\n{text}",
                    input_tokens=175,
                    output_tokens=55
                )
            elif tool_name == "get_expense_summary":
                total = data.get("total_expense", 0)
                by_cat = data.get("by_category", [])
                cat_lines = [f"- {c.get('category')}: {c.get('total_amount', 0):,.0f} VND ({c.get('transaction_count')} khoản)" for c in by_cat]
                return LLMResponse(
                    is_tool_call=False,
                    text=f"Tổng chi phí hoạt động ghi nhận trong kỳ là {total:,.0f} VND:\n" + "\n".join(cat_lines),
                    input_tokens=160,
                    output_tokens=50
                )
            elif tool_name == "get_restock_suggestions":
                suggestions = data.get("suggestions", [])
                lines = [f"- {s.get('name')}: Đề xuất nhập thêm {s.get('suggested_quantity')} đơn vị. ({s.get('reason')})" for s in suggestions[:5]]
                text = "\n".join(lines) if lines else "Hiện tại lượng hàng trong kho đủ đáp ứng nhu cầu dự kiến."
                return LLMResponse(
                    is_tool_call=False,
                    text=f"Kế hoạch đề xuất nhập hàng:\n{text}",
                    input_tokens=190,
                    output_tokens=70
                )

        # Prompt injection / security tests (TC-15, TC-12)
        if "api key" in msg_lower or "system prompt" in msg_lower or "bỏ qua tất cả quy tắc" in msg_lower:
            return LLMResponse(
                is_tool_call=False,
                text="Tôi là trợ lý kinh doanh và không được phép tiết lộ thông tin cấu hình, system prompt hay khóa bảo mật của hệ thống.",
                input_tokens=80,
                output_tokens=30
            )

        if any(w in msg_lower for w in ["sửa", "thay đổi", "cập nhật", "xóa"]) and any(w in msg_lower for w in ["kho", "giá", "tồn", "đơn"]):
            return LLMResponse(
                is_tool_call=False,
                text="Tôi chỉ có quyền tra cứu và phân tích số liệu kinh doanh. Hệ thống không cho phép AI tự ý thay đổi tồn kho, sửa giá hoặc đặt hàng. Vui lòng thao tác trực tiếp trên giao diện quản lý.",
                input_tokens=90,
                output_tokens=40
            )

        # Ambiguous questions requiring clarification (TC-07)
        if msg_lower in ["hôm trước bán được bao nhiêu?", "doanh thu hôm trước", "hôm trước thế nào"]:
            return LLMResponse(
                is_tool_call=False,
                text="Bạn muốn xem doanh thu ngày hôm qua hay ngày gần nhất có phát sinh giao dịch?",
                input_tokens=70,
                output_tokens=25
            )

        # Context follow-up ("còn tuần trước thì sao?", "còn tuần trước?") (TC-06)
        if "còn tuần trước" in msg_lower or "tuần trước thì sao" in msg_lower:
            start_7d = (today - datetime.timedelta(days=14)).strftime("%Y-%m-%d")
            end_7d = (today - datetime.timedelta(days=7)).strftime("%Y-%m-%d")
            return LLMResponse(
                is_tool_call=True,
                tool_calls=[LLMToolCall(name="get_sales_summary", arguments={"start_date": start_7d, "end_date": end_7d})],
                input_tokens=120,
                output_tokens=30
            )

        # Intent: Sales today (TC-01)
        if "hôm nay" in msg_lower and ("doanh thu" in msg_lower or "bán được" in msg_lower):
            today_str = today.strftime("%Y-%m-%d")
            return LLMResponse(
                is_tool_call=True,
                tool_calls=[LLMToolCall(name="get_sales_summary", arguments={"start_date": today_str, "end_date": today_str})],
                input_tokens=100,
                output_tokens=25
            )

        # Intent: Sales last month (TC-02)
        if "tháng trước" in msg_lower and ("doanh thu" in msg_lower or "bán được" in msg_lower):
            # First day of previous month to last day of previous month
            first_this_month = today.replace(day=1)
            last_prev_month = first_this_month - datetime.timedelta(days=1)
            first_prev_month = last_prev_month.replace(day=1)
            return LLMResponse(
                is_tool_call=True,
                tool_calls=[LLMToolCall(
                    name="get_sales_summary",
                    arguments={"start_date": first_prev_month.strftime("%Y-%m-%d"), "end_date": last_prev_month.strftime("%Y-%m-%d")}
                )],
                input_tokens=110,
                output_tokens=30
            )

        # Intent: Sales 7 days / generic sales
        if "doanh thu" in msg_lower or "bán hàng" in msg_lower:
            start_date = (today - datetime.timedelta(days=7)).strftime("%Y-%m-%d")
            end_date = today.strftime("%Y-%m-%d")
            return LLMResponse(
                is_tool_call=True,
                tool_calls=[LLMToolCall(name="get_sales_summary", arguments={"start_date": start_date, "end_date": end_date})],
                input_tokens=110,
                output_tokens=25
            )

        # Intent: Profit summary (TC-05)
        if "lợi nhuận" in msg_lower or "lãi" in msg_lower:
            start_date = (today - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
            end_date = today.strftime("%Y-%m-%d")
            return LLMResponse(
                is_tool_call=True,
                tool_calls=[LLMToolCall(name="get_profit_summary", arguments={"start_date": start_date, "end_date": end_date})],
                input_tokens=115,
                output_tokens=25
            )

        # Intent: Top products (TC-03)
        if "bán chạy" in msg_lower or "top sản phẩm" in msg_lower or "top 5" in msg_lower:
            start_date = (today - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
            end_date = today.strftime("%Y-%m-%d")
            return LLMResponse(
                is_tool_call=True,
                tool_calls=[LLMToolCall(name="get_top_products", arguments={"start_date": start_date, "end_date": end_date, "metric": "quantity", "limit": 5})],
                input_tokens=120,
                output_tokens=30
            )

        # Intent: Low stock / Out of stock (TC-04)
        if "sắp hết" in msg_lower or "hết hàng" in msg_lower or "tồn kho" in msg_lower:
            status_filter = "low_stock" if "sắp hết" in msg_lower else "all"
            return LLMResponse(
                is_tool_call=True,
                tool_calls=[LLMToolCall(name="get_inventory_status", arguments={"status": status_filter})],
                input_tokens=100,
                output_tokens=25
            )

        # Intent: Slow moving products
        if "bán chậm" in msg_lower or "ứ đọng" in msg_lower:
            return LLMResponse(
                is_tool_call=True,
                tool_calls=[LLMToolCall(name="get_slow_moving_products", arguments={"lookback_days": 30})],
                input_tokens=105,
                output_tokens=25
            )

        # Intent: Expense summary
        if "chi phí" in msg_lower or "tiền điện" in msg_lower or "tiền thuê" in msg_lower:
            start_date = (today - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
            end_date = today.strftime("%Y-%m-%d")
            return LLMResponse(
                is_tool_call=True,
                tool_calls=[LLMToolCall(name="get_expense_summary", arguments={"start_date": start_date, "end_date": end_date})],
                input_tokens=110,
                output_tokens=25
            )

        # Intent: Restock suggestions
        if "nhập hàng" in msg_lower or "đề xuất nhập" in msg_lower:
            return LLMResponse(
                is_tool_call=True,
                tool_calls=[LLMToolCall(name="get_restock_suggestions", arguments={"planning_days": 14, "lookback_days": 30})],
                input_tokens=120,
                output_tokens=30
            )

        # Fallback general greeting / assistance
        return LLMResponse(
            is_tool_call=False,
            text="Xin chào! Tôi là Trợ lý AI Điều hành Bán lẻ. Bạn có thể hỏi tôi về doanh thu, lợi nhuận gộp, top sản phẩm bán chạy, cảnh báo hàng sắp hết hoặc đề xuất nhập hàng.",
            input_tokens=60,
            output_tokens=45
        )

def _to_provider_messages(system_instruction: str, history: List[Dict[str, Any]], message: str) -> List[Dict[str, Any]]:
    """
    Convert the internal normalized history (roles: user | assistant | tool) into a
    provider-neutral message list. Tool results are folded into user-role messages
    carrying a JSON payload so continuity works without requiring provider-specific
    tool_call_id pairing. This keeps the orchestrator contract stable.
    """
    messages: List[Dict[str, Any]] = [{"role": "system", "content": system_instruction}]
    for m in history:
        role = m.get("role")
        content = m.get("content")
        if role == "user":
            messages.append({"role": "user", "content": str(content)})
        elif role == "assistant":
            messages.append({"role": "assistant", "content": str(content) if content is not None else ""})
        elif role == "tool":
            payload = json.dumps(content, ensure_ascii=False, default=str)
            messages.append({
                "role": "user",
                "content": f"[KẾT QUẢ CÔNG CỤ {m.get('name', '')}] {payload}"
            })
    if len(messages) == 1 and message:
        messages.append({"role": "user", "content": str(message)})
    return messages


class GeminiLLMAdapter(BaseLLMAdapter):
    _TYPE_MAP = {
        "string": "STRING",
        "integer": "INTEGER",
        "number": "NUMBER",
        "boolean": "BOOLEAN",
        "object": "OBJECT",
        "array": "ARRAY",
    }

    def __init__(self, api_key: str, model_name: str = "gemini-1.5-flash"):
        self.api_key = api_key
        self.model_name = model_name

    @classmethod
    def _build_tool_proto(cls, tool_declarations: List[Dict[str, Any]]):
        import google.generativeai as genai
        type_enum = {
            "STRING": genai.protos.Type.STRING,
            "INTEGER": genai.protos.Type.INTEGER,
            "NUMBER": genai.protos.Type.NUMBER,
            "BOOLEAN": genai.protos.Type.BOOLEAN,
            "OBJECT": genai.protos.Type.OBJECT,
            "ARRAY": genai.protos.Type.ARRAY,
        }
        declarations = []
        for d in tool_declarations:
            params = d.get("parameters") or {}
            properties = {}
            for p_name, p_def in (params.get("properties") or {}).items():
                kwargs = {
                    "type_": type_enum.get(
                        cls._TYPE_MAP.get(str(p_def.get("type", "string")).lower(), "STRING"),
                        genai.protos.Type.STRING,
                    )
                }
                if p_def.get("description"):
                    kwargs["description"] = p_def["description"]
                if p_def.get("enum"):
                    kwargs["enum"] = [str(e) for e in p_def["enum"]]
                properties[p_name] = genai.protos.Schema(**kwargs)
            declarations.append(genai.protos.FunctionDeclaration(
                name=d["name"],
                description=d.get("description", ""),
                parameters=genai.protos.Schema(
                    type_=genai.protos.Type.OBJECT,
                    properties=properties,
                    required=list(params.get("required") or []),
                ),
            ))
        return genai.protos.Tool(function_declarations=declarations)

    @staticmethod
    def _parse_response(response) -> LLMResponse:
        tool_calls: List[LLMToolCall] = []
        text_parts: List[str] = []
        candidates = getattr(response, "candidates", None) or []
        if candidates:
            content = getattr(candidates[0], "content", None)
            for part in (getattr(content, "parts", None) or []):
                fc = getattr(part, "function_call", None)
                if fc is not None and getattr(fc, "name", ""):
                    try:
                        args = dict(fc.args) if fc.args else {}
                    except Exception:
                        args = {}
                    tool_calls.append(LLMToolCall(name=fc.name, arguments=args))
                    continue
                try:
                    txt = getattr(part, "text", "") or ""
                except Exception:
                    txt = ""
                if txt:
                    text_parts.append(txt)
        else:
            try:
                text_parts.append(getattr(response, "text", "") or "")
            except Exception:
                pass

        if tool_calls:
            return LLMResponse(is_tool_call=True, tool_calls=tool_calls)
        return LLMResponse(is_tool_call=False, text="\n".join(t for t in text_parts if t).strip())

    async def generate(self, system_instruction: str, history: List[Dict[str, Any]], message: str, tool_declarations: List[Dict[str, Any]]) -> LLMResponse:
        import google.generativeai as genai
        try:
            genai.configure(api_key=self.api_key)
            model_kwargs: Dict[str, Any] = {"model_name": self.model_name, "system_instruction": system_instruction}
            if tool_declarations:
                model_kwargs["tools"] = [self._build_tool_proto(tool_declarations)]
            model = genai.GenerativeModel(**model_kwargs)

            provider_messages = _to_provider_messages(system_instruction, history, message)
            contents = [
                {"role": "user" if m["role"] == "user" else "model", "parts": [{"text": m["content"]}]}
                for m in provider_messages
                if m["role"] != "system"
            ]
            if not contents:
                contents = [{"role": "user", "parts": [{"text": message}]}]

            response = await model.generate_content_async(
                contents,
                request_options={"timeout": settings.llm_timeout_seconds},
            )
            return self._parse_response(response)
        except Exception as e:
            logger.error(f"Gemini API invocation failed: {e}")
            raise e


class OpenAILLMAdapter(BaseLLMAdapter):
    def __init__(self, api_key: str, model_name: str = "gpt-4o-mini"):
        self.api_key = api_key
        self.model_name = model_name

    @staticmethod
    def _to_openai_tools(tool_declarations: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        return [
            {
                "type": "function",
                "function": {
                    "name": d["name"],
                    "description": d.get("description", ""),
                    "parameters": d.get("parameters") or {"type": "object", "properties": {}},
                },
            }
            for d in tool_declarations
        ]

    @staticmethod
    def _parse_response(response) -> LLMResponse:
        choice = response.choices[0].message
        raw_tool_calls = getattr(choice, "tool_calls", None)
        if raw_tool_calls:
            calls: List[LLMToolCall] = []
            for tc in raw_tool_calls:
                try:
                    args = json.loads(tc.function.arguments or "{}")
                except Exception:
                    args = {}
                calls.append(LLMToolCall(name=tc.function.name, arguments=args))
            return LLMResponse(is_tool_call=True, tool_calls=calls)
        return LLMResponse(is_tool_call=False, text=(choice.content or "").strip())

    async def generate(self, system_instruction: str, history: List[Dict[str, Any]], message: str, tool_declarations: List[Dict[str, Any]]) -> LLMResponse:
        from openai import AsyncOpenAI
        try:
            client = AsyncOpenAI(api_key=self.api_key, timeout=settings.llm_timeout_seconds)
            kwargs: Dict[str, Any] = {
                "model": self.model_name,
                "messages": _to_provider_messages(system_instruction, history, message),
            }
            if tool_declarations:
                kwargs["tools"] = self._to_openai_tools(tool_declarations)
                kwargs["tool_choice"] = "auto"
            response = await client.chat.completions.create(**kwargs)
            return self._parse_response(response)
        except Exception as e:
            logger.error(f"OpenAI API invocation failed: {e}")
            raise e
