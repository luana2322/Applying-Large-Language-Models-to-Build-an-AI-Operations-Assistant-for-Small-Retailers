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
        # Calculate year to date
        start_year = today.replace(month=1, day=1)
        # Calculate last 90 days (recent months)
        last_90_days = today - datetime.timedelta(days=90)

        context_header = (
            f"### THÔNG TIN THỜI GIAN & HỆ THỐNG HIỆN TẠI:\n"
            f"- Hôm nay là: {weekday_vn}, ngày {current_date_str}\n"
            f"- Tuần này: Từ {start_week.strftime('%Y-%m-%d')} đến {end_week.strftime('%Y-%m-%d')}\n"
            f"- Tháng này: Từ {start_month.strftime('%Y-%m-%d')} đến {end_month.strftime('%Y-%m-%d')}\n"
            f"- 30 ngày gần nhất: Từ {last_30_days.strftime('%Y-%m-%d')} đến {current_date_str}\n"
            f"- Những tháng gần đây / 90 ngày qua: Từ {last_90_days.strftime('%Y-%m-%d')} đến {current_date_str}\n"
            f"- Từ đầu năm đến nay: Từ {start_year.strftime('%Y-%m-%d')} đến {current_date_str}\n"
            f"- Múi giờ: {timezone}\n"
            f"- Đơn vị tiền tệ chuẩn: VND\n\n"
            f"### QUY TẮC BẮT BUỘC KHI GỌI CÔNG CỤ (TOOL CALLING):\n"
            f"1. TUYỆT ĐỐI KHÔNG HỎI LẠI NGƯỜI DÙNG KHOẢNG THỜI GIAN HOẶC NGÀY THÁNG! Bất cứ khi nào người dùng hỏi chung chung như 'doanh thu cao nhất', 'những tháng gần đây', 'gần đây', 'doanh thu', 'bán hàng' -> TỰ ĐỘNG CHỌN NGAY mốc thời gian phù hợp (ví dụ 90 ngày qua hoặc 30 ngày qua) và GỌI NGAY `get_sales_summary`.\n"
            f"2. Khi người dùng nhập một câu quá ngắn hoặc chỉ nhập số (như '4', 'ok', 'tiếp') -> Hãy hiểu người dùng đang muốn xem tiếp thông tin từ câu hỏi trước (ví dụ: xem top 4 sản phẩm bán chạy, hoặc xem chi tiết 4 tháng qua), HÃY TỰ ĐỘNG GỌI TOOL PHÙ HỢP hoặc trả lời ngay, TUYỆT ĐỐI KHÔNG trả lời là 'thắc mắc mơ hồ'.\n"
            f"3. Khi người dùng hỏi về 'doanh thu', 'bán hàng', 'đơn hàng' -> BẮT BUỘC gọi duy nhất `get_sales_summary`. TUYỆT ĐỐI KHÔNG gọi `get_profit_summary` trừ khi người dùng rõ ràng nhắc đến từ 'lợi nhuận', 'lãi', 'lãi gộp'.\n"
            f"4. Khi người dùng hỏi về 'tồn kho', 'hàng sắp hết', 'hàng hết' -> BẮT BUỘC gọi duy nhất `get_inventory_status` (với status='low_stock').\n"
            f"5. Sau khi nhận được kết quả dữ liệu từ công cụ, BẮT BUỘC TRẢ LỜI NGAY câu kết luận bằng tiếng Việt, TUYỆT ĐỐI KHÔNG gọi lại công cụ lần thứ hai.\n"
            f"6. LUÔN LUÔN giao tiếp 100% bằng TIẾNG VIỆT trong mọi trường hợp.\n\n"
        )
        return context_header + self.base_prompt

prompt_builder = PromptBuilder()
