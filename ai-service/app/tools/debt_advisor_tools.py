from typing import Dict, Any

def generate_debt_reminder_message(contractor_name: str, project_name: str, remaining_amount: float, overdue_days: int, level: str = "GENTLE") -> Dict[str, Any]:
    """
    Sinh tin nhắn nhắc thu hồi nợ thông minh cho thợ điện nước, nhà thầu hoặc chủ công trình.
    """
    formatted_amount = f"{remaining_amount:,.0f}đ".replace(",", ".")
    
    if level == "URGENT" or overdue_days > 15:
        msg = f"Em chào {contractor_name}, khoản công nợ vật tư điện nước công trình {project_name} hiện còn {formatted_amount} đã quá hạn {overdue_days} ngày. Nhờ anh sắp xếp thanh toán trước 50% trong hôm nay để cửa hàng mở bảo lãnh cấp hàng đợt tiếp theo nhé ạ. Em cảm ơn anh!"
    elif level == "REMINDER" or overdue_days > 0:
        msg = f"Em chào {contractor_name}, em gửi anh bảng đối chiếu công nợ vật tư công trình {project_name} hiện còn {formatted_amount} (đã đến hạn {overdue_days} ngày). Anh kiểm tra giúp em để bên em chốt sổ và giao tiếp đợt phụ kiện nhé ạ!"
    else:
        msg = f"Em chào {contractor_name}, cửa hàng gửi anh đối chiếu vật tư công trình {project_name} đợt này là {formatted_amount}. Anh xem có gì cần bổ sung nhắn em nhé, chúc anh một ngày làm việc thuận lợi ạ!"
        
    return {
        "status": "success",
        "contractor_name": contractor_name,
        "project_name": project_name,
        "remaining_amount": remaining_amount,
        "overdue_days": overdue_days,
        "reminder_level": level,
        "suggested_message": msg,
        "recommended_channel": "ZALO"
    }
