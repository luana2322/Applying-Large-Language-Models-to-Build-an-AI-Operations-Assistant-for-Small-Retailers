import datetime
import re
from typing import Optional, Dict, Any, Tuple

class HybridIntentRouter:
    """
    Tầng Router tiền xử lý thông minh (Hybrid Intent Engine).
    Tự động phân loại câu hỏi tiếng Việt của người dùng sang Tool nghiệp vụ chính xác
    và tính toán sẵn tham số thời gian, tránh việc model nhỏ (3B/7B) bị nhầm lẫn
    hoặc hỏi ngược lại người dùng.
    """

    @staticmethod
    def _get_time_ranges() -> Dict[str, Tuple[str, str]]:
        today = datetime.date.today()
        # Today
        today_str = today.strftime("%Y-%m-%d")
        
        # Week (Monday to Sunday)
        start_week = (today - datetime.timedelta(days=today.weekday())).strftime("%Y-%m-%d")
        end_week = (today - datetime.timedelta(days=today.weekday()) + datetime.timedelta(days=6)).strftime("%Y-%m-%d")
        
        # Month
        start_month = today.replace(day=1).strftime("%Y-%m-%d")
        import calendar
        _, last_day = calendar.monthrange(today.year, today.month)
        end_month = today.replace(day=last_day).strftime("%Y-%m-%d")
        
        # Last Month
        first_current = today.replace(day=1)
        prev_month_end = first_current - datetime.timedelta(days=1)
        prev_month_start = prev_month_end.replace(day=1)
        
        # 30 days
        days_30 = (today - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
        # 90 days (những tháng gần đây)
        days_90 = (today - datetime.timedelta(days=90)).strftime("%Y-%m-%d")
        # Year to date
        year_start = today.replace(month=1, day=1).strftime("%Y-%m-%d")

        return {
            "today": (today_str, today_str),
            "week": (start_week, end_week),
            "month": (start_month, end_month),
            "last_month": (prev_month_start.strftime("%Y-%m-%d"), prev_month_end.strftime("%Y-%m-%d")),
            "days_30": (days_30, today_str),
            "days_90": (days_90, today_str),
            "year": (year_start, today_str),
        }

    @classmethod
    def route(cls, message: str, last_intent: Optional[str] = None) -> Optional[Tuple[str, Dict[str, Any]]]:
        msg = message.lower().strip()
        times = cls._get_time_ranges()

        # Xác định khoảng thời gian được nhắc tới
        start_d, end_d = times["days_90"] # Mặc định cho câu chung chung là 90 ngày gần đây
        if "hôm nay" in msg or "nay" in msg:
            start_d, end_d = times["today"]
        elif "tuần này" in msg or "tuần" in msg:
            start_d, end_d = times["week"]
        elif "tháng trước" in msg:
            start_d, end_d = times["last_month"]
        elif "tháng này" in msg:
            start_d, end_d = times["month"]
        elif "năm nay" in msg or "từ đầu năm" in msg:
            start_d, end_d = times["year"]
        elif "30 ngày" in msg:
            start_d, end_d = times["days_30"]

        # 1. Doanh thu / Doanh số / Bán hàng / Tiền bán
        revenue_keywords = [
            "doanh thu", "doanh số", "bán được", "thu được", "tiền bán",
            "doanh thu cao nhất", "bán hàng", "bán ra", "tổng thu", "doanh số cao"
        ]
        if any(kw in msg for kw in revenue_keywords):
            return ("get_sales_summary", {
                "start_date": start_d,
                "end_date": end_d
            })

        # 2. Lợi nhuận / Lãi / Biên lợi nhuận / Lãi gộp
        profit_keywords = ["lợi nhuận", "lãi", "lời", "lãi gộp", "biên lợi nhuận", "lãi suất"]
        if any(kw in msg for kw in profit_keywords):
            return ("get_profit_summary", {
                "start_date": start_d,
                "end_date": end_d
            })

        # 3. Sản phẩm bán chạy / Top sản phẩm / Mặt hàng hot
        top_product_keywords = ["bán chạy", "top sản phẩm", "sản phẩm hot", "mặt hàng hot", "mua nhiều nhất", "bán tốt nhất"]
        if any(kw in msg for kw in top_product_keywords):
            # Tìm xem có số lượng limit không (ví dụ top 4, top 5, top 10)
            limit = 5
            match_limit = re.search(r"top\s*(\d+)", msg)
            if match_limit:
                limit = int(match_limit.group(1))
            return ("get_top_products", {
                "start_date": start_d,
                "end_date": end_d,
                "metric": "quantity",
                "limit": limit
            })

        # 4. Tồn kho / Hàng sắp hết / Hết hàng / Kiểm kho
        inventory_keywords = [
            "tồn kho", "sắp hết", "hết hàng", "còn hàng", "còn bao nhiêu", 
            "kiểm kho", "hàng tồn", "số lượng tồn", "thiếu hàng", "hàng trong kho"
        ]
        if any(kw in msg for kw in inventory_keywords):
            status = "low_stock" if ("sắp hết" in msg or "thiếu" in msg or "cảnh báo" in msg) else "low_stock"
            return ("get_inventory_status", {
                "status": status
            })

        # 5. Đề xuất nhập hàng / Hàng cần nhập
        restock_keywords = ["nhập hàng", "cần nhập", "đề xuất nhập", "mua thêm hàng", "nhập thêm"]
        if any(kw in msg for kw in restock_keywords):
            return ("get_restock_suggestions", {
                "planning_days": 14,
                "lookback_days": 30
            })

        # 6. Hàng bán chậm / Tồn đọng
        slow_moving_keywords = ["bán chậm", "tồn đọng", "ế", "ít người mua", "chậm bán"]
        if any(kw in msg for kw in slow_moving_keywords):
            return ("get_slow_moving_products", {
                "lookback_days": 60
            })

        # 7. Xử lý câu trả lời cộc lốc hoặc số nối tiếp (Contextual Follow-up)
        # Ví dụ người dùng gõ: "4", "top 5", "tiếp", "nữa đi"
        if re.match(r"^\d+$", msg):
            num = int(msg)
            # Người dùng gõ một con số sau khi hỏi doanh thu/sản phẩm
            return ("get_top_products", {
                "start_date": times["days_90"][0],
                "end_date": times["days_90"][1],
                "metric": "quantity",
                "limit": min(num, 20)
            })

        return None

intent_router = HybridIntentRouter()
