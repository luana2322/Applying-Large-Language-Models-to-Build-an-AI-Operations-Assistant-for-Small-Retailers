package com.retail.assistant.dto.finance;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record FinanceLedgerRequest(String ledgerCode, LocalDate transactionDate, String transactionType, String referenceType, Long referenceId, BigDecimal amount, String description, Long createdById, LocalDateTime createdAt, LocalDateTime updatedAt) {}
