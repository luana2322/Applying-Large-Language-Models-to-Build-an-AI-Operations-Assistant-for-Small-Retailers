package com.retail.assistant;

import com.retail.assistant.domain.entity.system.*;
import com.retail.assistant.domain.entity.catalog.*;
import com.retail.assistant.domain.entity.supplier.*;
import com.retail.assistant.domain.entity.sales.*;
import com.retail.assistant.domain.entity.inventory.*;
import com.retail.assistant.domain.entity.finance.*;
import com.retail.assistant.domain.entity.audit.*;
import com.retail.assistant.domain.entity.ai.*;
import com.retail.assistant.domain.repository.system.*;
import com.retail.assistant.domain.repository.catalog.*;
import com.retail.assistant.domain.repository.sales.*;
import com.retail.assistant.domain.repository.inventory.*;
import com.retail.assistant.domain.repository.finance.*;
import com.retail.assistant.domain.repository.ai.*;
import com.retail.assistant.domain.service.sales.*;
import com.retail.assistant.domain.service.inventory.*;
import com.retail.assistant.domain.service.finance.*;
import com.retail.assistant.domain.service.ai.*;
import com.retail.assistant.dto.tool.ToolDtos.*;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

import static org.junit.jupiter.api.Assertions.*;

/**
 * Ground-truth verification: builds a controlled, known dataset and asserts the
 * AI-facing services return exactly the expected business numbers. This validates
 * arithmetic independently of any LLM output.
 */
@SpringBootTest
class BusinessServicesGroundTruthTest {

    @Autowired private StoreRepository storeRepository;
    @Autowired private ProductRepository productRepository;
    @Autowired private InventoryRecordRepository inventoryRecordRepository;
    @Autowired private OrderRepository orderRepository;
    @Autowired private SalesService salesService;
    @Autowired private ProfitService profitService;
    @Autowired private InventoryService inventoryService;

    private Long storeId;
    private Product productA;
    private Product productB;
    private Product productC;

    private static final LocalDate D1 = LocalDate.of(2026, 3, 1);
    private static final LocalDate D2 = LocalDate.of(2026, 3, 2);

    @BeforeEach
    void setUp() {
        Store store = storeRepository.save(new Store(
            "GT-STORE-" + System.nanoTime(), "Ground Truth Store", "VND", "Asia/Ho_Chi_Minh"));
        storeId = store.getId();

        productA = productRepository.save(new Product(storeId, "GT-A-" + storeId, "Sản phẩm A", "Test", "Cái", 1000.0, 2000.0, 10));
        productB = productRepository.save(new Product(storeId, "GT-B-" + storeId, "Sản phẩm B", "Test", "Cái", 500.0, 1000.0, 5));
        productC = productRepository.save(new Product(storeId, "GT-C-" + storeId, "Sản phẩm C", "Test", "Cái", null, 3000.0, 10));

        inventoryRecordRepository.save(new InventoryRecord(storeId, productA, 5));   // LOW_STOCK (min 10)
        inventoryRecordRepository.save(new InventoryRecord(storeId, productB, 0));   // OUT_OF_STOCK
        inventoryRecordRepository.save(new InventoryRecord(storeId, productC, 20));  // NORMAL

        // O1 COMPLETED: A x2 @2000 = 4000, B x1 @1000 = 1000 ; gross 5000 discount 0 net 5000
        createOrder("GT-ORD-1-" + storeId, "COMPLETED", D1,
            new ItemSpec(productA, 2, 2000.0, 1000.0),
            new ItemSpec(productB, 1, 1000.0, 500.0));
        // O2 COMPLETED: A x3 @2000 = 6000 ; gross 6000 discount 1000 net 5000
        createOrder("GT-ORD-2-" + storeId, "COMPLETED", D2, 1000.0,
            new ItemSpec(productA, 3, 2000.0, 1000.0));
        // O3 CANCELLED: must be excluded everywhere
        createOrder("GT-ORD-3-" + storeId, "CANCELLED", D2,
            new ItemSpec(productA, 5, 2000.0, 1000.0));
        // O4 RETURNED: B x2 net 2000 -> counted as returns, not revenue
        createOrder("GT-ORD-4-" + storeId, "RETURNED", D2,
            new ItemSpec(productB, 2, 1000.0, 500.0));
    }

    private record ItemSpec(Product product, int qty, double unitPrice, double costPrice) {}

    private void createOrder(String code, String status, LocalDate date, ItemSpec... specs) {
        createOrder(code, status, date, 0.0, specs);
    }

    private void createOrder(String code, String status, LocalDate date, double discount, ItemSpec... specs) {
        LocalDateTime ts = date.atTime(10, 0);
        Order order = new Order(storeId, code, status, 0.0, discount, 0.0, "CASH", ts);
        double gross = 0.0;
        for (ItemSpec s : specs) {
            order.addItem(new OrderItem(s.product(), s.qty(), s.unitPrice(), s.costPrice()));
            gross += s.unitPrice() * s.qty();
        }
        order.setTotalGross(gross);
        order.setNetAmount(Math.max(0.0, gross - discount));
        orderRepository.save(order);
    }

    @Test
    @DisplayName("get_sales_summary: gross/discount/returns/net/order-count match ground truth")
    void salesSummaryGroundTruth() {
        SalesSummaryData data = salesService.getSalesSummary(storeId, D1.toString(), D2.toString(), "day");

        assertEquals(11000.0, data.gross_revenue(), 0.001);
        assertEquals(1000.0, data.total_discount(), 0.001);
        assertEquals(2000.0, data.total_returns(), 0.001);
        assertEquals(10000.0, data.net_revenue(), 0.001);
        assertEquals(2L, data.valid_order_count());
    }

    @Test
    @DisplayName("get_profit_summary: net revenue, COGS, gross profit and margin match ground truth")
    void profitSummaryGroundTruth() {
        ProfitSummaryData data = profitService.getProfitSummary(storeId, D1.toString(), D2.toString());

        // Net revenue = sum of completed item subtotals = 4000 + 1000 + 6000
        assertEquals(11000.0, data.net_revenue(), 0.001);
        // COGS = A (2+3)*1000 + B 1*500 = 5500
        assertEquals(5500.0, data.cost_of_goods_sold(), 0.001);
        assertEquals(5500.0, data.gross_profit(), 0.001);
        assertEquals(50.0, data.gross_margin_percentage(), 0.001);
        assertFalse(data.has_missing_cost());
    }

    @Test
    @DisplayName("get_profit_summary: flags missing cost data instead of faking a profit")
    void profitSummaryMissingCost() {
        // productC has no cost price; the order item has no cost snapshot either.
        Order o = new Order(storeId, "GT-ORD-NULLCOST-" + storeId, "COMPLETED", 0.0, 0.0, 3000.0, "CASH", D1.atTime(11, 0));
        OrderItem item = new OrderItem();
        item.setProduct(productC);
        item.setQuantity(1);
        item.setUnitPrice(3000.0);
        item.setSubtotal(3000.0);
        item.setCostPrice(null);
        o.addItem(item);
        o.setTotalGross(3000.0);
        orderRepository.save(o);

        ProfitSummaryData data = profitService.getProfitSummary(storeId, D1.toString(), D1.toString());
        assertTrue(data.has_missing_cost());
        assertNotNull(data.note());
    }

    @Test
    @DisplayName("get_top_products: ranking by quantity and by revenue match ground truth")
    void topProductsGroundTruth() {
        TopProductsData byQty = salesService.getTopProducts(storeId, D1.toString(), D2.toString(), "quantity", 10);
        assertEquals("Sản phẩm A", byQty.products().get(0).name());
        assertEquals(5L, byQty.products().get(0).quantity_sold());

        TopProductsData byRev = salesService.getTopProducts(storeId, D1.toString(), D2.toString(), "revenue", 10);
        assertEquals("Sản phẩm A", byRev.products().get(0).name());
        assertEquals(10000.0, byRev.products().get(0).net_revenue(), 0.001);
    }

    @Test
    @DisplayName("get_inventory_status: classifies low/out-of-stock using the real inventory table")
    void inventoryStatusGroundTruth() {
        InventoryStatusData all = inventoryService.getInventoryStatus(storeId, null, "Test", "all");
        assertEquals(3, all.total_items());
        assertEquals(1, all.low_stock_count());
        assertEquals(1, all.out_of_stock_count());

        InventoryStatusData low = inventoryService.getInventoryStatus(storeId, null, "Test", "low_stock");
        assertEquals(1, low.total_items());
        assertEquals("Sản phẩm A", low.items().get(0).name());

        InventoryStatusData out = inventoryService.getInventoryStatus(storeId, null, "Test", "out_of_stock");
        assertEquals(1, out.total_items());
        assertEquals("Sản phẩm B", out.items().get(0).name());
    }

    @Test
    @DisplayName("Sales period is inclusive and out-of-range orders are excluded")
    void salesPeriodBoundaries() {
        SalesSummaryData d1Only = salesService.getSalesSummary(storeId, D1.toString(), D1.toString(), "day");
        assertEquals(5000.0, d1Only.net_revenue(), 0.001);
        assertEquals(1L, d1Only.valid_order_count());
    }

    @Test
    @DisplayName("Unknown / non-existent dates fall back to defaults without throwing")
    void invalidDateFallsBackSafely() {
        assertNotNull(salesService.getSalesSummary(storeId, "not-a-date", null, "day"));
        assertNotNull(profitService.getProfitSummary(storeId, "15/03/2026", null));
    }
}
