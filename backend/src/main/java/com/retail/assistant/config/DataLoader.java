package com.retail.assistant.config;

import com.retail.assistant.domain.entity.*;
import com.retail.assistant.domain.repository.*;
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
        Store store1 = storeRepository.save(new Store("STORE-001", "Tạp Hóa Chú Bảy - Chi nhánh 1", "VND", "Asia/Ho_Chi_Minh"));
        Store store2 = storeRepository.save(new Store("STORE-002", "Tạp Hóa Cô Mai - Chi nhánh 2", "VND", "Asia/Ho_Chi_Minh"));

        Long storeId = store1.getId();

        // 2. Seed Products
        List<Product> products = new ArrayList<>();
        products.add(new Product(storeId, "SP001", "Nước ngọt Coca Cola 330ml", "Đồ uống", "Lon", 7500.0, 10000.0, 24));
        products.add(new Product(storeId, "SP002", "Nước ngọt Pepsi lon 330ml", "Đồ uống", "Lon", 7200.0, 10000.0, 24));
        products.add(new Product(storeId, "SP003", "Nước khoáng Aquafina 500ml", "Đồ uống", "Chai", 4000.0, 6000.0, 30));
        products.add(new Product(storeId, "SP004", "Nước tăng lực Red Bull 250ml", "Đồ uống", "Lon", 11000.0, 14000.0, 20));
        products.add(new Product(storeId, "SP005", "Trà xanh Không Độ 455ml", "Đồ uống", "Chai", 7000.0, 10000.0, 15));
        products.add(new Product(storeId, "SP006", "Sữa tươi Vinamilk có đường 180ml", "Sữa & Chế phẩm", "Hộp", 7500.0, 9500.0, 48));
        products.add(new Product(storeId, "SP007", "Sữa chua Vinamilk có đường 100g", "Sữa & Chế phẩm", "Hộp", 5500.0, 7000.0, 20));
        products.add(new Product(storeId, "SP008", "Mì Hảo Hảo tôm chua cay", "Mì & Lương thực", "Gói", 3800.0, 4500.0, 60));
        products.add(new Product(storeId, "SP009", "Mì Omachi sườn hầm ngũ quả", "Mì & Lương thực", "Gói", 7500.0, 9000.0, 30));
        products.add(new Product(storeId, "SP010", "Dầu ăn Simply đậu nành 1L", "Gia vị", "Chai", 48000.0, 56000.0, 10));
        products.add(new Product(storeId, "SP011", "Nước mắm Nam Ngư Đệ Nhị 900ml", "Gia vị", "Chai", 21000.0, 26000.0, 12));
        products.add(new Product(storeId, "SP012", "Bột ngọt Ajinomoto 454g", "Gia vị", "Gói", 28000.0, 34000.0, 10));
        products.add(new Product(storeId, "SP013", "Gạo ST25 thượng hạng túi 5kg", "Mì & Lương thực", "Túi", 145000.0, 180000.0, 6));
        products.add(new Product(storeId, "SP014", "Bánh Chocopie Orion hộp 12 cái", "Bánh kẹo", "Hộp", 42000.0, 52000.0, 10));
        products.add(new Product(storeId, "SP015", "Nước xả vải Comfort 800ml", "Hóa phẩm", "Túi", 45000.0, 55000.0, 8));
        products.add(new Product(storeId, "SP016", "Xà phòng Lifebuoy bảo vệ 90g", "Hóa phẩm", "Cục", 12000.0, 16000.0, 15));
        products.add(new Product(storeId, "SP017", "Nước rửa chén Sunlight Chanh 750g", "Hóa phẩm", "Chai", 24000.0, 30000.0, 12));
        products.add(new Product(storeId, "SP018", "Bia Tiger bạc lon 330ml", "Bia & Cồn", "Lon", 16500.0, 19500.0, 30));

        products = productRepository.saveAll(products);

        // 3. Seed Inventory Levels
        Map<String, Integer> stockLevels = Map.ofEntries(
            Map.entry("SP001", 18),  // Coca Cola - Low stock (min 24)
            Map.entry("SP002", 45),  // Pepsi
            Map.entry("SP003", 6),   // Aquafina - Low stock (min 30)
            Map.entry("SP004", 32),  // Red bull
            Map.entry("SP005", 25),  // Tra xanh
            Map.entry("SP006", 120), // Vinamilk sua
            Map.entry("SP007", 14),  // Vinamilk sua chua - Low stock (min 20)
            Map.entry("SP008", 15),  // Hao Hao - Low stock (min 60)
            Map.entry("SP009", 40),  // Omachi
            Map.entry("SP010", 15),  // Dau an Simply
            Map.entry("SP011", 18),  // Nuoc mam
            Map.entry("SP012", 22),  // Bot ngot
            Map.entry("SP013", 0),   // Gao ST25 - OUT OF STOCK (min 6)
            Map.entry("SP014", 28),  // Chocopie - Slow moving (stock 28, sells few)
            Map.entry("SP015", 3),   // Comfort - Low stock (min 8)
            Map.entry("SP016", 30),  // Lifebuoy
            Map.entry("SP017", 16),  // Sunlight
            Map.entry("SP018", 50)   // Tiger bac
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

                    // Bias towards Coca, Hao Hao, Vinamilk
                    int qty = 1 + random.nextInt(3);
                    if ("SP001".equals(chosen.getSku()) || "SP008".equals(chosen.getSku())) {
                        qty += random.nextInt(3);
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
