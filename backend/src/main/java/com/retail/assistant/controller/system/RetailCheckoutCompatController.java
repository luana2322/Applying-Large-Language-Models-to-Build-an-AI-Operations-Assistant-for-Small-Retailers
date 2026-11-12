package com.retail.assistant.controller.system;

import com.retail.assistant.domain.service.sales.CheckoutService;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/sales-orders/retail")
public class RetailCheckoutCompatController {

    private final CheckoutService checkoutService;

    public RetailCheckoutCompatController(CheckoutService checkoutService) {
        this.checkoutService = checkoutService;
    }

    @PostMapping("/checkout")
    public ResponseEntity<?> checkout(@RequestBody(required = false) Map<String, Object> body, HttpServletRequest request) {
        try {
            Long currentUserId = null;
            Object uidObj = request.getAttribute("authenticatedUserId");
            if (uidObj instanceof Number) {
                currentUserId = ((Number) uidObj).longValue();
            }

            Map<String, Object> result = checkoutService.processRetailCheckout(body, currentUserId);
            return ResponseEntity.ok(Map.of(
                "success", true,
                "data", result,
                "message", "Thanh toán đơn hàng thành công"
            ));
        } catch (IllegalArgumentException | IllegalStateException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of(
                "success", false,
                "error", "CHECKOUT_FAILED",
                "message", e.getMessage()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of(
                "success", false,
                "error", "INTERNAL_ERROR",
                "message", "Lỗi xử lý thanh toán: " + e.getMessage()
            ));
        }
    }
}
