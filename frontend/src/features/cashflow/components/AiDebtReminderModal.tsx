import React, { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Sparkles, Copy, Send, Check, Loader2 } from "lucide-react"
import { toast } from "sonner"
import type { PartnerDebt } from "../types"

interface AiDebtReminderModalProps {
  debt: PartnerDebt | null
  isOpen: boolean
  onClose: () => void
}

export function AiDebtReminderModal({ debt, isOpen, onClose }: AiDebtReminderModalProps) {
  const [level, setLevel] = useState<"GENTLE" | "REMINDER" | "URGENT">("REMINDER")
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [copied, setCopied] = useState(false)

  const handleGenerate = async (selectedLevel: "GENTLE" | "REMINDER" | "URGENT") => {
    if (!debt) return
    setLevel(selectedLevel)
    setLoading(true)
    try {
      const res = await fetch(`/api/v1/debts/${debt.id}/ai-generate-reminder`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ level: selectedLevel }),
      })
      const data = await res.json()
      if (data.data?.suggestedMessage) {
        setMessage(data.data.suggestedMessage)
      } else {
        setMessage(
          `Em chào ${debt.partnerName}, khoản công nợ vật tư điện nước của anh hiện còn ${debt.remainingAmount?.toLocaleString()}đ. Nhờ anh kiểm tra và sắp xếp thanh toán đợt này nhé ạ!`
        )
      }
    } catch {
      setMessage(
        `Em chào ${debt.partnerName}, khoản công nợ vật tư điện nước của anh hiện còn ${debt.remainingAmount?.toLocaleString()}đ. Nhờ anh kiểm tra và sắp xếp thanh toán đợt này nhé ạ!`
      )
    } finally {
      setLoading(false)
    }
  }

  React.useEffect(() => {
    if (isOpen && debt) {
      handleGenerate("REMINDER")
    } else {
      setMessage("")
      setCopied(false)
    }
  }, [isOpen, debt?.id])

  const copyToClipboard = () => {
    if (!message) return
    navigator.clipboard.writeText(message)
    setCopied(true)
    toast.success("Đã copy tin nhắn nhắc nợ vào bộ nhớ tạm")
    setTimeout(() => setCopied(false), 2000)
  }

  const openZalo = () => {
    copyToClipboard()
    window.open("https://chat.zalo.me", "_blank")
  }

  if (!debt) return null

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-2xl bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-2xl">
        <DialogHeader className="space-y-1">
          <div className="flex items-center gap-2 text-cyan-700">
            <Sparkles className="h-5 w-5 animate-pulse" />
            <span className="text-xs font-black uppercase tracking-wider">AI Operations Assistant</span>
          </div>
          <DialogTitle className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
            Soạn tin nhắn thu hồi công nợ
          </DialogTitle>
          <DialogDescription className="text-sm font-medium text-slate-500">
            Tự động tạo thông điệp nhắc thợ/nhà thầu khéo léo nhưng dứt khoát, giữ quan hệ khách hàng.
          </DialogDescription>
        </DialogHeader>

        {/* Thông tin đối tác */}
        <div className="mt-4 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex flex-col sm:flex-row justify-between sm:items-center gap-3">
          <div>
            <p className="text-xs text-slate-500 font-bold uppercase">Khách hàng / Đối tác</p>
            <p className="text-base font-extrabold text-slate-800">{debt.partnerName}</p>
          </div>
          <div className="sm:text-right">
            <p className="text-xs text-slate-500 font-bold uppercase">Số dư còn nợ</p>
            <p className="text-lg font-black text-rose-600">
              {debt.remainingAmount?.toLocaleString()} đ
            </p>
          </div>
        </div>

        {/* Lựa chọn sắc thái văn phong */}
        <div className="mt-4 space-y-2">
          <label className="text-xs font-bold text-slate-700">Chọn sắc thái nhắc nợ:</label>
          <div className="grid grid-cols-3 gap-2">
            <Button
              type="button"
              variant={level === "GENTLE" ? "default" : "outline"}
              onClick={() => handleGenerate("GENTLE")}
              className={`text-xs font-bold rounded-xl h-10 ${
                level === "GENTLE" ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""
              }`}
            >
              🌿 Nhẹ nhàng (Gối đầu)
            </Button>
            <Button
              type="button"
              variant={level === "REMINDER" ? "default" : "outline"}
              onClick={() => handleGenerate("REMINDER")}
              className={`text-xs font-bold rounded-xl h-10 ${
                level === "REMINDER" ? "bg-amber-600 hover:bg-amber-700 text-white" : ""
              }`}
            >
              ⏰ Chuẩn mực (Đến hạn)
            </Button>
            <Button
              type="button"
              variant={level === "URGENT" ? "default" : "outline"}
              onClick={() => handleGenerate("URGENT")}
              className={`text-xs font-bold rounded-xl h-10 ${
                level === "URGENT" ? "bg-rose-600 hover:bg-rose-700 text-white" : ""
              }`}
            >
              🚨 Dứt khoát (Quá hạn)
            </Button>
          </div>
        </div>

        {/* Khung nội dung tin nhắn AI sinh ra */}
        <div className="mt-4 space-y-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-bold text-slate-700">Nội dung đề xuất (Zalo / SMS):</label>
            {loading && (
              <span className="text-xs text-cyan-600 flex items-center gap-1">
                <Loader2 className="h-3.5 w-3.5 animate-spin" /> Đang soạn lời...
              </span>
            )}
          </div>
          <div className="relative">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              className="w-full p-4 rounded-2xl border border-slate-300 focus:border-cyan-600 focus:ring-2 focus:ring-cyan-100 text-sm leading-relaxed text-slate-800 bg-white resize-none shadow-sm font-medium"
              placeholder="Nội dung nhắc nợ sẽ hiển thị ở đây..."
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2.5">
          <Button variant="ghost" onClick={onClose} className="rounded-xl font-bold text-slate-500">
            Đóng
          </Button>
          <Button
            variant="outline"
            onClick={copyToClipboard}
            className="rounded-xl font-bold gap-2 border-slate-300"
          >
            {copied ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
            {copied ? "Đã copy" : "Copy nội dung"}
          </Button>
          <Button
            onClick={openZalo}
            className="rounded-xl font-bold gap-2 bg-gradient-to-r from-cyan-600 to-teal-600 text-white hover:from-cyan-700 hover:to-teal-700 shadow-md shadow-cyan-600/20"
          >
            <Send className="h-4 w-4" /> Mở Zalo & Gửi ngay
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
