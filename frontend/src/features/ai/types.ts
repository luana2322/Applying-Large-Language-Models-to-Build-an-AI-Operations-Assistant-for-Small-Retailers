import type { CatalogDraftTablePayload } from "./api/aiCatalogDraftApi"
import type { InventoryReceiptDraftPayload } from "./api/aiInventoryDraftApi"
import type { DomainClarifyPayload } from "./api/aiDomainClarifyTypes"
import type { QueryTablePayload } from "./api/aiQueryTableTypes"

export type AiInteractionMode =
  | "auto"
  | "data_query"
  | "data_table"
  | "chart"
  | "catalog_draft"
  | "inventory_draft"
  | "page_builder"

export type MessageRole = "user" | "assistant" | "system";

export interface ChatMessage {
  id: string
  role: MessageRole
  content: string
  timestamp: string
  type: "text" | "image" | "voice" | "artifact"
  metadata?: {
    imageUrl?: string
    voiceUrl?: string
    isProcessing?: boolean
    extractedData?: unknown
    /** Payload from SSE `chart` (Recharts-friendly), when backend sends chart_spec_final */
    chartSpec?: Record<string, unknown>
    /** Payload from SSE `draft` — editable catalog table */
    draftTable?: CatalogDraftTablePayload
    /** Payload from SSE `inventory_draft` — stock receipt HITL */
    inventoryDraft?: InventoryReceiptDraftPayload
    /** Payload from SSE `data_table` — read-only SQL result */
    queryTable?: QueryTablePayload
    /** Payload from SSE `clarify` — domain guard */
    domainClarify?: DomainClarifyPayload
    /** Agentic artifact payloads — rendered by P2/P3/P4 */
    artifactChart?: unknown
    artifactTable?: unknown
    artifactReceipt?: unknown
    /** Payload from SSE `artifact_page_draft` — bản nháp trang (build mode) */
    pageDraft?: import("./api/aiPageBuilderApi").PageDraftPayload
  }
}

export interface AIState {
  messages: ChatMessage[];
  isTyping: boolean;
  isRecording: boolean;
}
