from app.tools.registry import registry, ToolDefinition

def register_inventory_tools():
    # 4. get_inventory_status
    registry.register(ToolDefinition(
        name="get_inventory_status",
        description="Tra cứu trạng thái tồn kho thực tế, bao gồm số lượng hiện tại, ngưỡng tồn an toàn, danh sách hàng sắp hết (low_stock) hoặc hết hàng (out_of_stock).",
        parameters={
            "product_id": {
                "type": "integer",
                "description": "ID sản phẩm cụ thể cần tra cứu (tùy chọn)."
            },
            "category": {
                "type": "string",
                "description": "Lọc theo danh mục hàng hóa (tùy chọn)."
            },
            "status": {
                "type": "string",
                "description": "Trạng thái cần lọc: 'all' (tất cả), 'low_stock' (sắp hết hàng), 'out_of_stock' (hết hàng).",
                "enum": ["all", "low_stock", "out_of_stock"]
            }
        },
        required_params=[]
    ))

    # 5. get_slow_moving_products
    registry.register(ToolDefinition(
        name="get_slow_moving_products",
        description="Tìm các sản phẩm bán chậm hoặc không bán được trong thời gian quan sát nhưng vẫn còn nhiều hàng tồn kho.",
        parameters={
            "lookback_days": {
                "type": "integer",
                "description": "Số ngày quan sát ngược lại từ hiện tại (mặc định 30 ngày)."
            },
            "min_stock_quantity": {
                "type": "integer",
                "description": "Số lượng tồn tối thiểu để xem xét (mặc định 5)."
            },
            "max_sales_quantity": {
                "type": "integer",
                "description": "Số lượng bán tối đa trong kỳ để coi là bán chậm (mặc định 2)."
            }
        },
        required_params=[]
    ))
