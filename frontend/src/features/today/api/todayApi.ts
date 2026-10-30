import { apiJson } from "@/lib/api/http"
import type { TodayData } from "../todayViewModel"

export type GetTodayParams = {
  businessDate?: string
}

export function getToday(params: GetTodayParams = {}) {
  const q = new URLSearchParams()
  if (params.businessDate?.trim()) {
    q.set("businessDate", params.businessDate.trim())
  }
  const qs = q.toString()
  return apiJson<TodayData>(qs ? `/api/v1/today?${qs}` : "/api/v1/today", {
    method: "GET",
    auth: true,
  })
}
