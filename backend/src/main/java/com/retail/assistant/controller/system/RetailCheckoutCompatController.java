package com.retail.assistant.controller.system;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/v1/sales-orders/retail")
public class RetailCheckoutCompatController {

    @PostMapping("/checkout")
    public ResponseEntity<Map<String, Object>> checkout(@RequestBody(required = false) Map<String, Object> body) {
        String code = "HD-BL-" + (System.currentTimeMillis() % 100000);
        String paymentStatus = body != null && body.containsKey("paymentStatus") ? (String) body.get("paymentStatus") : "Paid";
        double discount = body != null && body.get("discountAmount") instanceof Number ? ((Number) body.get("discountAmount")).doubleValue() : 0.0;

        List<?> lines = body != null && body.get("lines") instanceof List ? (List<?>) body.get("lines") : Collections.emptyList();
        double total = 0.0;
        List<Map<String, Object>> resLines = new ArrayList<>();
        int idx = 1;

        for (Object l : lines) {
            if (l instanceof Map) {
                Map<?, ?> lm = (Map<?, ?>) l;
                double price = lm.get("unitPrice") instanceof Number ? ((Number) lm.get("unitPrice")).doubleValue() : 150000.0;
                int qty = lm.get("quantity") instanceof Number ? ((Number) lm.get("quantity")).intValue() : 1;
                double lineTotal = price * qty;
                total += lineTotal;

                resLines.add(Map.of(
                        "id", idx++,
                        "productId", lm.get("productId") != null ? lm.get("productId") : 1,
                        "productName", "Vật tư điện nước & TBVS",
                        "skuCode", "VT-DN-" + idx,
                        "quantity", qty,
                        "unitPrice", price,
                        "totalPrice", lineTotal,
                        "unitName", "Cái"
                ));
            }
        }

        if (total == 0.0) {
            total = 720000.0;
            resLines.add(Map.of(
                    "id", 1,
                    "productId", 4,
                    "productName", "Vòi Lavabo nóng lạnh thân cao Đen mờ",
                    "skuCode", "TBVS-VOI-01",
                    "quantity", 1,
                    "unitPrice", 720000.0,
                    "totalPrice", 720000.0,
                    "unitName", "Cái"
            ));
        }

        double finalAmount = Math.max(0.0, total - discount);

        Map<String, Object> detail = new HashMap<>();
        detail.put("id", System.currentTimeMillis() % 10000);
        detail.put("orderCode", code);
        detail.put("customerId", body != null ? body.get("customerId") : null);
        detail.put("customerName", body != null && body.get("customerId") != null ? "Khách hàng thân thiết" : "Khách lẻ tại quầy");
        detail.put("totalAmount", total);
        detail.put("discountAmount", discount);
        detail.put("finalAmount", finalAmount);
        detail.put("status", "Delivered");
        detail.put("orderChannel", "Retail");
        detail.put("paymentStatus", paymentStatus);
        detail.put("itemsCount", resLines.size());
        detail.put("items", resLines);
        detail.put("createdAt", LocalDateTime.now().toString());
        detail.put("updatedAt", LocalDateTime.now().toString());

        return ResponseEntity.ok(Map.of("success", true, "data", detail));
    }
}
