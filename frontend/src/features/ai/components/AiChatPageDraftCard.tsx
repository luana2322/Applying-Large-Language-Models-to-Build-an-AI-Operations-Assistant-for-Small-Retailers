import { memo, useCallback, useState } from "react"
import { CheckCircle2, LayoutDashboard, Loader2, Plus, Trash2, Wand2, X } from "lucide-react"
import { toast } from "sonner"
import { Link } from "react-router-dom"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  commitPageDraft, type PageDraftField, type PageDraftPayload,
} from "../api/aiPageBuilderApi"

type Props = {
  initial: PageDraftPayload
  onDismiss?: () => void
}

const TYPE_LABEL: Record<string, string> = {
  text: "chữ", long_text: "văn bản dài", number: "số", money: "tiền tệ",
  date: "ngày", boolean: "có/không", single_select: "chọn", reference: "liên kết",
}

const REF_LABEL: Record<string, string> = {
  products: "sản phẩm", suppliers: "nhà cung cấp", customers: "khách hàng",
  inventory_locations: "kho", users: "người dùng",
}

const INPUT_CLASS = "h-9 w-full min-w-0 border-slate-200 bg-white px-2 text-sm"

function fieldDescr(f: PageDraftField): string {
  const base = TYPE_LABEL[f.type] ?? f.type
  let extra = ""
  if (f.type === "single_select" && f.options?.length) {
    extra = ` (${f.options.join(" / ")})`
  } else if (f.type === "reference" && f.reference?.refEntityKey) {
    extra = ` (${REF_LABEL[f.reference.refEntityKey] ?? f.reference.refEntityKey})`
  }
  return `${base}${extra}${f.required ? " · bắt buộc" : ""}`
}

export const AiChatPageDraftCard = memo(function AiChatPageDraftCard({ initial, onDismiss }: Props) {
  const [fields, setFields] = useState<PageDraftField[]>(
    () => initial.fields.map((f) => ({ ...f }))
  )
  const [pageLabel, setPageLabel] = useState(initial.pageLabel)
  const [committing, setCommitting] = useState(false)
  const [created, setCreated] = useState<{ routePath: string } | null>(null)

  const updateFieldLabel = useCallback((idx: number, label: string) => {
    setFields((prev) => prev.map((f, i) => (i === idx ? { ...f, label } : f)))
  }, [])

  const removeField = useCallback((idx: number) => {
    setFields((prev) => prev.filter((_, i) => i !== idx))
  }, [])

  const addField = () => {
    setFields((prev) => [
      ...prev,
      { fieldKey: `cot_${prev.length + 1}`, label: "Cột mới", type: "text", required: false },
    ])
  }

  const handleCommit = async () => {
    if (fields.length === 0) {
      toast.error("Trang cần ít nhất 1 cột")
      return
    }
    setCommitting(true)
    try {
      // Rebuild list + form theo fields hien tai (sau khi sua inline xoa cot) —
      // tranh formSections/listColumns con tro field da xoa (oracle se reject).
      const keys = fields.map((f) => f.fieldKey)
      const res = await commitPageDraft({
        ...initial,
        pageLabel,
        fields,
        listColumnKeys: keys,
        formSections: [{ title: "Thông tin", fieldKeys: keys }],
      })
      setCreated({ routePath: res.routePath })
      toast.success("Đã tạo trang. Mở từ menu để dùng.")
    } catch (e: unknown) {
      toast.error((e as Error)?.message ?? "Không tạo được trang")
    } finally {
      setCommitting(false)
    }
  }

  if (created) {
    return (
      <div className="rounded-lg border border-emerald-200 bg-emerald-50/60 p-4">
        <div className="flex items-center gap-2 text-sm font-medium text-emerald-800">
          <CheckCircle2 className="h-4 w-4" />
          Đã tạo trang "{pageLabel}"
        </div>
        <p className="mt-1 text-xs text-emerald-700">Trang đã xuất hiện trên menu.</p>
        <Button asChild size="sm" variant="outline" className="mt-3 bg-white">
          <Link to={created.routePath}>Mở trang vừa tạo</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
        <LayoutDashboard className="h-4 w-4 text-blue-600" />
        <h3 className="text-sm font-semibold text-slate-900">Trang mới</h3>
        <Badge variant="secondary" className="font-normal text-slate-600">
          {fields.length} cột
        </Badge>
      </div>

      <div className="space-y-1 py-3">
        <Label className="text-xs text-slate-500">Tên trang</Label>
        <Input className={INPUT_CLASS} value={pageLabel}
               onChange={(e) => setPageLabel(e.target.value)} />
      </div>

      {initial.previewMessage ? (
        <p className="pb-2 text-xs text-slate-500">{initial.previewMessage}</p>
      ) : null}

      <Table className="w-full border-separate border-spacing-0">
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead className="text-xs">Cột</TableHead>
            <TableHead className="text-xs">Kiểu</TableHead>
            <TableHead className="w-8" />
          </TableRow>
        </TableHeader>
        <TableBody>
          {fields.map((f, idx) => (
            <TableRow key={f.fieldKey}>
              <TableCell className="py-1.5">
                <Input className={INPUT_CLASS} value={f.label}
                       onChange={(e) => updateFieldLabel(idx, e.target.value)} />
              </TableCell>
              <TableCell className="py-1.5 text-xs text-slate-600">{fieldDescr(f)}</TableCell>
              <TableCell>
                <Button type="button" variant="ghost" size="icon-sm"
                        onClick={() => removeField(idx)}>
                  <Trash2 className="h-4 w-4 text-slate-400" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <div className="mt-3 flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" className="bg-white" onClick={addField}>
          <Plus className="h-4 w-4" /> Thêm cột
        </Button>
        <Button type="button" size="sm" disabled={committing}
                className="bg-blue-600 text-white hover:bg-blue-700"
                onClick={() => void handleCommit()}>
          {committing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Wand2 className="h-4 w-4" />}
          Tạo trang
        </Button>
        <Button type="button" variant="ghost" size="icon-sm" className="text-slate-500"
                title="Hủy" onClick={() => onDismiss?.()}>
          <X className="h-4 w-4" />
        </Button>
      </div>

      {initial.sampleRecords?.length ? (
        <p className="mt-2 text-xs text-slate-400">
          Kèm {initial.sampleRecords.length} dòng dữ liệu mẫu minh họa.
        </p>
      ) : null}
    </div>
  )
})
