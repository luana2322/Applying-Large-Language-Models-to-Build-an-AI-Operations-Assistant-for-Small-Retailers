import json
from typing import Dict, Any, List

def recommend_lavabo_combo(color: str = "Trắng tuyết", installation_type: str = "Đặt bàn") -> Dict[str, Any]:
    """
    Gợi ý phối màu gạch men và combo phụ kiện lắp đặt cho Lavabo (Thiết bị vệ sinh).
    Trả lời câu hỏi: Lavabo màu trắng thì đi với gạch men màu gì, đi với đồ gì theo combo?
    """
    color_normalized = color.lower()
    
    # Tư vấn phối màu gạch ốp lát
    tile_advice = []
    if "trắng" in color_normalized or "white" in color_normalized:
        tile_advice = [
            {
                "style": "Hiện đại & Sang trọng (Luxury Modern)",
                "tile_name": "Gạch Calacatta White 30x60 mờ (Vân mây xám)",
                "sku": "GM-CALA-60",
                "price": 220000,
                "unit": "m2",
                "reason": "Vân đá marble xám khói trên nền trắng tạo chiều sâu tinh tế, tôn vinh độ bóng mịn của men sứ Aqua Ceramic."
            },
            {
                "style": "Tối giản Bắc Âu / Wabi-sabi (Minimalist)",
                "tile_name": "Gạch Terrazzo xám hạt mịn 60x60 chống trơn",
                "sku": "GM-TERRA-01",
                "price": 260000,
                "unit": "m2",
                "reason": "Màu xám xi măng hạt muối tiêu tương phản nhẹ nhàng với chậu trắng, mang lại cảm giác mộc mạc và sạch sẽ."
            },
            {
                "style": "Điểm nhấn nghệ thuật (Accent Wall)",
                "tile_name": "Gạch thẻ Xanh Ngọc Lục Bảo (Emerald Green) 7.5x15",
                "sku": "GM-SUB-XANH",
                "price": 340000,
                "unit": "m2",
                "reason": "Ốp điểm mảng tường sau gương tạo hiệu ứng thị giác nổi bật, làm chiếc lavabo trắng trở thành tâm điểm của phòng tắm."
            }
        ]
    
    # Phụ kiện đi kèm bắt buộc theo chuẩn kỹ thuật
    fittings = [
        {
            "role": "Vòi chậu nóng lạnh",
            "name": "Vòi Lavabo nóng lạnh thân cao 30cm Đen mờ tĩnh điện",
            "sku": "TBVS-VOI-01",
            "price": 720000,
            "required": True,
            "reason": "Lavabo đặt bàn bắt buộc dùng vòi cổ cao. Tone đen nhám tạo nét tương phản hiện đại chuẩn xu hướng."
        },
        {
            "role": "Bộ xả xi-phông",
            "name": "Bộ xả xi-phông thoát nước nhấn nắp sứ Trắng đồng bộ",
            "sku": "TBVS-XP-01",
            "price": 190000,
            "required": True,
            "reason": "Nắp xả sứ trắng hòa vào màu lòng chậu đồng bộ, đuôi chữ P bằng đồng chống tràn và ngăn hôi cống."
        },
        {
            "role": "Van góc & Dây cấp",
            "name": "Cặp van góc Inox 304 kèm dây cấp chịu nhiệt 60cm",
            "sku": "TBVS-VG-01",
            "price": 150000,
            "required": True,
            "reason": "Phụ kiện đấu nối nước lạnh/nóng âm tường, bảo vệ vòi chậu và chống bục vỡ áp lực cao."
        },
        {
            "role": "Vật tư phụ chống ẩm",
            "name": "Keo Silicone trung tính Apolo A500 Trắng sữa (Chống mốc)",
            "sku": "DN-KEO-APOLO",
            "price": 60000,
            "required": True,
            "reason": "Trám viền quanh đáy lavabo tiếp xúc mặt đá chống đọng nước và ố mốc chân chậu."
        }
    ]

    total_combo_price = 1650000 + sum(f["price"] for f in fittings)
    combo_discount_price = round(total_combo_price * 0.95)

    return {
        "status": "success",
        "lavabo_spec": {
            "color": color,
            "installation": installation_type,
            "price": 1650000
        },
        "tile_recommendations": tile_advice,
        "combo_accessories": fittings,
        "pricing": {
            "original_total": total_combo_price,
            "discount_combo_total": combo_discount_price,
            "savings": total_combo_price - combo_discount_price,
            "discount_pct": "5%"
        }
    }
