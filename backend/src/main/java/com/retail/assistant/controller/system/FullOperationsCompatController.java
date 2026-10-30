package com.retail.assistant.controller.system;

import com.retail.assistant.domain.entity.inventory.Inventory;
import com.retail.assistant.domain.entity.inventory.StockDispatch;
import com.retail.assistant.domain.entity.supplier.StockReceipt;
import com.retail.assistant.domain.entity.sales.SaleOrder;
import com.retail.assistant.domain.entity.system.Role;
import com.retail.assistant.domain.entity.system.User;
import com.retail.assistant.domain.repository.catalog.ProductRepository;
import com.retail.assistant.domain.repository.inventory.InventoryRepository;
import com.retail.assistant.domain.repository.inventory.StockDispatchRepository;
import com.retail.assistant.domain.repository.sales.SaleOrderRepository;
import com.retail.assistant.domain.repository.supplier.StockReceiptRepository;
import com.retail.assistant.domain.repository.system.RoleRepository;
import com.retail.assistant.domain.repository.system.UserRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.*;

@RestController
@RequestMapping("/api/v1")
public class FullOperationsCompatController {

    private final InventoryRepository inventoryRepository;
    private final ProductRepository productRepository;
    private final StockReceiptRepository receiptRepository;
    private final StockDispatchRepository dispatchRepository;
    private final SaleOrderRepository saleOrderRepository;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;

    public FullOperationsCompatController(
            InventoryRepository inventoryRepository,
            ProductRepository productRepository,
            StockReceiptRepository receiptRepository,
            StockDispatchRepository dispatchRepository,
            SaleOrderRepository saleOrderRepository,
            UserRepository userRepository,
            RoleRepository roleRepository) {
        this.inventoryRepository = inventoryRepository;
        this.productRepository = productRepository;
        this.receiptRepository = receiptRepository;
        this.dispatchRepository = dispatchRepository;
        this.saleOrderRepository = saleOrderRepository;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
    }

    // 1. DASHBOARD (Delegated to DashboardRichController)

    // 2. INVENTORY LIST & SUMMARY
    @GetMapping("/inventory")
    public ResponseEntity<Map<String, Object>> getInventory(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit,
            @RequestParam(required = false) String search) {

        List<Inventory> all = inventoryRepository.findAll();
        List<Map<String, Object>> items = new ArrayList<>();
        double totalVal = 0;
        int lowCount = 0;
        int expiringCount = 0;

        for (Inventory inv : all) {
            var prod = inv.getProduct();
            if (prod == null) continue;
            if (search != null && !search.isBlank()) {
                String q = search.toLowerCase();
                boolean match = (prod.getName() != null && prod.getName().toLowerCase().contains(q)) ||
                                (prod.getSku() != null && prod.getSku().toLowerCase().contains(q));
                if (!match) continue;
            }

            int qty = inv.getQuantity() != null ? inv.getQuantity().intValue() : 0;
            int minQty = inv.getMinQuantity() != null ? inv.getMinQuantity().intValue() : 10;
            double cost = prod.getCostPrice() != null ? prod.getCostPrice() : 50000.0;
            double val = qty * cost;
            totalVal += val;

            boolean isLow = qty <= minQty;
            if (isLow) lowCount++;

            Map<String, Object> m = new HashMap<>();
            m.put("id", inv.getId());
            m.put("productId", prod.getId());
            m.put("productName", prod.getName());
            m.put("skuCode", prod.getSku());
            m.put("barcode", prod.getBarcode());
            m.put("locationId", inv.getLocation() != null ? inv.getLocation().getId() : 1);
            m.put("warehouseCode", "KHO-CHINH");
            m.put("shelfCode", "A1-01");
            m.put("batchNumber", inv.getBatchNumber());
            m.put("expiryDate", inv.getExpiryDate() != null ? inv.getExpiryDate().toString() : "2027-01-01");
            m.put("quantity", qty);
            m.put("minQuantity", minQty);
            m.put("unitId", 1);
            m.put("unitName", prod.getUnit() != null ? prod.getUnit() : "Cái");
            m.put("costPrice", cost);
            m.put("updatedAt", inv.getUpdatedAt() != null ? inv.getUpdatedAt().toString() : "2026-10-28T08:00:00");
            m.put("isLowStock", isLow);
            m.put("isExpiringSoon", false);
            m.put("totalValue", val);
            m.put("reorderSuggested", isLow);
            m.put("lastMovementDate", "2026-10-28");
            m.put("staleConfidence", "High");
            m.put("isStale", false);
            items.add(m);
        }

        Map<String, Object> summary = Map.of(
                "totalSkus", items.size(),
                "totalValue", totalVal,
                "lowStockCount", lowCount,
                "expiringSoonCount", expiringCount
        );

        Map<String, Object> data = new HashMap<>();
        data.put("items", items);
        data.put("summary", summary);
        data.put("page", page);
        data.put("limit", limit);
        data.put("total", items.size());

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/inventory/summary")
    public ResponseEntity<Map<String, Object>> getInventorySummary() {
        Map<String, Object> summary = Map.of(
                "totalSkus", 8,
                "totalValue", 28500000.0,
                "lowStockCount", 2,
                "expiringSoonCount", 1
        );
        return ResponseEntity.ok(Map.of("success", true, "data", summary));
    }

    // 3. STOCK RECEIPTS & DISPATCHES
    @GetMapping("/stock-receipts")
    public ResponseEntity<Map<String, Object>> getStockReceipts(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        List<StockReceipt> all = receiptRepository.findAll();
        List<Map<String, Object>> items = new ArrayList<>();
        for (StockReceipt r : all) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", r.getId());
            m.put("receiptCode", r.getReceiptCode());
            m.put("supplierId", r.getSupplier() != null ? r.getSupplier().getId() : 1);
            m.put("supplierName", r.getSupplier() != null ? r.getSupplier().getName() : "Công ty TNHH Phân Phối Thú Cưng Royal");
            m.put("staffId", 1);
            m.put("staffName", "Admin");
            m.put("receiptDate", r.getReceiptDate() != null ? r.getReceiptDate().toString() : "2026-10-25");
            m.put("status", r.getStatus() != null ? r.getStatus() : "Done");
            m.put("invoiceNumber", "HD-NK-" + r.getId());
            m.put("totalAmount", r.getTotalAmount() != null ? r.getTotalAmount() : 15000000.0);
            m.put("lineCount", 3);
            m.put("notes", r.getNotes());
            m.put("createdAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : "2026-10-25T09:00:00");
            m.put("updatedAt", r.getCreatedAt() != null ? r.getCreatedAt().toString() : "2026-10-25T09:00:00");
            items.add(m);
        }
        Map<String, Object> data = Map.of("items", items, "page", page, "limit", limit, "total", items.size());
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/stock-dispatches")
    public ResponseEntity<Map<String, Object>> getStockDispatches(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        List<StockDispatch> all = dispatchRepository.findAll();
        List<Map<String, Object>> items = new ArrayList<>();
        for (StockDispatch d : all) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", d.getId());
            m.put("dispatchCode", d.getDispatchCode());
            m.put("orderCode", "HD-" + d.getId());
            m.put("customerName", "Hoàng Văn Nam");
            m.put("dispatchDate", d.getDispatchDate() != null ? d.getDispatchDate().toString() : "2026-10-26");
            m.put("userName", "Admin");
            m.put("itemCount", 2);
            m.put("status", "Delivered");
            m.put("createdByUserId", 1);
            m.put("manualDispatch", false);
            items.add(m);
        }
        Map<String, Object> data = Map.of("items", items, "page", page, "limit", limit, "total", items.size());
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    // 4. CASH FUNDS, CASH TRANSACTIONS
    @GetMapping("/cash-funds")
    public ResponseEntity<Map<String, Object>> getCashFunds() {
        List<Map<String, Object>> list = List.of(
                Map.of("id", 1, "code", "TM01", "name", "Két tiền mặt tại quầy", "isDefault", true, "isActive", true),
                Map.of("id", 2, "code", "NH01", "name", "Tài khoản Vietcombank PetCare", "isDefault", false, "isActive", true)
        );
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("items", list)));
    }

    @GetMapping("/cash-transactions")
    public ResponseEntity<Map<String, Object>> getCashTransactions(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        List<Map<String, Object>> list = List.of(
                Map.of("id", 1, "transactionCode", "PT001", "type", "Income", "amount", 1650000.0, "fundId", 1, "fundName", "Két tiền mặt tại quầy", "category", "Thu tiền bán Lavabo INAX", "transactionDate", "2026-10-30 09:30", "status", "Completed", "notes", "Thu tiền mặt khách lẻ"),
                Map.of("id", 2, "transactionCode", "PT002", "type", "Income", "amount", 20000000.0, "fundId", 2, "fundName", "Tài khoản Vietcombank", "category", "Tạm ứng vật tư công trình Gamuda", "transactionDate", "2026-10-30 10:15", "status", "Completed", "notes", "Cty Kiến Á chuyển khoản"),
                Map.of("id", 3, "transactionCode", "PC001", "type", "Expense", "amount", 3500000.0, "fundId", 1, "fundName", "Két tiền mặt tại quầy", "category", "Chi phí vận chuyển ống nước", "transactionDate", "2026-10-30 11:00", "status", "Completed", "notes", "Thuê xe tải giao hàng công trình Nam Cường")
        );
        Map<String, Object> data = Map.of("items", list, "page", page, "limit", limit, "total", list.size());
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    // 5. STORE PROFILE, USERS, ROLES, SETTINGS
    @GetMapping("/store-profile")
    public ResponseEntity<Map<String, Object>> getStoreProfile() {
        Map<String, Object> profile = Map.of(
                "id", 1,
                "name", "Tổng kho Điện Nước & Thiết Bị Vệ Sinh SmartRetail",
                "businessCategory", "Vật tư Điện Nước, Gạch Men & TBVS",
                "address", "Số 15 Lê Văn Lương, Cầu Giấy, Hà Nội",
                "phone", "0988-123-456",
                "email", "contact@diennuocsmart.vn",
                "website", "https://diennuocsmart.vn",
                "taxCode", "0109988776",
                "logoUrl", "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?w=200",
                "updatedAt", "2026-10-30T08:00:00"
        );
        return ResponseEntity.ok(Map.of("success", true, "data", profile));
    }

    @GetMapping("/roles")
    public ResponseEntity<Map<String, Object>> getRoles() {
        List<Role> all = roleRepository.findAll();
        List<Map<String, Object>> items = new ArrayList<>();
        for (Role r : all) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", r.getId());
            m.put("name", r.getName());
            m.put("permissions", Map.of("all", true));
            items.add(m);
        }
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("items", items)));
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, Object>> getUsers(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        List<User> all = userRepository.findAll();
        List<Map<String, Object>> items = new ArrayList<>();
        for (User u : all) {
            Map<String, Object> m = new HashMap<>();
            m.put("id", u.getId());
            m.put("employeeCode", "NV-00" + u.getId());
            m.put("fullName", u.getFullName() != null ? u.getFullName() : u.getUsername());
            m.put("email", u.getEmail());
            m.put("phone", u.getPhone());
            m.put("roleId", u.getRole() != null ? u.getRole().getId() : 1);
            m.put("role", u.getRole() != null ? u.getRole().getName() : "Admin");
            m.put("status", u.getStatus() != null ? u.getStatus() : "Active");
            m.put("joinedDate", "2026-01-01");
            items.add(m);
        }
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("items", items, "page", page, "limit", limit, "total", items.size())));
    }

    @GetMapping("/alert-settings")
    public ResponseEntity<Map<String, Object>> getAlertSettings() {
        List<Map<String, Object>> items = List.of(
                Map.of("id", 1, "code", "LOW_STOCK", "name", "Cảnh báo hết hàng tồn", "threshold", 10, "isActive", true),
                Map.of("id", 2, "code", "EXPIRY_WARNING", "name", "Cảnh báo cận hạn sử dụng (ngày)", "threshold", 30, "isActive", true)
        );
        return ResponseEntity.ok(Map.of("success", true, "data", items));
    }

    @GetMapping("/system-logs")
    public ResponseEntity<Map<String, Object>> getSystemLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {
        List<Map<String, Object>> items = List.of(
                Map.of("id", 1, "action", "LOGIN", "username", "admin", "details", "Đăng nhập thành công từ IP 192.168.1.5", "timestamp", "2026-10-28 08:15:00"),
                Map.of("id", 2, "action", "ORDER_CREATED", "username", "admin", "details", "Tạo hóa đơn HD-4 thành công", "timestamp", "2026-10-28 14:20:00")
        );
        return ResponseEntity.ok(Map.of("success", true, "data", Map.of("items", items, "page", page, "limit", limit, "total", items.size())));
    }

    // 6. ANALYTICS & APPROVALS (Analytics moved to AnalyticsCompatController)
    @GetMapping("/approvals/pending")
    public ResponseEntity<Map<String, Object>> getPendingApprovals() {
        Map<String, Object> summary = Map.of("totalPending", 0, "byType", Collections.emptyMap());
        Map<String, Object> data = Map.of("summary", summary, "items", Collections.emptyList(), "page", 1, "limit", 20, "total", 0);
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }
}
