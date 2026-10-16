package com.retail.assistant.domain.repository.finance;

import com.retail.assistant.domain.entity.finance.Expense;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;
import java.time.LocalDate;
import java.util.List;

@Repository
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByStoreIdAndExpenseDateBetween(Long storeId, LocalDate start, LocalDate end);

    @Query("SELECT e.category AS category, SUM(e.amount) AS totalAmount, COUNT(e.id) AS transactionCount " +
           "FROM Expense e " +
           "WHERE e.storeId = :storeId AND e.expenseDate >= :start AND e.expenseDate <= :end " +
           "GROUP BY e.category")
    List<ExpenseCategoryProjection> findExpensesGroupedByCategory(
        @Param("storeId") Long storeId,
        @Param("start") LocalDate start,
        @Param("end") LocalDate end
    );

    interface ExpenseCategoryProjection {
        String getCategory();
        Double getTotalAmount();
        Long getTransactionCount();
    }
}
