from app.tools.registry import registry, ToolDefinition

def register_dien_nuoc_tools():
    # 8. search_products
    registry.register(ToolDefinition(
        name="search_products",
        description="Tra cứu sản phẩm vật tư điện nước, thông số kỹ thuật, tồn kho và quy đổi đơn vị tính (ví dụ: cuộn 100m -> mét lẻ, cây 4m -> mét, hộp -> viên).",
        parameters={
            "query": {
                "type": "string",
                "description": "Từ khóa tìm kiếm (tên sản phẩm, mã SKU, thương hiệu Tiền Phong, Cadivi, Panasonic, INAX hoặc quy cách như 'dây 2.5', 'ống 27', 'CB 20A')."
            },
            "category": {
                "type": "string",
                "description": "Danh mục sản phẩm (tùy chọn)."
            },
            "limit": {
                "type": "integer",
                "description": "Số lượng kết quả tối đa (mặc định 10)."
            }
        },
        required_params=[]
    ))

    # 9. get_contractor_debts
    registry.register(ToolDefinition(
        name="get_contractor_debts",
        description="Tra cứu sổ nợ và công nợ của thợ điện nước, nhà thầu xây dựng theo từng công trình, số ngày quá hạn và mức độ rủi ro.",
        parameters={
            "status": {
                "type": "string",
                "description": "Trạng thái công nợ: 'ALL' (tất cả), 'ACTIVE' (còn nợ), 'OVERDUE' (quá hạn). Mặc định là 'ALL'.",
                "enum": ["ALL", "ACTIVE", "OVERDUE"]
            },
            "customer_id": {
                "type": "integer",
                "description": "ID khách hàng/thợ thầu cụ thể (tùy chọn)."
            },
            "limit": {
                "type": "integer",
                "description": "Số lượng hồ sơ công nợ tối đa (mặc định 10)."
            }
        },
        required_params=[]
    ))

    # 10. recommend_sanitary_combo
    registry.register(ToolDefinition(
        name="recommend_sanitary_combo",
        description="Tư vấn phối màu gạch ốp lát và đề xuất trọn bộ phụ kiện lắp đặt đồng bộ cho thiết bị vệ sinh (Lavabo, bồn cầu, vòi sen) kèm chính sách chiết khấu combo 5%.",
        parameters={
            "color": {
                "type": "string",
                "description": "Màu sắc chậu lavabo hoặc thiết bị vệ sinh (ví dụ: 'Trắng tuyết', 'Đen mờ', 'Xám xi măng')."
            },
            "installation_type": {
                "type": "string",
                "description": "Kiểu lắp đặt: 'Đặt bàn' (dương bàn), 'Treo tường', 'Âm bàn'. Mặc định 'Đặt bàn'."
            }
        },
        required_params=[]
    ))

