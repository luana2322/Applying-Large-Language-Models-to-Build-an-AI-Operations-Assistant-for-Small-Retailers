import { describe, expect, it } from "vitest"
import {
  ledgerSourceKindLabel,
  ledgerTransactionTypeLabel,
} from "./ledgerDisplayLabels"

describe("ledgerDisplayLabels", () => {
  describe("ledgerTransactionTypeLabel", () => {
    it("returns known labels", () => {
      expect(ledgerTransactionTypeLabel("SalesRevenue")).toBe("Doanh thu bán")
      expect(ledgerTransactionTypeLabel("OperatingExpense")).toBe("Chi phí vận hành")
    })

    it("returns em-dash for null/undefined", () => {
      expect(ledgerTransactionTypeLabel(null)).toBe("—")
      expect(ledgerTransactionTypeLabel(undefined)).toBe("—")
    })

    it("returns raw value when not mapped", () => {
      expect(ledgerTransactionTypeLabel("UnknownType")).toBe("UnknownType")
    })
  })

  describe("ledgerSourceKindLabel", () => {
    it("maps known source kinds to Vietnamese labels", () => {
      expect(ledgerSourceKindLabel("Manual")).toBe("Thủ công")
      expect(ledgerSourceKindLabel("DebtCollection")).toBe("Thu nợ KH")
      expect(ledgerSourceKindLabel("DebtPayment")).toBe("Trả nợ NCC")
      expect(ledgerSourceKindLabel("PurchasePayment")).toBe("Mua hàng")
    })

    it("returns em-dash for null/undefined", () => {
      expect(ledgerSourceKindLabel(null)).toBe("—")
      expect(ledgerSourceKindLabel(undefined)).toBe("—")
    })

    it("returns raw value when not mapped", () => {
      expect(ledgerSourceKindLabel("SomethingElse")).toBe("SomethingElse")
    })
  })
})
