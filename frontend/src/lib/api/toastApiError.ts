import { toast } from "sonner"
import { ApiRequestError } from "./http"

function sanitizeServerMessage(raw: string | undefined | null): string | null {
  if (!raw) return null
  const t = raw.trim()
  if (t.length === 0) return null

  // Java exception patterns
  if (/^(org\.|com\.|java\.|jakarta\.|Cannot invoke|NullPointerException|RuntimeException|IllegalArgument)/i.test(t)) {
    return null
  }
  // HTTP status text
  if (/^(Internal Server Error|Bad Gateway|Service Unavailable|Gateway Timeout|Not Found|Bad Request)$/i.test(t)) {
    return null
  }
  // Stack trace fragments
  if (/^\s+(at |Caused by:|\.java:\d+)/.test(t)) {
    return null
  }
  // JSON parse / syntax errors
  if (/^(JSON parse error|Unexpected token|Syntax error)/i.test(t)) {
    return null
  }

  return t
}

export function toastApiError(error: unknown, fallback?: string): void {
  if (error instanceof ApiRequestError) {
    const safe = sanitizeServerMessage(error.body?.message?.trim())
    if (safe) {
      toast.error(safe)
      return
    }
    // details-only fallback
    if (error.body?.details && typeof error.body.details === "object") {
      const vals = Object.values(error.body.details).filter(Boolean)
      if (vals.length > 0) {
        toast.error(vals.join(" — "))
        return
      }
    }
    toast.error(fallback ?? "Yêu cầu không thành công. Vui lòng thử lại.")
    return
  }
  if (error instanceof Error) {
    const safe = sanitizeServerMessage(error.message)
    toast.error(safe ?? fallback ?? "Yêu cầu không thành công. Vui lòng thử lại.")
    return
  }
  toast.error(fallback ?? "Yêu cầu không thành công. Vui lòng thử lại.")
}

export function toastMutationEnvelope(error: unknown): void {
  if (error instanceof ApiRequestError) {
    const { status, body } = error
    const safeMsg = sanitizeServerMessage(body?.message?.trim())
    if (status === 409 || status === 403 || status === 400) {
      if (safeMsg) {
        toast.error(safeMsg)
        return
      }
      if (body?.details) {
        const vals = Object.values(body.details).filter(Boolean)
        if (vals.length > 0) {
          toast.error(vals.join(" — "))
          return
        }
      }
      toast.error("Yêu cầu không được xử lý. Vui lòng thử lại.")
      return
    }
  }
  toastApiError(error)
}
