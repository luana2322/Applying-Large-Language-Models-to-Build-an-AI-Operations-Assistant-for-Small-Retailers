import { getApiUrl } from "@/lib/api/config"
import type { AiInteractionMode } from "../types"
import type { CatalogDraftTablePayload } from "./aiCatalogDraftApi"
import type { InventoryReceiptDraftPayload } from "./aiInventoryDraftApi"
import type { DomainClarifyPayload } from "./aiDomainClarifyTypes"
import type { QueryTablePayload } from "./aiQueryTableTypes"

type OpenAiChatStreamArgs = {
  query: string
  conversationId: string
  interactionMode?: AiInteractionMode
  clarifyContinuation?: {
    clarifyId?: string
    clarifyKind?: string
    continuationContext?: Record<string, unknown>
    suggestedRewrite?: string
    selectedOptionId?: string
    resolvedPlanPatch?: Record<string, unknown>
  } | null
  onDelta: (delta: string) => void
  onDeltaFull?: (text: string) => void
  onDone: () => void
  onError: (message: string) => void
  /** When FastAPI emits SSE `progress` (structured JSON status). */
  onProgress?: (data: ProgressPayload) => void
  /** When FastAPI emits SSE `chart` (JSON one line). */
  onChart?: (spec: Record<string, unknown>) => void
  /** When FastAPI emits SSE `draft` (catalog HITL table). */
  onDraft?: (payload: CatalogDraftTablePayload) => void
  /** When FastAPI emits SSE `inventory_draft` (stock receipt HITL). */
  onInventoryDraft?: (payload: InventoryReceiptDraftPayload) => void
  /** When FastAPI emits SSE `data_table` (read-only SQL rows). */
  onDataTable?: (payload: QueryTablePayload) => void
  /** When FastAPI emits SSE `clarify` (domain guard — scope/terminology). */
  onClarify?: (payload: DomainClarifyPayload) => void
  /** Agentic artifact events (P2/P3/P4) */
  onArtifactChart?: (payload: unknown) => void
  onArtifactTable?: (payload: unknown) => void
  onArtifactReceipt?: (payload: unknown) => void
  /** Build mode (P5): bản nháp trang custom từ page_builder */
  onArtifactPageDraft?: (payload: unknown) => void
  /** HITL confirm: AI requests user approval before executing */
  onHitlConfirm?: (payload: HitlConfirmPayload) => void
}

export type AiChatStreamHandle = { abort: () => void }

export type HitlConfirmPayload = {
  confirmId: string
  message: string
}

export type ProgressPayload = {
  type: "tool_call" | "tool_result"
  tool: string
  step: number
  phase?: string
  valid?: boolean
  message: string
  reasoning?: string
}

export type TranscribeAudioResult = {
  transcript: string
  language?: string | null
  correlationId: string
}

export type TranscribeAudioErrorCode =
  | "network"
  | "stt_unavailable"
  | "empty_transcript"
  | "validation"
  | "unknown"

export class TranscribeAudioError extends Error {
  readonly code: TranscribeAudioErrorCode

  constructor(code: TranscribeAudioErrorCode, message: string) {
    super(message)
    this.name = "TranscribeAudioError"
    this.code = code
  }
}

/** POST multipart → Spring relay → Python STT (FPT Whisper). */
export async function transcribeAudio(
  wavBlob: Blob,
  options?: { language?: string }
): Promise<TranscribeAudioResult> {
  const token = sessionStorage.getItem("accessToken")
  const correlationId = crypto.randomUUID()
  const formData = new FormData()
  formData.append("file", wavBlob, "recording.wav")
  if (options?.language) {
    formData.append("language", options.language)
  }

  let res: Response
  try {
    res = await fetch(getApiUrl("/api/v1/ai/chat/transcribe"), {
      method: "POST",
      headers: {
        ...(token?.trim() ? { Authorization: `Bearer ${token}` } : {}),
        "X-Correlation-Id": correlationId,
      },
      body: formData,
    })
  } catch {
    throw new TranscribeAudioError("network", "Lỗi kết nối khi gửi ghi âm.")
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    let code: TranscribeAudioErrorCode = "unknown"
    try {
      const j = (await res.json()) as { error?: { message?: string; code?: string } }
      if (j.error?.message) msg = j.error.message
      if (res.status === 503 || j.error?.code === "AI_STT_UNAVAILABLE") {
        code = "stt_unavailable"
        msg = "Dịch vụ chuyển giọng thành văn bản tạm thời không khả dụng."
      } else if (res.status === 400) {
        code = "validation"
      }
    } catch {
      /* ignore */
    }
    throw new TranscribeAudioError(code, msg)
  }

  const data = (await res.json()) as {
    transcript?: string
    language?: string | null
    correlation_id?: string
  }
  const transcript = (data.transcript ?? "").trim()
  if (!transcript) {
    throw new TranscribeAudioError(
      "empty_transcript",
      "Không thể nhận diện giọng nói. Vui lòng thử lại."
    )
  }
  return {
    transcript,
    language: data.language,
    correlationId: data.correlation_id ?? correlationId,
  }
}

export type SynthesizeSpeechErrorCode =
  | "network"
  | "tts_unavailable"
  | "validation"
  | "unknown"

export class SynthesizeSpeechError extends Error {
  readonly code: SynthesizeSpeechErrorCode

  constructor(code: SynthesizeSpeechErrorCode, message: string) {
    super(message)
    this.name = "SynthesizeSpeechError"
    this.code = code
  }
}

/** POST JSON → Spring relay → Python TTS (FPT.AI-VITs) → audio/wav blob. */
export async function synthesizeSpeech(
  text: string,
  options?: { voice?: string }
): Promise<Blob> {
  const token = sessionStorage.getItem("accessToken")
  const correlationId = crypto.randomUUID()
  const body: { text: string; voice?: string } = { text: text.trim() }
  if (options?.voice?.trim()) body.voice = options.voice.trim()

  let res: Response
  try {
    res = await fetch(getApiUrl("/api/v1/ai/chat/synthesize"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token?.trim() ? { Authorization: `Bearer ${token}` } : {}),
        "X-Correlation-Id": correlationId,
      },
      body: JSON.stringify(body),
    })
  } catch {
    throw new SynthesizeSpeechError("network", "Lỗi kết nối khi tạo giọng đọc.")
  }

  if (!res.ok) {
    let msg = `HTTP ${res.status}`
    let code: SynthesizeSpeechErrorCode = "unknown"
    try {
      const j = (await res.json()) as { error?: { message?: string; code?: string } }
      if (j.error?.message) msg = j.error.message
      if (res.status === 503 || j.error?.code === "AI_TTS_UNAVAILABLE") {
        code = "tts_unavailable"
        msg = "Dịch vụ đọc văn bản tạm thời không khả dụng."
      } else if (res.status === 400) {
        code = "validation"
      }
    } catch {
      /* ignore non-JSON error body */
    }
    throw new SynthesizeSpeechError(code, msg)
  }

  const blob = await res.blob()
  if (!blob.size) {
    throw new SynthesizeSpeechError("unknown", "Dịch vụ đọc văn bản trả về dữ liệu rỗng.")
  }
  return blob
}

function parseSseBlock(block: string): { event: string; data: string } | null {
  let event = ""
  const dataLines: string[] = []
  for (const line of block.split("\n")) {
    if (line.startsWith("event:")) {
      event = line.slice(6).trim()
    } else if (line.startsWith("data:")) {
      // Preserve meaningful leading spaces in payload chunks.
      // Only drop a single separator space when the wire line is explicitly "data: <payload>".
      const d = line.startsWith("data: ") ? line.slice(6) : line.slice(5)
      dataLines.push(d)
    }
  }
  if (!event) return null
  return { event, data: dataLines.join("\n") }
}

function parseClarifyPayload(raw: string): DomainClarifyPayload | null {
  try {
    const c = JSON.parse(raw) as DomainClarifyPayload
    if (c && Array.isArray(c.questions)) return c
  } catch {
    /* ignore */
  }
  return null
}

function parseQueryTablePayload(raw: string): QueryTablePayload | null {
  try {
    const table = JSON.parse(raw) as QueryTablePayload
    if (table && Array.isArray(table.columns) && Array.isArray(table.rows)) {
      return table
    }
  } catch {
    /* ignore */
  }
  return null
}

function dispatchSseEvent(parsed: { event: string; data: string }, args: OpenAiChatStreamArgs): void {
  const { event, data } = parsed
  if (data.length === 0 && event !== "done") return
  if (event === "clarify" && args.onClarify) {
    const clarify = parseClarifyPayload(data)
    if (clarify) args.onClarify(clarify)
  } else if (event === "progress" && args.onProgress) {
    try {
      const progressPayload = JSON.parse(data) as ProgressPayload
      if (progressPayload && typeof progressPayload === "object" && progressPayload.type) {
        args.onProgress(progressPayload)
      } else {
        // fallback: plain text (backward compat)
        args.onProgress({ type: "tool_call", tool: "", step: 0, message: data })
      }
    } catch {
      args.onProgress({ type: "tool_call", tool: "", step: 0, message: data })
    }
  } else if (event === "delta_full" && args.onDeltaFull) {
    args.onDeltaFull(data)
  } else if (event === "delta") {
    args.onDelta(data)
  } else if (event === "chart" && args.onChart) {
    try {
      const spec = JSON.parse(data) as Record<string, unknown>
      if (spec && typeof spec === "object") args.onChart(spec)
    } catch { /* ignore */ }
  } else if (event === "draft" && args.onDraft) {
    try {
      const draft = JSON.parse(data) as CatalogDraftTablePayload
      if (draft?.draftId) args.onDraft(draft)
    } catch { /* ignore */ }
  } else if (event === "inventory_draft" && args.onInventoryDraft) {
    try {
      const inv = JSON.parse(data) as InventoryReceiptDraftPayload
      if (inv?.draftId) args.onInventoryDraft(inv)
    } catch { /* ignore */ }
  } else if (event === "data_table" && args.onDataTable) {
    const table = parseQueryTablePayload(data)
    if (table) args.onDataTable(table)
  } else if (event === "artifact_chart" && args.onArtifactChart) {
    try { args.onArtifactChart((JSON.parse(data) as { payload?: unknown }).payload) } catch { /* ignore */ }
  } else if (event === "artifact_table" && args.onArtifactTable) {
    try { args.onArtifactTable((JSON.parse(data) as { payload?: unknown }).payload) } catch { /* ignore */ }
  } else if (event === "artifact_receipt" && args.onArtifactReceipt) {
    try { args.onArtifactReceipt((JSON.parse(data) as { payload?: unknown }).payload) } catch { /* ignore */ }
  } else if (event === "artifact_page_draft" && args.onArtifactPageDraft) {
    try { args.onArtifactPageDraft((JSON.parse(data) as { payload?: unknown }).payload) } catch { /* ignore */ }
  } else if (event === "hitl_confirm" && args.onHitlConfirm) {
    try {
      const p = JSON.parse(data) as { confirmId?: string; message?: string }
      args.onHitlConfirm({ confirmId: p.confirmId ?? "", message: p.message ?? "" })
    } catch { /* ignore */ }
  } else if (event === "done") {
    args.onDone()
  } else if (event === "error") {
    args.onError(data.length > 0 ? data : "Không thể kết nối trợ lý AI.")
  }
}

/** Dev: Vite proxy có thể buffer POST SSE — gọi thẳng Spring (CORS đã bật localhost). */
function resolveAiChatStreamUrl(): string {
  const fromEnv = import.meta.env.VITE_AI_STREAM_URL as string | undefined
  if (fromEnv?.trim()) {
    return fromEnv.trim()
  }
  if (import.meta.env.DEV) {
    return "http://127.0.0.1:8080/api/v1/ai/chat/stream"
  }
  return getApiUrl("/api/v1/ai/chat/stream")
}

/**
 * POST + Bearer → Spring relay → FastAPI; SSE events `progress` | `delta` | `clarify` | …
 */
export function startAiChatPostStream(args: OpenAiChatStreamArgs): AiChatStreamHandle {
  const ac = new AbortController()

  void (async () => {
    try {
      const token = sessionStorage.getItem("accessToken")
      const url = resolveAiChatStreamUrl()
      const res = await fetch(url, {
        method: "POST",
        signal: ac.signal,
        headers: {
          "Content-Type": "application/json",
          ...(token?.trim() ? { Authorization: `Bearer ${token}` } : {}),
          "X-Correlation-Id": crypto.randomUUID(),
        },
        body: JSON.stringify({
          message: args.query,
          conversationId: args.conversationId,
          ...(args.interactionMode && args.interactionMode !== "auto"
            ? { interactionMode: args.interactionMode }
            : {}),
          options: {
            ...(args.interactionMode && args.interactionMode !== "auto"
              ? { interaction_mode: args.interactionMode }
              : {}),
            ...(args.clarifyContinuation?.clarifyId
              ? {
                  clarification: {
                    clarify_id: args.clarifyContinuation.clarifyId,
                    clarify_kind: args.clarifyContinuation.clarifyKind,
                    continuation_context: args.clarifyContinuation.continuationContext,
                    suggested_rewrite: args.clarifyContinuation.suggestedRewrite,
                    selected_option_id: args.clarifyContinuation.selectedOptionId,
                    resolved_plan_patch: args.clarifyContinuation.resolvedPlanPatch,
                  },
                }
              : {}),
          },
        }),
      })

      if (!res.ok) {
        let msg = `HTTP ${res.status}`
        try {
          const j = (await res.json()) as { error?: { message?: string } }
          const m = j.error?.message
          if (m) msg = m
        } catch {
          /* ignore non-JSON body */
        }
        args.onError(msg)
        return
      }

      const reader = res.body?.getReader()
      if (!reader) {
        args.onError("Không đọc được stream phản hồi.")
        return
      }

      const decoder = new TextDecoder()
      let buf = ""
      while (true) {
        const { value, done } = await reader.read()
        if (done) break
        buf += decoder.decode(value, { stream: true })
        let sep: number
        while ((sep = buf.indexOf("\n\n")) !== -1) {
          const block = buf.slice(0, sep)
          buf = buf.slice(sep + 2)
          const parsed = parseSseBlock(block)
          if (!parsed) continue
          dispatchSseEvent(parsed, args)
        }
      }

      const tail = buf.trim()
      if (tail) {
        const parsed = parseSseBlock(tail)
        if (parsed) dispatchSseEvent(parsed, args)
      }
    } catch (e: unknown) {
      if (e instanceof DOMException && e.name === "AbortError") return
      const err = e as Error
      args.onError(err?.message || "Không thể kết nối trợ lý AI.")
    }
  })()

  return { abort: () => ac.abort() }
}
