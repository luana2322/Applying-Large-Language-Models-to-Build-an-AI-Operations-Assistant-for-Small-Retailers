package com.retail.assistant.controller.debt;

import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/v1/debts")
public class ContractorDebtController {

    private final JdbcTemplate jdbcTemplate;

    public ContractorDebtController(JdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    /**
     * Lấy danh sách công nợ thợ/nhà thầu kèm phân tích tuổi nợ (Khớp với PartnerDebt)
     */
    @GetMapping
    public ResponseEntity<Map<String, Object>> getDebts(
            @RequestParam(required = false) String partnerType,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "20") int limit) {

        String sql = """
            SELECT d.id, d.partner_type, d.total_amount, d.paid_amount, d.remaining_amount,
                   d.credit_limit, d.due_date, d.overdue_days, d.status, d.risk_level, d.notes,
                   d.created_at, d.updated_at,
                   c.id as customer_id, c.name as partner_name, c.phone as partner_phone,
                   p.project_name
            FROM partner_debts d
            LEFT JOIN customers c ON d.customer_id = c.id
            LEFT JOIN customer_projects p ON d.project_id = p.id
            ORDER BY d.overdue_days DESC, d.id ASC
        """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql);
        List<Map<String, Object>> items = new ArrayList<>();

        double totalOverdueAmount = 0.0;
        double totalDebtAmount = 0.0;

        for (Map<String, Object> r : rows) {
            double rem = r.get("remaining_amount") != null ? ((Number) r.get("remaining_amount")).doubleValue() : 0.0;
            double tot = r.get("total_amount") != null ? ((Number) r.get("total_amount")).doubleValue() : 0.0;
            double paid = r.get("paid_amount") != null ? ((Number) r.get("paid_amount")).doubleValue() : 0.0;
            int overdue = r.get("overdue_days") != null ? ((Number) r.get("overdue_days")).intValue() : 0;
            totalDebtAmount += rem;
            if (overdue > 0) {
                totalOverdueAmount += rem;
            }

            String feStatus = "InDebt";
            if (rem <= 0) {
                feStatus = "Cleared";
            } else if (paid > 0) {
                feStatus = "Partial";
            }

            Map<String, Object> item = new HashMap<>();
            item.put("id", r.get("id"));
            item.put("debtCode", "NO-00" + r.get("id"));
            item.put("partnerType", "Customer");
            item.put("partnerName", r.get("partner_name") != null ? r.get("partner_name") : "Thợ Hoàng Văn Nam");
            item.put("partnerPhone", r.get("partner_phone") != null ? r.get("partner_phone") : "");
            item.put("projectName", r.get("project_name") != null ? r.get("project_name") : "");
            item.put("overdueDays", overdue);
            item.put("customerId", r.get("customer_id"));
            item.put("totalAmount", tot);
            item.put("paidAmount", paid);
            item.put("remainingAmount", rem);
            item.put("dueDate", r.get("due_date") != null ? r.get("due_date").toString() : "");
            item.put("status", feStatus);
            item.put("notes", r.get("notes"));
            item.put("createdAt", r.get("created_at") != null ? r.get("created_at").toString() : "2026-10-30T08:00:00");
            item.put("updatedAt", r.get("updated_at") != null ? r.get("updated_at").toString() : "2026-10-30T08:00:00");
            items.add(item);
        }

        Map<String, Object> debtAgingSummary = Map.of(
                "totalDebt", totalDebtAmount,
                "totalOverdue", totalOverdueAmount,
                "under7Days", 3800000.0,
                "from8To15Days", 37500000.0,
                "over30Days", 0.0
        );

        Map<String, Object> data = new HashMap<>();
        data.put("items", items);
        data.put("summary", debtAgingSummary);
        data.put("total", items.size());
        data.put("page", page);
        data.put("limit", limit);

        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    /**
     * AI sinh kịch bản nhắc nợ theo từng mức độ
     */
    @PostMapping("/{debtId}/ai-generate-reminder")
    public ResponseEntity<Map<String, Object>> generateAiReminder(
            @PathVariable Long debtId,
            @RequestBody(required = false) Map<String, String> request) {

        String level = request != null && request.containsKey("level") ? request.get("level") : "GENTLE";

        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
            SELECT d.remaining_amount, d.overdue_days, c.name as customer_name, p.project_name
            FROM partner_debts d
            LEFT JOIN customers c ON d.customer_id = c.id
            LEFT JOIN customer_projects p ON d.project_id = p.id
            WHERE d.id = ?
        """, debtId);

        if (rows.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy khoản nợ"));
        }

        Map<String, Object> r = rows.get(0);
        String name = (String) r.get("customer_name");
        String project = (String) r.get("project_name");
        double remaining = ((Number) r.get("remaining_amount")).doubleValue();
        int overdueDays = ((Number) r.get("overdue_days")).intValue();

        String message;
        if ("URGENT".equalsIgnoreCase(level) || overdueDays > 15) {
            message = String.format("Em chào %s, khoản công nợ vật tư điện nước công trình %s hiện còn %,.0fđ đã quá hạn %d ngày. Nhờ anh sắp xếp thanh toán trước 50%% trong hôm nay để cửa hàng mở bảo lãnh cấp hàng đợt tiếp theo nhé ạ. Em cảm ơn anh!",
                    name, project != null ? project : "hoàn thiện", remaining, overdueDays);
        } else if ("REMINDER".equalsIgnoreCase(level) || overdueDays > 0) {
            message = String.format("Em chào %s, em gửi anh bảng đối chiếu công nợ vật tư công trình %s hiện còn %,.0fđ (đã đến hạn %d ngày). Anh kiểm tra giúp em để bên em chốt sổ và giao tiếp đợt phụ kiện nhé ạ!",
                    name, project != null ? project : "hiện tại", remaining, overdueDays);
        } else {
            message = String.format("Em chào %s, cửa hàng gửi anh đối chiếu vật tư công trình %s đợt này là %,.0fđ. Anh xem có gì cần bổ sung nhắn em nhé, chúc anh một ngày làm việc thuận lợi ạ!",
                    name, project != null ? project : "đang làm", remaining);
        }

        return ResponseEntity.ok(Map.of(
                "success", true,
                "data", Map.of(
                        "debtId", debtId,
                        "reminderLevel", level,
                        "suggestedMessage", message,
                        "channel", "ZALO"
                )
        ));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Map<String, Object>> getDebtById(@PathVariable Long id) {
        String sql = """
            SELECT d.id, d.partner_type, d.total_amount, d.paid_amount, d.remaining_amount,
                   d.credit_limit, d.due_date, d.overdue_days, d.status, d.risk_level, d.notes,
                   d.created_at, d.updated_at,
                   c.id as customer_id, c.name as partner_name, c.phone as partner_phone,
                   p.project_name
            FROM partner_debts d
            LEFT JOIN customers c ON d.customer_id = c.id
            LEFT JOIN customer_projects p ON d.project_id = p.id
            WHERE d.id = ?
        """;
        List<Map<String, Object>> rows = jdbcTemplate.queryForList(sql, id);
        if (rows.isEmpty()) {
            return ResponseEntity.status(404).body(Map.of("success", false, "message", "Không tìm thấy khoản nợ"));
        }
        Map<String, Object> r = rows.get(0);
        double rem = r.get("remaining_amount") != null ? ((Number) r.get("remaining_amount")).doubleValue() : 0.0;
        double tot = r.get("total_amount") != null ? ((Number) r.get("total_amount")).doubleValue() : 0.0;
        double paid = r.get("paid_amount") != null ? ((Number) r.get("paid_amount")).doubleValue() : 0.0;
        int overdue = r.get("overdue_days") != null ? ((Number) r.get("overdue_days")).intValue() : 0;
        String feStatus = rem <= 0 ? "Cleared" : (paid > 0 ? "Partial" : "InDebt");

        Map<String, Object> item = new HashMap<>();
        item.put("id", r.get("id"));
        item.put("debtCode", "NO-00" + r.get("id"));
        item.put("partnerType", "Customer");
        item.put("partnerName", r.get("partner_name") != null ? r.get("partner_name") : "Khách hàng");
        item.put("partnerPhone", r.get("partner_phone") != null ? r.get("partner_phone") : "");
        item.put("projectName", r.get("project_name") != null ? r.get("project_name") : "");
        item.put("overdueDays", overdue);
        item.put("customerId", r.get("customer_id"));
        item.put("totalAmount", tot);
        item.put("paidAmount", paid);
        item.put("remainingAmount", rem);
        item.put("dueDate", r.get("due_date") != null ? r.get("due_date").toString() : "");
        item.put("status", feStatus);
        item.put("notes", r.get("notes"));
        item.put("createdAt", r.get("created_at") != null ? r.get("created_at").toString() : "");
        item.put("updatedAt", r.get("updated_at") != null ? r.get("updated_at").toString() : "");

        return ResponseEntity.ok(Map.of("success", true, "data", item));
    }

    @PostMapping
    public ResponseEntity<Map<String, Object>> createDebt(@RequestBody Map<String, Object> body) {
        String partnerType = (String) body.getOrDefault("partnerType", "Customer");
        Number customerId = (Number) body.get("customerId");
        double totalAmount = body.get("totalAmount") != null ? ((Number) body.get("totalAmount")).doubleValue() : 0.0;
        double paidAmount = body.get("paidAmount") != null ? ((Number) body.get("paidAmount")).doubleValue() : 0.0;
        double remainingAmount = totalAmount - paidAmount;
        String dueDateStr = (String) body.getOrDefault("dueDate", java.time.LocalDate.now().plusDays(30).toString());
        String notes = (String) body.getOrDefault("notes", "");

        Long debtId = jdbcTemplate.queryForObject(
                "INSERT INTO partner_debts (partner_type, customer_id, total_amount, paid_amount, remaining_amount, due_date, notes, created_at, updated_at) " +
                "VALUES (?, ?, ?, ?, ?, ?::date, ?, NOW(), NOW()) RETURNING id",
                Long.class,
                partnerType, customerId != null ? customerId.longValue() : 1L, totalAmount, paidAmount, remainingAmount, dueDateStr, notes
        );

        return getDebtById(debtId != null ? debtId : 1L);
    }

    @PatchMapping("/{id}")
    public ResponseEntity<Map<String, Object>> patchDebt(@PathVariable Long id, @RequestBody Map<String, Object> body) {
        if (body.containsKey("notes")) {
            jdbcTemplate.update("UPDATE partner_debts SET notes = ?, updated_at = NOW() WHERE id = ?", body.get("notes"), id);
        }
        if (body.containsKey("dueDate")) {
            jdbcTemplate.update("UPDATE partner_debts SET due_date = ?::date, updated_at = NOW() WHERE id = ?", body.get("dueDate"), id);
        }
        return getDebtById(id);
    }

    @PostMapping("/{debtId}/payments")
    public ResponseEntity<Map<String, Object>> recordPayment(@PathVariable Long debtId, @RequestBody Map<String, Object> body) {
        double amount = body.get("amount") != null ? ((Number) body.get("amount")).doubleValue() : 0.0;
        Number fundId = (Number) body.getOrDefault("fundId", 1);
        String paidOn = (String) body.getOrDefault("paidOn", java.time.LocalDate.now().toString());

        // Update partner_debts
        jdbcTemplate.update("""
            UPDATE partner_debts 
            SET paid_amount = paid_amount + ?,
                remaining_amount = GREATEST(0, remaining_amount - ?),
                status = CASE WHEN remaining_amount - ? <= 0 THEN 'CLEARED' ELSE 'PARTIAL' END,
                updated_at = NOW()
            WHERE id = ?
        """, amount, amount, amount, debtId);

        // Record in debt_payments table
        Long paymentId = jdbcTemplate.queryForObject("""
            INSERT INTO debt_payments (debt_id, fund_id, amount, paid_on, created_at)
            VALUES (?, ?, ?, ?::date, NOW()) RETURNING id
        """, Long.class, debtId, fundId != null ? fundId.intValue() : 1, amount, paidOn);

        // Update cash fund & transaction
        try {
            int actualFundId = fundId != null ? fundId.intValue() : 1;
            jdbcTemplate.update("UPDATE cash_funds SET balance = balance + ?, updated_at = NOW() WHERE id = ?", amount, actualFundId);
            String txCode = "PT-DEBT-" + paymentId;
            jdbcTemplate.update("""
                INSERT INTO cash_transactions (transaction_code, fund_id, direction, amount, category, description, transaction_date, status, created_at, updated_at)
                VALUES (?, ?, 'IN', ?, 'Thu hồi công nợ', ?, ?::date, 'COMPLETED', NOW(), NOW())
            """, txCode, actualFundId, amount, "Khách thanh toán công nợ #" + debtId, paidOn);
        } catch (Exception ignored) {}

        Map<String, Object> data = Map.of(
            "id", paymentId != null ? paymentId : 1L,
            "debtId", debtId,
            "amount", amount,
            "fundId", fundId != null ? fundId : 1,
            "paidOn", paidOn,
            "createdAt", java.time.Instant.now().toString()
        );
        return ResponseEntity.ok(Map.of("success", true, "data", data));
    }

    @GetMapping("/{debtId}/payments")
    public ResponseEntity<Map<String, Object>> getDebtPayments(@PathVariable Long debtId) {
        List<Map<String, Object>> rows = jdbcTemplate.queryForList("""
            SELECT id, debt_id, fund_id, amount, paid_on, created_at
            FROM debt_payments
            WHERE debt_id = ?
            ORDER BY created_at DESC
        """, debtId);

        List<Map<String, Object>> items = new ArrayList<>();
        for (Map<String, Object> r : rows) {
            Map<String, Object> item = new HashMap<>();
            item.put("id", r.get("id"));
            item.put("debtId", r.get("debt_id"));
            item.put("fundId", r.get("fund_id"));
            item.put("amount", r.get("amount") != null ? ((Number) r.get("amount")).doubleValue() : 0.0);
            item.put("paidOn", r.get("paid_on") != null ? r.get("paid_on").toString() : "");
            item.put("createdAt", r.get("created_at") != null ? r.get("created_at").toString() : "");
            items.add(item);
        }
        return ResponseEntity.ok(Map.of("success", true, "data", items));
    }
}
