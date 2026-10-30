import { render, screen } from "@testing-library/react"
import { describe, expect, it } from "vitest"

import { calculateLedgerTotals } from "../lib/ledgerTotals"
import { LedgerTable } from "./LedgerTable"
import type { LedgerEntry } from "../types"

describe("calculateLedgerTotals", () => {
  it("totals signed amount, debit, credit and final balance", () => {
    const rows: LedgerEntry[] = [
      {
        id: 1,
        date: "2026-05-01",
        transactionCode: "FL-1",
        description: "Thu",
        amount: 3000,
        debit: 0,
        credit: 3000,
        balance: 3000,
      },
      {
        id: 2,
        date: "2026-05-02",
        transactionCode: "FL-2",
        description: "Chi",
        amount: -1000,
        debit: 1000,
        credit: 0,
        balance: 2000,
      },
    ]

    expect(calculateLedgerTotals(rows)).toEqual({
      amount: 2000,
      debit: 1000,
      credit: 3000,
      finalBalance: 2000,
    })
  })

  it("returns zero totals for empty data", () => {
    expect(calculateLedgerTotals([])).toEqual({
      amount: 0,
      debit: 0,
      credit: 0,
      finalBalance: 0,
    })
  })
})

function makeRow(overrides: Partial<LedgerEntry> = {}): LedgerEntry {
  return {
    id: 1,
    date: "2026-04-30",
    transactionCode: "FL-1",
    description: "Bán lẻ trong ngày",
    transactionType: "SalesRevenue",
    referenceType: "Manual",
    referenceId: 1,
    amount: 1000,
    debit: 0,
    credit: 1000,
    balance: 1000,
    ...overrides,
  }
}

describe("LedgerTable", () => {
  it("renders transaction type and source kind as localized badges", () => {
    render(
      <LedgerTable
        data={[
          makeRow({ id: 1, transactionType: "SalesRevenue", referenceType: "Manual" }),
          makeRow({ id: 2, transactionType: "OperatingExpense", referenceType: "DebtCollection" }),
          makeRow({ id: 3, transactionType: "PurchaseCost", referenceType: "PurchasePayment" }),
        ]}
      />,
    )

    expect(screen.getByText("Doanh thu bán")).toBeTruthy()
    expect(screen.getByText("Chi phí vận hành")).toBeTruthy()
    expect(screen.getByText("Giá vốn mua")).toBeTruthy()

    expect(screen.getByText("Thủ công")).toBeTruthy()
    expect(screen.getByText("Thu nợ KH")).toBeTruthy()
    expect(screen.getByText("Mua hàng")).toBeTruthy()
  })

  it("renders em-dash when transactionType / referenceType is missing", () => {
    render(
      <LedgerTable
        data={[makeRow({ id: 1, transactionType: undefined, referenceType: null })]}
      />,
    )

    const dashes = screen.getAllByText("—")
    expect(dashes.length).toBeGreaterThanOrEqual(2)
  })

  it("constrains the type-cell value to the column width to avoid overflow into the next column", () => {
    render(
      <LedgerTable
        data={[makeRow({ id: 1, transactionType: "OperatingExpense", referenceType: "Manual" })]}
      />,
    )

    const typeCell = screen.getByText("Chi phí vận hành")
    expect(typeCell.className).toMatch(/truncate/)
    expect(typeCell.className).not.toMatch(/border/)
    expect(typeCell.className).toMatch(/text-orange-600/)
  })
})
