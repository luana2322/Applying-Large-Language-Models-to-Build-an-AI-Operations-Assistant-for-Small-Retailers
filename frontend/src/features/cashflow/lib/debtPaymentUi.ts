import type { Debt } from "../types"

export type DebtPaymentUiCopy = {
  actionLabel: string
  successMessage: string
  errorMessage: string
  panelTitle: string
  historyTitle: string
}

const CUSTOMER_COPY: DebtPaymentUiCopy = {
  actionLabel: "Ghi thu nợ",
  successMessage: "Đã ghi thu nợ thành công",
  errorMessage: "Không ghi được khoản thu nợ",
  panelTitle: "Ghi thu nợ",
  historyTitle: "Lịch sử thu nợ",
}

const SUPPLIER_COPY: DebtPaymentUiCopy = {
  actionLabel: "Ghi trả nợ",
  successMessage: "Đã ghi trả nợ thành công",
  errorMessage: "Không ghi được khoản trả nợ",
  panelTitle: "Ghi trả nợ",
  historyTitle: "Lịch sử trả nợ",
}

export function isDebtPayable(debt: Pick<Debt, "status" | "remainingAmount">) {
  return debt.status !== "Cleared" && debt.remainingAmount > 0
}

export function getDebtPaymentCopy(debt: Pick<Debt, "partnerType">): DebtPaymentUiCopy {
  return debt.partnerType === "Customer" ? CUSTOMER_COPY : SUPPLIER_COPY
}
