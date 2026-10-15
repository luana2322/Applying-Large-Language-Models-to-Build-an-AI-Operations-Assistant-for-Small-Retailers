from app.tools.registry import registry, ToolDefinition

def register_profit_tools():
    # 2. get_profit_summary
    registry.register(ToolDefinition(
        name="get_profit_summary",
        description="Tính toán doanh thu thuần, giá vốn hàng bán (COGS), lợi nhuận gộp và biên lợi nhuận gộp (%) trong khoảng thời gian xác định.",
        parameters={
            "start_date": {
                "type": "string",
                "description": "Ngày bắt đầu (định dạng YYYY-MM-DD)."
            },
            "end_date": {
                "type": "string",
                "description": "Ngày kết thúc (định dạng YYYY-MM-DD)."
            }
        },
        required_params=[]
    ))
