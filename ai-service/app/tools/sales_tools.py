from app.tools.registry import registry, ToolDefinition

def register_sales_tools():
    # 1. get_sales_summary
    registry.register(ToolDefinition(
        name="get_sales_summary",
        description="Lấy tổng hợp doanh thu bán hàng trong một khoảng thời gian, bao gồm doanh thu gộp, giảm giá, hoàn trả, doanh thu thuần và số đơn hàng.",
        parameters={
            "start_date": {
                "type": "string",
                "description": "Ngày bắt đầu (định dạng YYYY-MM-DD)."
            },
            "end_date": {
                "type": "string",
                "description": "Ngày kết thúc (định dạng YYYY-MM-DD)."
            },
            "group_by": {
                "type": "string",
                "description": "Nhóm số liệu theo: 'day', 'week', 'month'.",
                "enum": ["day", "week", "month"]
            }
        },
        required_params=[]
    ))

    # 3. get_top_products
    registry.register(ToolDefinition(
        name="get_top_products",
        description="Xếp hạng các sản phẩm bán chạy nhất theo số lượng bán (quantity) hoặc doanh thu (revenue) trong khoảng thời gian xác định.",
        parameters={
            "start_date": {
                "type": "string",
                "description": "Ngày bắt đầu (định dạng YYYY-MM-DD)."
            },
            "end_date": {
                "type": "string",
                "description": "Ngày kết thúc (định dạng YYYY-MM-DD)."
            },
            "metric": {
                "type": "string",
                "description": "Tiêu chí xếp hạng: 'quantity' (số lượng) hoặc 'revenue' (doanh thu). Mặc định là 'quantity'.",
                "enum": ["quantity", "revenue"]
            },
            "limit": {
                "type": "integer",
                "description": "Số lượng sản phẩm muốn lấy (mặc định 5, tối đa 50)."
            }
        },
        required_params=[]
    ))
