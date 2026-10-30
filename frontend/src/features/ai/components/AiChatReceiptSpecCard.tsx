import { useState } from "react"
import { Package } from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import type {
  ArtifactReceiptPayload,
  InventoryDraftResponseDto,
  InventoryReceiptDraftPayload,
} from "../api/aiInventoryDraftApi"
import { createInventoryDraft } from "../api/aiInventoryDraftApi"
import { AiChatArtifactSummary } from "./AiChatArtifactSummary"
import { AiChatReceiptDraftCard } from "./AiChatReceiptDraftCard"

type Props = {
  payload: ArtifactReceiptPayload
}

function toDraftPayload(dto: InventoryDraftResponseDto): InventoryReceiptDraftPayload {
  return {
    draftId: dto.id,
    entityType: dto.entityType,
    header: dto.header,
    lineColumns: dto.lineColumns,
    lines: dto.lines,
    status: dto.status,
  }
}

export function AiChatReceiptSpecCard({ payload }: Props) {
  const [draftPayload, setDraftPayload] = useState<InventoryReceiptDraftPayload | null>(null)
  const [creating, setCreating] = useState(false)

  const lineCount = payload.lines?.length ?? 0
  const totalQty = payload.lines?.reduce((sum, ln) => {
    const q = Number((ln.values as Record<string, unknown>).quantity ?? 0)
    return sum + (Number.isFinite(q) ? q : 0)
  }, 0) ?? 0

  async function handleCreate() {
    setCreating(true)
    try {
      const dto = await createInventoryDraft(payload)
      setDraftPayload(toDraftPayload(dto))
    } catch {
      toast.error("Không tạo được phiếu nháp — kiểm tra quyền hoặc kết nối")
    } finally {
      setCreating(false)
    }
  }

  if (draftPayload) {
    return <AiChatReceiptDraftCard initial={draftPayload} />
  }

  const entityLabel =
    payload.entityType === "stock_dispatch" ? "Phiếu xuất kho — nháp" : "Phiếu nhập kho — nháp"

  const preview = payload.previewMessage || `${lineCount} sản phẩm · SL ~${totalQty}`

  return (
    <AiChatArtifactSummary
      icon={<Package className="h-4 w-4" />}
      title={entityLabel}
      description={payload.previewMessage || "AI đã lập phiếu nháp từ dữ liệu. Nhấn để tạo và chỉnh sửa."}
      badges={
        <Badge variant="secondary" className="font-normal text-slate-600">
          {lineCount} dòng · SL ~{totalQty}
        </Badge>
      }
      preview={preview}
      openLabel={creating ? "Đang tạo..." : "Tạo phiếu nháp"}
      disabled={creating}
      onOpen={() => void handleCreate()}
    />
  )
}
