package com.retail.assistant.config;

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
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataLoader implements CommandLineRunner {

    @Value("${app.seed-data.enabled:true}")
    private boolean seedDataEnabled;

    private final StoreRepository storeRepository;
    private final ProductRepository productRepository;
    private final InventoryRecordRepository inventoryRecordRepository;
    private final OrderRepository orderRepository;
    private final ExpenseRepository expenseRepository;

    public DataLoader(
        StoreRepository storeRepository,
        ProductRepository productRepository,
        InventoryRecordRepository inventoryRecordRepository,
        OrderRepository orderRepository,
        ExpenseRepository expenseRepository
    ) {
        this.storeRepository = storeRepository;
        this.productRepository = productRepository;
        this.inventoryRecordRepository = inventoryRecordRepository;
        this.orderRepository = orderRepository;
        this.expenseRepository = expenseRepository;
    }

    @Override
    public void run(String... args) {
        if (!seedDataEnabled) {
            return; // Seeding disabled for this environment (e.g. production)
        }
        if (storeRepository.count() > 0) {
            return; // Data already seeded / real data already present
        }

        // 1. Seed Stores
        Store store1 = storeRepository.save(new Store("STORE-001", "Tổng kho Điện Nước & Thiết Bị Vệ Sinh SmartRetail", "VND", "Asia/Ho_Chi_Minh"));
        Store store2 = storeRepository.save(new Store("STORE-002", "Đại lý Cấp 1 Minh Thành - Cầu Giấy", "VND", "Asia/Ho_Chi_Minh"));

        Long storeId = store1.getId();

        // 2. Seed Products (Vật tư Điện Nước chuyên dụng)
        List<Product> products = new ArrayList<>();
        products.add(new Product(storeId, "DN-TP-PVC27", "Ống nhựa PVC Tiền Phong C2 D27 (Cây 4m)", "Ống & Phụ kiện PVC", "Cây", 28000.0, 36000.0, 30));
        products.add(new Product(storeId, "DN-TP-PVC34", "Ống nhựa PVC Tiền Phong C2 D34 (Cây 4m)", "Ống & Phụ kiện PVC", "Cây", 38000.0, 48000.0, 20));
        products.add(new Product(storeId, "DN-TP-PVC48", "Ống thoát nước PVC Tiền Phong C1 D48 (Cây 4m)", "Ống & Phụ kiện PVC", "Cây", 52000.0, 68000.0, 15));
        products.add(new Product(storeId, "DN-TP-CUT27", "Cút vuông 90 độ PVC Tiền Phong D27", "Ống & Phụ kiện PVC", "Cái", 3500.0, 5000.0, 50));
        products.add(new Product(storeId, "DN-TP-TE27", "Tê đều PVC Tiền Phong D27", "Ống & Phụ kiện PVC", "Cái", 4800.0, 7000.0, 40));
        products.add(new Product(storeId, "DN-TP-PPR25", "Ống nước nóng PPR Tiền Phong PN20 D25", "Ống hàn nhiệt PPR", "Cây", 65000.0, 85000.0, 25));
        products.add(new Product(storeId, "DD-CAD-15", "Dây điện đôi Cadivi VCmd 2x1.5mm2", "Dây & Cáp điện", "Cuộn", 580000.0, 720000.0, 10));
        products.add(new Product(storeId, "DD-CAD-25", "Dây điện đơn Cadivi CV 2.5mm2 Ruột đồng", "Dây & Cáp điện", "Cuộn", 720000.0, 890000.0, 15));
        products.add(new Product(storeId, "DD-CAD-40", "Dây cáp điện đơn Cadivi CV 4.0mm2", "Dây & Cáp điện", "Cuộn", 1150000.0, 1380000.0, 8));
        products.add(new Product(storeId, "TB-PANA-CB20", "Aptomat khối 2P Panasonic 20A 1.5kA", "Thiết bị đóng cắt", "Cái", 82000.0, 105000.0, 15));
        products.add(new Product(storeId, "TB-PANA-CB30", "Aptomat chống giật RCBO Panasonic 30A 30mA", "Thiết bị đóng cắt", "Cái", 380000.0, 480000.0, 8));
        products.add(new Product(storeId, "TB-SINO-O2", "Ổ cắm đôi 3 chấu có màn che Sino S18", "Công tắc & Ổ cắm", "Cái", 28000.0, 38000.0, 30));
        products.add(new Product(storeId, "TB-SINO-CT1", "Công tắc đơn 1 chiều Sino Vanlock S18", "Công tắc & Ổ cắm", "Cái", 16000.0, 23000.0, 40));
        products.add(new Product(storeId, "TB-RD-LED18", "Đèn LED bán nguyệt Rạng Đông 18W 0.6m", "Thiết bị chiếu sáng", "Chiếc", 95000.0, 135000.0, 20));
        products.add(new Product(storeId, "TB-RD-DOWN9", "Đèn LED âm trần Downlight Rạng Đông 9W", "Thiết bị chiếu sáng", "Chiếc", 58000.0, 78000.0, 25));
        products.add(new Product(storeId, "VS-INAX-AL299", "Chậu Lavabo sứ đặt bàn INAX AL-299V", "Thiết bị vệ sinh", "Bộ", 1450000.0, 1850000.0, 5));
        products.add(new Product(storeId, "VS-INAX-V102", "Vòi chậu Lavabo nước lạnh INAX LFV-102S", "Thiết bị vệ sinh", "Chiếc", 620000.0, 780000.0, 8));
        products.add(new Product(storeId, "VS-INAX-SEN01", "Sen tắm nóng lạnh Inax BFV-1113S tay sen mạ Crom", "Thiết bị vệ sinh", "Bộ", 1850000.0, 2350000.0, 4));
        products.add(new Product(storeId, "PK-MH-VAN27", "Van bi đồng tay gạt Minh Hòa D27", "Van vòi & Phụ kiện", "Cái", 65000.0, 85000.0, 20));
        products.add(new Product(storeId, "PK-BG-CS", "Cuộn băng tan quấn ren cao su non Tombo", "Vật tư phụ", "Cuộn", 5000.0, 8000.0, 100));

        products = productRepository.saveAll(products);

        // 3. Seed Inventory Levels
        Map<String, Integer> stockLevels = Map.ofEntries(
            Map.entry("DN-TP-PVC27", 180),
            Map.entry("DN-TP-PVC34", 95),
            Map.entry("DN-TP-PVC48", 40),
            Map.entry("DN-TP-CUT27", 250),
            Map.entry("DN-TP-TE27", 180),
            Map.entry("DN-TP-PPR25", 8),   // Low stock (min 25)
            Map.entry("DD-CAD-15", 35),
            Map.entry("DD-CAD-25", 4),    // Low stock (min 15)
            Map.entry("DD-CAD-40", 12),
            Map.entry("TB-PANA-CB20", 50),
            Map.entry("TB-PANA-CB30", 5),  // Low stock (min 8)
            Map.entry("TB-SINO-O2", 120),
            Map.entry("TB-SINO-CT1", 160),
            Map.entry("TB-RD-LED18", 45),
            Map.entry("TB-RD-DOWN9", 60),
            Map.entry("VS-INAX-AL299", 2), // Low stock (min 5)
            Map.entry("VS-INAX-V102", 7),
            Map.entry("VS-INAX-SEN01", 3), // Low stock (min 4)
            Map.entry("PK-MH-VAN27", 45),
            Map.entry("PK-BG-CS", 200)
        );

        for (Product p : products) {
            int stock = stockLevels.getOrDefault(p.getSku(), 20);
            inventoryRecordRepository.save(new InventoryRecord(storeId, p, stock));
        }

        // 4. Seed Orders for past 60 days
        LocalDate today = LocalDate.now();
        Random random = new Random(42); // fixed seed for determinism in testing!

        long orderSequence = 1;
        for (int dayOffset = 59; dayOffset >= 0; dayOffset--) {
            LocalDate orderDate = today.minusDays(dayOffset);
            // 2 to 6 orders per day
            int ordersToday = 2 + random.nextInt(5);

            for (int i = 0; i < ordersToday; i++) {
                LocalDateTime orderTime = orderDate.atTime(8 + random.nextInt(12), random.nextInt(60), random.nextInt(60));
                String orderCode = String.format("ORD-%04d%02d%02d-%03d", orderDate.getYear(), orderDate.getMonthValue(), orderDate.getDayOfMonth(), i + 1);

                // High chance COMPLETED, small chance CANCELLED or RETURNED
                int statusRoll = random.nextInt(100);
                String status = (statusRoll < 93) ? "COMPLETED" : (statusRoll < 97 ? "CANCELLED" : "RETURNED");

                Order order = new Order(storeId, orderCode, status, 0.0, 0.0, 0.0, (random.nextBoolean() ? "CASH" : "QR_VNPAY"), orderTime);

                // Add 1 to 4 random products to basket
                int itemCount = 1 + random.nextInt(4);
                double gross = 0.0;
                Set<Product> chosenProducts = new HashSet<>();

                for (int it = 0; it < itemCount; it++) {
                    Product chosen = products.get(random.nextInt(products.size()));
                    if (chosenProducts.contains(chosen)) continue;
                    chosenProducts.add(chosen);

                    // Bias towards essential electrical and PVC supplies
                    int qty = 1 + random.nextInt(5);
                    if ("DN-TP-PVC27".equals(chosen.getSku()) || "DD-CAD-15".equals(chosen.getSku())) {
                        qty += random.nextInt(10);
                    }

                    double unitPrice = chosen.getSellingPrice();
                    double cost = chosen.getCostPrice();
                    OrderItem orderItem = new OrderItem(chosen, qty, unitPrice, cost);
                    order.addItem(orderItem);
                    gross += (unitPrice * qty);
                }

                double discount = (gross > 100000 && random.nextInt(10) < 3) ? 5000.0 : 0.0;
                order.setTotalGross(gross);
                order.setDiscount(discount);
                order.setNetAmount(Math.max(0.0, gross - discount));

                orderRepository.save(order);
                orderSequence++;
            }
        }

        // 5. Seed Monthly Expenses
        expenseRepository.save(new Expense(storeId, "Mặt bằng", 8000000.0, "Tiền thuê mặt bằng tháng 9", today.minusMonths(1).withDayOfMonth(5)));
        expenseRepository.save(new Expense(storeId, "Điện nước", 1450000.0, "Hóa đơn điện nước tháng 9", today.minusMonths(1).withDayOfMonth(12)));
        expenseRepository.save(new Expense(storeId, "Internet", 320000.0, "Cước viễn thông VNPT", today.minusMonths(1).withDayOfMonth(15)));
        expenseRepository.save(new Expense(storeId, "Nhân viên", 6000000.0, "Lương nhân viên bán ca tối", today.minusMonths(1).withDayOfMonth(30)));

        expenseRepository.save(new Expense(storeId, "Mặt bằng", 8000000.0, "Tiền thuê mặt bằng tháng này", today.withDayOfMonth(5)));
        expenseRepository.save(new Expense(storeId, "Điện nước", 1620000.0, "Hóa đơn điện nước tháng này", today.withDayOfMonth(10)));
        expenseRepository.save(new Expense(storeId, "Bao bì", 450000.0, "Túi nilon tự hủy và băng keo", today.minusDays(7)));
    }
}
