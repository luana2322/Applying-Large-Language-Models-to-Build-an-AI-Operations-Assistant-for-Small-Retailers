import { describe, expect, it } from "vitest"
import type { Debt } from "../types"
import { getDebtPaymentCopy, isDebtPayable } from "./debtPaymentUi"

describe("debtPaymentUi", () => {
  it("returns customer collection copy", () => {
    const debt: Pick<Debt, "partnerType"> = { partnerType: "Customer" }

    expect(getDebtPaymentCopy(debt)).toEqual({
      actionLabel: "Ghi thu nợ",
      successMessage: "Đã ghi thu nợ thành công",
      errorMessage: "Không ghi được khoản thu nợ",
      panelTitle: "Ghi thu nợ",
      historyTitle: "Lịch sử thu nợ",
    })
  })

  it("returns supplier payment copy", () => {
    const debt: Pick<Debt, "partnerType"> = { partnerType: "Supplier" }

    expect(getDebtPaymentCopy(debt)).toEqual({
      actionLabel: "Ghi trả nợ",
      successMessage: "Đã ghi trả nợ thành công",
      errorMessage: "Không ghi được khoản trả nợ",
      panelTitle: "Ghi trả nợ",
      historyTitle: "Lịch sử trả nợ",
    })
  })

  it("treats cleared and zero-remaining debts as not payable", () => {
    const clearedDebt: Pick<Debt, "status" | "remainingAmount"> = { status: "Cleared", remainingAmount: 10 }
    const zeroRemainingDebt: Pick<Debt, "status" | "remainingAmount"> = { status: "Partial", remainingAmount: 0 }

    expect(isDebtPayable(clearedDebt)).toBe(false)
    expect(isDebtPayable(zeroRemainingDebt)).toBe(false)
  })

  it("treats in-debt remaining balances as payable", () => {
    const payableDebt: Pick<Debt, "status" | "remainingAmount"> = { status: "InDebt", remainingAmount: 125000 }

    expect(isDebtPayable(payableDebt)).toBe(true)
  })
})
