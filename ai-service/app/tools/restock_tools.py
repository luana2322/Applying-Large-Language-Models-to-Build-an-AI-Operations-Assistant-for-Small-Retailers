from app.tools.registry import registry, ToolDefinition

def register_restock_and_expense_tools():
    # 6. get_expense_summary
    registry.register(ToolDefinition(
        name="get_expense_summary",
        description="Tổng hợp các khoản chi phí hoạt động của cửa hàng (mặt bằng, điện nước, nhân viên, bao bì...) trong khoảng thời gian xác định.",
        parameters={
            "start_date": {
                "type": "string",
                "description": "Ngày bắt đầu (định dạng YYYY-MM-DD)."
            },
            "end_date": {
                "type": "string",
                "description": "Ngày kết thúc (định dạng YYYY-MM-DD)."
            },
            "category": {
                "type": "string",
                "description": "Lọc theo danh mục chi phí cụ thể (tùy chọn)."
            }
        },
        required_params=[]
    ))

    # 7. get_restock_suggestions
    registry.register(ToolDefinition(
        name="get_restock_suggestions",
        description="Đề xuất số lượng hàng cần nhập thêm dựa trên tốc độ bán thực tế, số ngày cần dự trữ và lượng tồn an toàn hiện tại.",
        parameters={
            "product_id": {
                "type": "integer",
                "description": "ID sản phẩm cụ thể cần tính đề xuất nhập (tùy chọn)."
            },
            "planning_days": {
                "type": "integer",
                "description": "Số ngày bán hàng cần dự trữ hàng (mặc định 14 ngày)."
            },
            "lookback_days": {
                "type": "integer",
                "description": "Số ngày trong quá khứ dùng để tính tốc độ bán trung bình (mặc định 30 ngày)."
            }
        },
        required_params=[]
    ))

def init_all_tools():
    from app.tools.sales_tools import register_sales_tools
    from app.tools.profit_tools import register_profit_tools
    from app.tools.inventory_tools import register_inventory_tools

    register_sales_tools()
    register_profit_tools()
    register_inventory_tools()
    register_restock_and_expense_tools()
