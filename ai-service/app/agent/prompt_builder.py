import os
import datetime
from pathlib import Path

PROMPT_FILE = Path(__file__).resolve().parent.parent.parent / "prompts" / "retail_assistant_v1.txt"

class PromptBuilder:
    def __init__(self):
        self.base_prompt = ""
        if PROMPT_FILE.exists():
            with open(PROMPT_FILE, "r", encoding="utf-8") as f:
                self.base_prompt = f.read()

    def build_system_instruction(self, timezone: str = "Asia/Ho_Chi_Minh") -> str:
        today = datetime.date.today()
        current_date_str = today.strftime("%Y-%m-%d")
        weekday_vn = ["Thứ Hai", "Thứ Ba", "Thứ Tư", "Thứ Năm", "Thứ Sáu", "Thứ Bảy", "Chủ Nhật"][today.weekday()]
        
        # Calculate current week (Monday to Sunday)
        start_week = today - datetime.timedelta(days=today.weekday())
        end_week = start_week + datetime.timedelta(days=6)
        
        # Calculate current month
        start_month = today.replace(day=1)
        import calendar
        _, last_day = calendar.monthrange(today.year, today.month)
        end_month = today.replace(day=last_day)
        
        # Calculate last 30 days
        last_30_days = today - datetime.timedelta(days=30)

        context_header = (
            f"### THÔNG TIN THỜI GIAN & HỆ THỐNG HIỆN TẠI:\n"
            f"- Hôm nay là: {weekday_vn}, ngày {current_date_str}\n"
            f"- Tuần này: Từ {start_week.strftime('%Y-%m-%d')} đến {end_week.strftime('%Y-%m-%d')}\n"
            f"- Tháng này: Từ {start_month.strftime('%Y-%m-%d')} đến {end_month.strftime('%Y-%m-%d')}\n"
            f"- 30 ngày gần nhất: Từ {last_30_days.strftime('%Y-%m-%d')} đến {current_date_str}\n"
            f"- Múi giờ: {timezone}\n"
            f"- Đơn vị tiền tệ chuẩn: VND\n\n"
            f"### QUY TẮC BẮT BUỘC KHI GỌI CÔNG CỤ (TOOL CALLING):\n"
            f"1. Khi người dùng hỏi 'doanh thu', 'bán hàng', 'đơn hàng' -> BẮT BUỘC gọi duy nhất công cụ `get_sales_summary` với `start_date` và `end_date` lấy từ ngày tháng ở trên. TUYỆT ĐỐI KHÔNG gọi `get_profit_summary` khi người dùng chỉ hỏi về doanh thu. KHÔNG ĐƯỢC HỎI LẠI NGƯỜI DÙNG ngày bắt đầu hoặc ngày kết thúc!\n"
            f"2. Chỉ gọi `get_profit_summary` khi người dùng rõ ràng hỏi về 'lợi nhuận', 'lãi', 'lãi gộp' hoặc 'biên lợi nhuận'.\n"
            f"3. Khi người dùng hỏi về 'tồn kho', 'hàng sắp hết', 'hàng hết' -> BẮT BUỘC gọi duy nhất `get_inventory_status` (với status='low_stock'). KHÔNG hỏi lại ngày tháng vì tồn kho là số liệu tức thời hiện tại.\n"
            f"4. Sau khi nhận được kết quả dữ liệu từ công cụ, BẮT BUỘC TRẢ LỜI NGAY câu kết luận bằng tiếng Việt, TUYỆT ĐỐI KHÔNG gọi lại công cụ lần thứ hai.\n"
            f"5. LUÔN LUÔN giao tiếp 100% bằng TIẾNG VIỆT trong mọi trường hợp.\n\n"
        )
        return context_header + self.base_prompt

prompt_builder = PromptBuilder()
