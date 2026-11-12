import datetime
import calendar
import re
from typing import Optional, Dict, Any, Tuple

class HybridIntentRouter:
    """
    Tầng Router tiền xử lý thông minh (Hybrid Intent Engine) chuyên biệt cho ngành Điện Nước & VLXD.
    Tự động phân loại câu hỏi tiếng Việt của người dùng sang Tool nghiệp vụ chính xác
    và tính toán sẵn tham số thời gian, đặc thù sản phẩm, tránh việc model nhỏ (3B/7B) bị nhầm lẫn
    hoặc hỏi ngược lại người dùng.
    """

    @staticmethod
    def _get_time_ranges() -> Dict[str, Tuple[str, str]]:
        today = datetime.date.today()
        today_str = today.strftime("%Y-%m-%d")

        # Tuần này (Thứ 2 đến CN)
        start_week = (today - datetime.timedelta(days=today.weekday())).strftime("%Y-%m-%d")
        end_week = (today - datetime.timedelta(days=today.weekday()) + datetime.timedelta(days=6)).strftime("%Y-%m-%d")

        # Tuần trước
        start_prev_week = (today - datetime.timedelta(days=today.weekday() + 7)).strftime("%Y-%m-%d")
        end_prev_week = (today - datetime.timedelta(days=today.weekday() + 1)).strftime("%Y-%m-%d")

        # Tháng này
        start_month = today.replace(day=1).strftime("%Y-%m-%d")
        _, last_day = calendar.monthrange(today.year, today.month)
        end_month = today.replace(day=last_day).strftime("%Y-%m-%d")

        # Tháng trước
        first_current = today.replace(day=1)
        prev_month_end = first_current - datetime.timedelta(days=1)
        prev_month_start = prev_month_end.replace(day=1)

        # 30 ngày, 90 ngày, năm nay
        days_30 = (today - datetime.timedelta(days=30)).strftime("%Y-%m-%d")
        days_90 = (today - datetime.timedelta(days=90)).strftime("%Y-%m-%d")
        year_start = today.replace(month=1, day=1).strftime("%Y-%m-%d")

        return {
            "today": (today_str, today_str),
            "week": (start_week, end_week),
            "prev_week": (start_prev_week, end_prev_week),
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

        # -1. Yêu cầu sửa/ghi/cập nhật dữ liệu hoặc can thiệp hệ thống (Write Operations) - không được route vào Tool
        write_keywords = ["sửa", "thay đổi", "cập nhật", "xóa", "thêm mới", "tạo đơn", "chỉnh", "điều chỉnh"]
        if any(w in msg for w in write_keywords) and not any(kw in msg for kw in ["đề xuất nhập", "nhập hàng", "cần nhập"]):
            return None

        # 0. Câu hỏi mơ hồ cần làm rõ ngày tháng (Clarification required) - không fast-route
        if re.search(r"\b(hôm trước|hôm nọ|hôm nào)\b", msg):
            return None

        # 0.1 Follow-up ngữ cảnh theo thời gian dựa vào last_intent
        if last_intent in ("SALES_SUMMARY", "get_sales_summary") or "tuần trước thì sao" in msg or "còn tuần trước" in msg:
            if re.search(r"\b(tuần trước|tuần rồi)\b", msg):
                return ("get_sales_summary", {
                    "start_date": times["prev_week"][0],
                    "end_date": times["prev_week"][1]
                })

        # 1. Xác định khoảng thời gian chuẩn xác bằng regex có ranh giới từ (tránh nhầm lẫn 'nay' với 'này')
        start_d, end_d = times["days_90"] # Mặc định là 90 ngày gần đây cho các báo cáo chung

        if re.search(r"\b(hôm nay|ngày nay|nay)\b", msg):
            start_d, end_d = times["today"]
        elif re.search(r"\b(tuần trước|tuần rồi)\b", msg):
            start_d, end_d = times["prev_week"]
        elif re.search(r"\b(tuần này|trong tuần)\b", msg):
            start_d, end_d = times["week"]
        elif re.search(r"\b(tháng trước|tháng rồi)\b", msg):
            start_d, end_d = times["last_month"]
        elif re.search(r"\b(tháng này|trong tháng)\b", msg):
            start_d, end_d = times["month"]
        elif re.search(r"\b(năm nay|từ đầu năm)\b", msg):
            start_d, end_d = times["year"]
        elif "30 ngày" in msg:
            start_d, end_d = times["days_30"]

        # 2. Tư vấn phối màu gạch ốp & Combo thiết bị vệ sinh (Lavabo / Bồn cầu / Vòi sen / Nhà vệ sinh)
        sanitary_combo_patterns = [
            "phối màu", "đi với gạch", "gạch gì", "màu gì", "combo",
            "vòi gì", "phụ kiện gì", "lắp lavabo", "lắp bồn cầu", "tư vấn lavabo", "tư vấn gạch",
            "nhà vệ sinh", "phòng tắm", "phòng vệ sinh", "toilet", "mua gì", "thiết bị vệ sinh"
        ]
        if any(p in msg for p in sanitary_combo_patterns):
            color = "Trắng tuyết"
            if "đen" in msg or "black" in msg:
                color = "Đen mờ"
            elif "xám" in msg or "ghi" in msg:
                color = "Xám xi măng"

            install_type = "Đặt bàn"
            if "treo tường" in msg or "treo" in msg:
                install_type = "Treo tường"
            elif "âm bàn" in msg:
                install_type = "Âm bàn"

            return ("recommend_sanitary_combo", {
                "color": color,
                "installation_type": install_type
            })

        # 3. Quản lý sổ công nợ thợ điện nước, nhà thầu công trình
        debt_patterns = [
            "công nợ", "nợ thợ", "nhà thầu", "quá hạn", "tiền nợ", "sổ nợ",
            "nhắc nợ", "khoản nợ", "đối chiếu nợ", "thợ nợ", "chưa trả"
        ]
        if any(p in msg for p in debt_patterns):
            status = "OVERDUE" if ("quá hạn" in msg or "gấp" in msg) else "ALL"
            return ("get_contractor_debts", {
                "status": status,
                "limit": 10
            })

        # 4. Tra cứu sản phẩm & quy cách ngành điện nước (Dây Cadivi, Ống Tiền Phong, CB, Lavabo...)
        product_indicators = [
            "dây", "ống", "cadivi", "tiền phong", "sino", "panasonic", "inax",
            "lavabo", "vòi", "sen", "aptomat", "cb ", "van đồng", "keo", "băng tan",
            "còn bao nhiêu", "còn mấy cuộn", "mấy cây", "giá bao nhiêu", "quy cách"
        ]
        is_asking_specific_product = any(ind in msg for ind in product_indicators)
        if is_asking_specific_product and not any(kw in msg for kw in ["doanh thu", "lợi nhuận", "lãi"]):
            # Trích xuất từ khóa tìm kiếm sản phẩm
            query = msg
            for prefix in ["còn bao nhiêu", "còn mấy cuộn", "kiểm tra", "tra cứu", "cho hỏi", "hỏi", "sản phẩm", "giá"]:
                query = query.replace(prefix, "")
            query = query.strip(" ?.,!").strip()
            if not query:
                query = "cadivi"
            return ("search_products", {
                "query": query,
                "limit": 10
            })

        # 5. Doanh thu / Doanh số / Bán được
        revenue_keywords = [
            "doanh thu", "doanh số", "bán được", "thu được", "tiền bán",
            "doanh thu cao nhất", "bán ra", "tổng thu", "doanh số cao"
        ]
        if any(kw in msg for kw in revenue_keywords):
            return ("get_sales_summary", {
                "start_date": start_d,
                "end_date": end_d
            })

        # 6. Lợi nhuận / Lãi / Biên lợi nhuận (Tránh false positive như 'trả lời')
        is_profit = False
        if re.search(r"\b(lợi nhuận|lãi gộp|tiền lãi|tiền lời|biên lợi nhuận)\b", msg):
            is_profit = True
        elif re.search(r"\b(lãi|lời)\b", msg) and "trả lời" not in msg:
            is_profit = True

        if is_profit:
            return ("get_profit_summary", {
                "start_date": start_d,
                "end_date": end_d
            })

        # 7. Sản phẩm bán chạy / Top sản phẩm
        top_product_keywords = ["bán chạy", "top sản phẩm", "sản phẩm hot", "mặt hàng hot", "mua nhiều nhất", "bán tốt nhất"]
        if any(kw in msg for kw in top_product_keywords):
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

        # 8. Tồn kho tổng quát / Hàng sắp hết / Cảnh báo kho
        inventory_keywords = [
            "tồn kho", "sắp hết", "hết hàng", "còn hàng",
            "kiểm kho", "hàng tồn", "số lượng tồn", "thiếu hàng", "hàng trong kho"
        ]
        if any(kw in msg for kw in inventory_keywords):
            # Phân biệt rõ giữa 'low_stock' (hàng sắp hết) và 'all' (tất cả tồn kho)
            is_low_stock = any(kw in msg for kw in ["sắp hết", "thiếu", "cảnh báo", "hết hàng"])
            status = "low_stock" if is_low_stock else "all"
            return ("get_inventory_status", {
                "status": status
            })

        # 9. Đề xuất nhập hàng / Hàng cần nhập
        restock_keywords = ["nhập hàng", "cần nhập", "đề xuất nhập", "mua thêm hàng", "nhập thêm"]
        if any(kw in msg for kw in restock_keywords):
            return ("get_restock_suggestions", {
                "planning_days": 14,
                "lookback_days": 30
            })

        # 10. Hàng bán chậm / Tồn đọng
        slow_moving_keywords = ["hàng bán chậm", "sản phẩm bán chậm", "tồn đọng lâu ngày", "hàng ế", "chậm bán"]
        if any(kw in msg for kw in slow_moving_keywords):
            return ("get_slow_moving_products", {
                "lookback_days": 60,
                "min_stock_quantity": 5,
                "max_sales_quantity": 2
            })

        # 11. Xử lý câu trả lời ngắn / con số nối tiếp (Contextual Follow-up) bằng last_intent
        if re.match(r"^\d+$", msg):
            num = int(msg)
            if last_intent == "search_products":
                return ("search_products", {
                    "query": msg,
                    "limit": 10
                })
            elif last_intent == "get_inventory_status":
                return ("get_inventory_status", {
                    "status": "all"
                })
            else:
                # Mặc định top sản phẩm với số lượng do user vừa nhập
                return ("get_top_products", {
                    "start_date": times["days_90"][0],
                    "end_date": times["days_90"][1],
                    "metric": "quantity",
                    "limit": min(max(num, 1), 20)
                })

        return None

intent_router = HybridIntentRouter()
