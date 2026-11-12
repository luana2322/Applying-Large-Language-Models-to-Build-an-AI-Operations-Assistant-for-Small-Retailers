import { useMemo, useState } from "react"
import { useNavigate } from "react-router-dom"
import { ShoppingCart, ArrowRight, Check, Sparkles, Tag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { toast } from "sonner"
import { useOrderStore } from "@/features/orders/store/useOrderStore"

interface RecommendedItem {
  productId: number
  unitId: number
  skuCode: string
  productName: string
  unitName: string
  unitPrice: number
  quantity: number
  note?: string
}

const CATALOG_DEFINITIONS: Array<{
  productId: number
  unitId: number
  skuCode: string
  productName: string
  unitName: string
  unitPrice: number
  defaultQty: number
  keywords: string[]
}> = [
  {
    productId: 1,
    unitId: 1,
    skuCode: "TBVS-LVB-01",
    productName: "Chậu Lavabo sứ đặt bàn Trắng tuyết Nano (INAX AL-299V)",
    unitName: "Cái",
    unitPrice: 1650000,
    defaultQty: 1,
    keywords: ["chậu lavabo", "lavabo", "chậu rửa", "inax al-299v", "tbvs-lvb-01"],
  },
  {
    productId: 4,
    unitId: 1,
    skuCode: "TBVS-VOI-01",
    productName: "Vòi Lavabo nóng lạnh thân cao Đen mờ tĩnh điện (Đồng thau)",
    unitName: "Cái",
    unitPrice: 720000,
    defaultQty: 1,
    keywords: ["vòi lavabo", "vòi chậu", "vòi nóng lạnh", "đen mờ", "tbvs-voi-01"],
  },
  {
    productId: 6,
    unitId: 1,
    skuCode: "TBVS-XP-01",
    productName: "Bộ xả xi-phông thoát nước nhấn nắp sứ Trắng đồng bộ",
    unitName: "Bộ",
    unitPrice: 190000,
    defaultQty: 1,
    keywords: ["bộ xả", "xi-phông", "xiphông", "flush valve", "tbvs-xp-01"],
  },
  {
    productId: 7,
    unitId: 1,
    skuCode: "TBVS-VG-01",
    productName: "Cặp van góc chia nước Inox 304 kèm dây cấp chịu nhiệt 60cm",
    unitName: "Cặp",
    unitPrice: 150000,
    defaultQty: 1,
    keywords: ["van góc", "dây cấp", "chia nước", "tbvs-vg-01"],
  },
  {
    productId: 8,
    unitId: 1,
    skuCode: "GM-CALA-60",
    productName: "Gạch men ốp tường vân đá Calacatta White 30x60 mờ",
    unitName: "m2",
    unitPrice: 220000,
    defaultQty: 5,
    keywords: ["calacatta", "gạch calacatta", "gm-cala-60", "vân đá marble"],
  },
  {
    productId: 9,
    unitId: 1,
    skuCode: "GM-TERRA-01",
    productName: "Gạch ốp lát Terrazzo xám hạt mịn 60x60 chống trơn R10",
    unitName: "m2",
    unitPrice: 260000,
    defaultQty: 4,
    keywords: ["terrazzo", "gm-terra-01", "gạch terrazzo", "chống trơn"],
  },
  {
    productId: 18,
    unitId: 1,
    skuCode: "DN-KEO-APOLO",
    productName: "Keo Silicone trung tính Apolo A500 Trắng sữa (Chống mốc)",
    unitName: "Chai",
    unitPrice: 60000,
    defaultQty: 2,
    keywords: ["keo silicone", "apolo", "apollo", "dn-keo-apolo", "phụ kiện khác"],
  },
  {
    productId: 3,
    unitId: 1,
    skuCode: "TBVS-BC-01",
    productName: "Bồn cầu một khối men Nano Trắng bóng xả xoáy Tornado",
    unitName: "Bộ",
    unitPrice: 3400000,
    defaultQty: 1,
    keywords: ["bồn cầu", "bệt vệ sinh", "xả xoáy", "tbvs-bc-01"],
  },
  {
    productId: 43,
    unitId: 1,
    skuCode: "TBVS-SENCAY-NONG-LANH",
    productName: "Bộ sen cây tắm đứng nóng lạnh Inox SUS304",
    unitName: "Bộ",
    unitPrice: 1450000,
    defaultQty: 1,
    keywords: ["sen cây", "sen tắm", "vòi sen", "tbvs-sencay-nong-lanh"],
  },
  {
    productId: 19,
    unitId: 1,
    skuCode: "DN-BANG-TAN",
    productName: "Băng tan cao su non Tombo Malaysia (Cuộn 10m)",
    unitName: "Cuộn",
    unitPrice: 10000,
    defaultQty: 3,
    keywords: ["băng tan", "cao su non", "tombo", "dn-bang-tan"],
  },
]

export function extractComboItems(text: string): RecommendedItem[] {
  if (!text) return []
  const lower = text.toLowerCase()

  // Chỉ kích hoạt khi text có dấu hiệu tư vấn sản phẩm/combo/mua hàng
  const isConsultation =
    lower.includes("combo") ||
    lower.includes("tư vấn mua") ||
    lower.includes("phối màu") ||
    lower.includes("nhà vệ sinh") ||
    lower.includes("thiết bị vệ sinh") ||
    lower.includes("phụ kiện đi kèm") ||
    lower.includes("phụ kiện kèm theo") ||
    lower.includes("bộ xả") ||
    lower.includes("lavabo")

  if (!isConsultation) return []

  const matched: RecommendedItem[] = []
  const seenIds = new Set<number>()

  for (const def of CATALOG_DEFINITIONS) {
    const hits = def.keywords.some((kw) => lower.includes(kw))
    if (hits && !seenIds.has(def.productId)) {
      seenIds.add(def.productId)
      matched.push({
        productId: def.productId,
        unitId: def.unitId,
        skuCode: def.skuCode,
        productName: def.productName,
        unitName: def.unitName,
        unitPrice: def.unitPrice,
        quantity: def.defaultQty,
      })
    }
  }

  return matched
}

interface AiChatComboActionCardProps {
  text: string
}

export function AiChatComboActionCard({ text }: AiChatComboActionCardProps) {
  const navigate = useNavigate()
  const addItem = useOrderStore((state) => state.addItem)
  const setDiscount = useOrderStore((state) => state.setDiscount)
  const setNotes = useOrderStore((state) => state.setNotes)
  const [imported, setImported] = useState(false)

  const items = useMemo(() => extractComboItems(text), [text])

  if (items.length === 0) return null

  const originalTotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0)
  const discountAmount = Math.round(originalTotal * 0.05) // Ưu đãi combo 5%
  const finalTotal = originalTotal - discountAmount

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(val)

  const handleImportToPos = () => {
    let nextId = Date.now()
    items.forEach((item) => {
      addItem({
        id: nextId++,
        productId: item.productId,
        unitId: item.unitId,
        productName: item.productName,
        skuCode: item.skuCode,
        quantity: item.quantity,
        unitName: item.unitName,
        unitPrice: item.unitPrice,
        lineTotal: item.unitPrice * item.quantity,
      })
    })

    if (discountAmount > 0) {
      setDiscount(discountAmount)
    }
    setNotes("Đơn hàng tư vấn tự động từ trợ lý AI (Ưu đãi Combo 5%)")

    setImported(true)
    toast.success(`Đã thêm ${items.length} mặt hàng tư vấn vào giỏ hàng Bán lẻ (POS)!`, {
      description: "Chuyển hướng đến màn hình Bán lẻ...",
    })

    setTimeout(() => {
      navigate("/orders/retail")
    }, 450)
  }

  return (
    <div className="mt-3.5 overflow-hidden rounded-2xl border border-indigo-200/90 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 p-4 shadow-sm transition-all hover:shadow-md">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-indigo-100">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-sm shadow-indigo-300">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-slate-900 tracking-tight">
              Combo đề xuất từ AI ({items.length} sản phẩm)
            </h4>
            <p className="text-[11px] text-slate-500">
              Đồng bộ quy cách kỹ thuật & tối ưu cho không gian
            </p>
          </div>
        </div>
        <Badge className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 font-semibold text-xs py-0.5 px-2">
          <Tag className="h-3 w-3 mr-1" />
          Ưu đãi combo -5%
        </Badge>
      </div>

      {/* Items list */}
      <div className="mt-3 space-y-1.5 max-h-52 overflow-y-auto pr-1">
        {items.map((item) => (
          <div
            key={item.productId}
            className="flex items-center justify-between text-xs py-2 px-3 rounded-xl bg-white/90 border border-slate-100 shadow-[0_1px_2px_rgba(0,0,0,0.03)]"
          >
            <div className="min-w-0 flex-1 pr-2">
              <span className="font-semibold text-slate-800 truncate block">
                {item.productName}
              </span>
              <span className="text-[11px] text-slate-400 font-mono">
                {item.skuCode} • {item.unitName}
              </span>
            </div>
            <div className="text-right shrink-0">
              <span className="text-slate-500 font-medium">
                {item.quantity} {item.unitName} × {formatCurrency(item.unitPrice)}
              </span>
              <div className="font-bold text-slate-900">
                {formatCurrency(item.unitPrice * item.quantity)}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer Total & Action */}
      <div className="mt-3.5 pt-3 border-t border-indigo-100 flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-slate-500">Tổng gốc:</span>
            <span className="text-xs line-through text-slate-400 font-medium">
              {formatCurrency(originalTotal)}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-xs text-slate-600 font-medium">Thành tiền combo:</span>
            <span className="text-base font-extrabold text-indigo-700">
              {formatCurrency(finalTotal)}
            </span>
          </div>
        </div>

        <Button
          type="button"
          onClick={handleImportToPos}
          disabled={imported}
          className={`h-9 px-4 font-semibold text-xs tracking-wide shadow-md transition-all gap-1.5 rounded-xl ${
            imported
              ? "bg-emerald-600 hover:bg-emerald-600 text-white"
              : "bg-indigo-600 hover:bg-indigo-700 text-white shadow-indigo-200 hover:shadow-indigo-300"
          }`}
        >
          {imported ? (
            <>
              <Check className="h-4 w-4" />
              Đã nhập vào POS
            </>
          ) : (
            <>
              <ShoppingCart className="h-4 w-4" />
              Nhập vào đơn Bán lẻ (POS)
              <ArrowRight className="h-4 w-4 ml-0.5" />
            </>
          )}
        </Button>
      </div>
    </div>
  )
}

