package com.retail.assistant.domain.service;

import com.retail.assistant.domain.entity.Expense;
import com.retail.assistant.domain.repository.ExpenseRepository;
import com.retail.assistant.dto.ToolDtos.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeParseException;
import java.util.*;

@Service
@Transactional(readOnly = true)
public class ExpenseService {

    private final ExpenseRepository expenseRepository;

    public ExpenseService(ExpenseRepository expenseRepository) {
        this.expenseRepository = expenseRepository;
    }

    public ExpenseSummaryData getExpenseSummary(Long storeId, String startDateStr, String endDateStr, String categoryFilter) {
        LocalDate start = parseDate(startDateStr, LocalDate.now().minusDays(30));
        LocalDate end = parseDate(endDateStr, LocalDate.now());

        List<Expense> expenses = expenseRepository.findByStoreIdAndExpenseDateBetween(storeId, start, end);

        double totalExpense = 0.0;
        Map<String, double[]> categoryMap = new HashMap<>(); // [0] = amount, [1] = count

        for (Expense e : expenses) {
            if (categoryFilter != null && !categoryFilter.isBlank() && !categoryFilter.equalsIgnoreCase(e.getCategory())) {
                continue;
            }

            double amount = e.getAmount() != null ? e.getAmount() : 0.0;
            totalExpense += amount;

            String cat = (e.getCategory() != null && !e.getCategory().isBlank()) ? e.getCategory() : "Khác";
            double[] agg = categoryMap.computeIfAbsent(cat, k -> new double[]{0.0, 0.0});
            agg[0] += amount;
            agg[1] += 1.0;
        }

        List<ExpenseCategoryItem> categoryItems = new ArrayList<>();
        for (var entry : categoryMap.entrySet()) {
            categoryItems.add(new ExpenseCategoryItem(
                entry.getKey(),
                Math.round(entry.getValue()[0] * 100.0) / 100.0,
                (long) entry.getValue()[1]
            ));
        }

        return new ExpenseSummaryData(
            start.toString(),
            end.toString(),
            Math.round(totalExpense * 100.0) / 100.0,
            categoryItems,
            "VND"
        );
    }

    private LocalDate parseDate(String dateStr, LocalDate defaultDate) {
        if (dateStr == null || dateStr.isBlank()) return defaultDate;
        try {
            return LocalDate.parse(dateStr.trim());
        } catch (DateTimeParseException e) {
            return defaultDate;
        }
    }
}
