import { getApiUrl } from "@/lib/api/config"
import { syncMenuPermissionsFromSessionStorage } from "@/features/auth/lib/syncMenuPermissionsFromSessionStorage"
import { buildClientSessionHeaders } from "@/features/auth/lib/clientSessionId"

/**
 * Task003 — POST /api/v1/auth/refresh (public, no Bearer).
 * Cập nhật sessionStorage nếu thành công.
 *
 * Single-flight: nếu nhiều caller đồng thời nhận 401, chỉ gửi 1 request refresh,
 * các caller còn lại chờ chung kết quả — chặn thundering herd khi backend đang throttle 5 phút/user.
 *
 * @returns true nếu đã lưu access + refresh mới
 */
export function tryRefreshAccessToken(): Promise<boolean> {
  if (!inflightRefresh) {
    inflightRefresh = doRefresh().finally(() => {
      inflightRefresh = null
    })
  }
  return inflightRefresh
}

let inflightRefresh: Promise<boolean> | null = null

async function doRefresh(): Promise<boolean> {
  const refreshToken = sessionStorage.getItem("refreshToken")
  if (!refreshToken?.trim()) {
    return false
  }
  const url = getApiUrl("/api/v1/auth/refresh")
  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: buildClientSessionHeaders({ "Content-Type": "application/json" }),
      body: JSON.stringify({ refreshToken }),
    })
  } catch {
    return false
  }
  let json: unknown
  try {
    json = await res.json()
  } catch {
    return false
  }
  const obj = json as Record<string, unknown>
  if (!res.ok || obj?.success !== true || typeof obj.data !== "object" || obj.data === null) {
    return false
  }
  const data = obj.data as { accessToken?: unknown; refreshToken?: unknown }
  if (typeof data.accessToken !== "string" || typeof data.refreshToken !== "string") {
    return false
  }
  sessionStorage.setItem("accessToken", data.accessToken)
  sessionStorage.setItem("refreshToken", data.refreshToken)
  syncMenuPermissionsFromSessionStorage()
  return true
}
