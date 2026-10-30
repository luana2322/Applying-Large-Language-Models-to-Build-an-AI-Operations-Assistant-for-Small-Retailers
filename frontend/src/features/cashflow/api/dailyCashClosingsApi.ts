import { apiJson } from "@/lib/api/http"

export const DAILY_CASH_CLOSE_QUERY_KEY = ["cashflow", "daily-close"] as const

export type DailyCashClosing = {
  id: number | null
  fundId: number
  businessDate: string
  expectedCash: number
  countedCash: number | null
  variance: number | null
  notes: string | null
  status: "Open" | "Closed"
  closedBy: number | null
  closedAt: string | null
}

export type CloseDailyCashBody = {
  fundId: number
  businessDate: string
  countedCash: number
  notes?: string | null
}

/** GET /api/v1/cashflow/daily-close?fundId=&businessDate= */
export function getDailyClose(fundId: number, businessDate: string) {
  const q = new URLSearchParams({ fundId: String(fundId), businessDate })
  return apiJson<DailyCashClosing>(`/api/v1/cashflow/daily-close?${q.toString()}`, {
    method: "GET",
    auth: true,
  })
}

/** PUT /api/v1/cashflow/daily-close */
export function closeDailyCash(body: CloseDailyCashBody) {
  return apiJson<DailyCashClosing>("/api/v1/cashflow/daily-close", {
    method: "PUT",
    auth: true,
    body: JSON.stringify(body),
  })
}
