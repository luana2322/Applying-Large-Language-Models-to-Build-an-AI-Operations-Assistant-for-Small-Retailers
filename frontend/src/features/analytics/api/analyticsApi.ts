import { apiJson } from "@/lib/api/http"
import type {
  ForecastResponse, ProfitBySkuResponse, RevenueTrendResponse,
  BusinessHealth, BusinessInsights,
} from "../types"

export function getForecast(params: { days?: number; limit?: number } = {}) {
  const q = new URLSearchParams()
  if (params.days) q.set("days", String(params.days))
  if (params.limit) q.set("limit", String(params.limit))
  const qs = q.toString()
  return apiJson<ForecastResponse>(qs ? `/api/v1/analytics/forecast?${qs}` : "/api/v1/analytics/forecast", {
    method: "GET", auth: true,
  })
}

export function getProfitBySku(params: { dateFrom?: string; dateTo?: string; limit?: number } = {}) {
  const q = new URLSearchParams()
  if (params.dateFrom) q.set("dateFrom", params.dateFrom)
  if (params.dateTo) q.set("dateTo", params.dateTo)
  if (params.limit) q.set("limit", String(params.limit))
  const qs = q.toString()
  return apiJson<ProfitBySkuResponse>(qs ? `/api/v1/analytics/profit-by-sku?${qs}` : "/api/v1/analytics/profit-by-sku", {
    method: "GET", auth: true,
  })
}

export function getRevenueTrend(params: { dateFrom?: string; dateTo?: string } = {}) {
  const q = new URLSearchParams()
  if (params.dateFrom) q.set("dateFrom", params.dateFrom)
  if (params.dateTo) q.set("dateTo", params.dateTo)
  const qs = q.toString()
  return apiJson<RevenueTrendResponse>(qs ? `/api/v1/analytics/revenue-trend?${qs}` : "/api/v1/analytics/revenue-trend", {
    method: "GET", auth: true,
  })
}

export function getBusinessHealth() {
  return apiJson<BusinessHealth>("/api/v1/analytics/business-health", { method: "GET", auth: true })
}

export function getBusinessHealthAiSuggestions(snapshot: BusinessHealth) {
  return apiJson<BusinessInsights>("/api/v1/analytics/business-health/ai-suggestions", {
    method: "POST", auth: true,
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(snapshot),
  })
}
