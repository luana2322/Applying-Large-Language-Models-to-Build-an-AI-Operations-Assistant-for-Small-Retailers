import { beforeEach, describe, expect, it, vi } from "vitest"

import { getCashTransactionById, getCashTransactionsList } from "./cashTransactionsApi"

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
  sessionStorage.clear()
})

function mockEnvelope(data: unknown) {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ success: true, data }),
  })
}

describe("cashTransactionsApi", () => {
  it("normalizes backend occurredOn into transactionDate for list rows", async () => {
    mockEnvelope({
      items: [
        {
          id: 1,
          transactionCode: "CT-001",
          direction: "Income",
          amount: 6272000,
          category: "SalesRevenue",
          status: "Completed",
          occurredOn: "2026-06-24",
        },
      ],
      page: 1,
      limit: 20,
      total: 1,
    })

    const page = await getCashTransactionsList()

    expect(page.items[0].transactionDate).toBe("2026-06-24")
  })

  it("normalizes backend occurredOn into transactionDate for detail responses", async () => {
    mockEnvelope({
      id: 1,
      transactionCode: "CT-001",
      direction: "Income",
      amount: 6272000,
      category: "SalesRevenue",
      status: "Completed",
      occurredOn: "2026-06-24",
    })

    const item = await getCashTransactionById(1)

    expect(item.transactionDate).toBe("2026-06-24")
  })
})
