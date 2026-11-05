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
            f"1. Khi người dùng hỏi doanh thu, đơn hàng, lợi nhuận hoặc bán chạy trong 'hôm nay', 'tuần này', 'tháng này', 'tháng trước' -> BẮT BUỘC TỰ ĐỘNG LẤY NGÀY THÁNG TƯƠNG ỨNG Ở TRÊN để truyền vào `start_date` và `end_date`. TUYỆT ĐỐI KHÔNG HỎI LẠI NGƯỜI DÙNG ngày bắt đầu hoặc ngày kết thúc!\n"
            f"2. Khi người dùng hỏi về 'tồn kho', 'hàng sắp hết', 'hàng hết', 'hàng bán chậm' -> BẮT BUỘC GỌI NGAY `get_inventory_status` (với status='low_stock' hoặc 'all') hoặc `get_slow_moving_products`. KHÔNG hỏi lại ngày tháng vì tồn kho là số liệu tức thời hiện tại.\n"
            f"3. LUÔN LUÔN giao tiếp 100% bằng TIẾNG VIỆT trong mọi trường hợp.\n\n"
        )
        return context_header + self.base_prompt

prompt_builder = PromptBuilder()
