import { beforeEach, describe, expect, it, vi } from "vitest"

import { closeDailyCash, getDailyClose } from "./dailyCashClosingsApi"

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

describe("dailyCashClosingsApi", () => {
  it("gets daily close preview/state by fundId + businessDate", async () => {
    mockEnvelope({
      id: null,
      fundId: 1,
      businessDate: "2026-06-20",
      expectedCash: 400000,
      countedCash: null,
      variance: null,
      notes: null,
      status: "Open",
      closedBy: null,
      closedAt: null,
    })

    await getDailyClose(1, "2026-06-20")

    const calledUrl = String(fetchMock.mock.calls[0][0])
    expect(calledUrl).toContain("/api/v1/cashflow/daily-close?")
    expect(calledUrl).toContain("fundId=1")
    expect(calledUrl).toContain("businessDate=2026-06-20")
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "GET" })
  })

  it("closes daily cash via PUT /api/v1/cashflow/daily-close", async () => {
    mockEnvelope({
      id: 10,
      fundId: 1,
      businessDate: "2026-06-20",
      expectedCash: 400000,
      countedCash: 390000,
      variance: -10000,
      notes: "Thiếu tiền lẻ",
      status: "Closed",
      closedBy: 1,
      closedAt: "2026-06-20T10:00:00Z",
    })

    const body = { fundId: 1, businessDate: "2026-06-20", countedCash: 390000, notes: "Thiếu tiền lẻ" }
    await closeDailyCash(body)

    expect(String(fetchMock.mock.calls[0][0])).toContain("/api/v1/cashflow/daily-close")
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "PUT" })
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body))).toEqual(body)
  })
})
