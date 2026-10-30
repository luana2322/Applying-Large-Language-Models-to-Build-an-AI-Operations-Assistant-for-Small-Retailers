// frontend/mini-erp/src/features/settings/pages/AlertSettingsPage.tsx
import { useEffect, useState } from "react"
import { usePageTitle } from "@/context/PageTitleContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Bell, ShieldAlert, TrendingDown, Clock, CreditCard, Save } from "lucide-react"
import { toast } from "sonner"
import { ApiRequestError } from "@/lib/api/http"
import {
  getAlertSettingsList,
  patchAlertSetting,
  postCreateAlertSetting,
  type AlertSettingItemData,
  type AlertType,
} from "../api/alertSettingsApi"

export function AlertSettingsPage() {
  const { setTitle } = usePageTitle()

  useEffect(() => {
    setTitle("Cấu hình cảnh báo")
  }, [setTitle])

  const [settings, setSettings] = useState({
    lowStock: false,
    overStock: false,
    newOrder: false,
    debtDue: false,
    systemError: false,
    largeTransaction: false,
  })

  const [isLoading, setIsLoading] = useState(false)
  const [itemsByType, setItemsByType] = useState<
    Partial<Record<AlertType, AlertSettingItemData>>
  >({})
  const [thresholds, setThresholds] = useState({
    largeTransaction: 50_000_000,
    debtDueDays: 3,
  })

  useEffect(() => {
    let cancelled = false
    setIsLoading(true)
    getAlertSettingsList()
      .then((data) => {
        if (cancelled) return
        const next = {
          lowStock: false,
          overStock: false,
          newOrder: false,
          debtDue: false,
          systemError: false,
          largeTransaction: false,
        }
        const map: Partial<Record<AlertType, AlertSettingItemData>> = {}
        for (const it of data.items) {
          map[it.alertType] = it
          switch (it.alertType) {
            case "LowStock":
              next.lowStock = it.isEnabled
              break
            case "OverStock":
              next.overStock = it.isEnabled
              break
            case "SalesOrderCreated":
              next.newOrder = it.isEnabled
              break
            case "PartnerDebtDueSoon":
              next.debtDue = it.isEnabled
              if (typeof it.thresholdValue === "number") {
                setThresholds((s) => ({ ...s, debtDueDays: Number(it.thresholdValue) }))
              }
              break
            case "SystemHealth":
              next.systemError = it.isEnabled
              break
            case "HighValueTransaction":
              next.largeTransaction = it.isEnabled
              if (typeof it.thresholdValue === "number") {
                setThresholds((s) => ({
                  ...s,
                  largeTransaction: Number(it.thresholdValue),
                }))
              }
              break
            default:
              break
          }
        }
        setSettings(next)
        setItemsByType(map)
      })
      .catch((e) => {
        if (cancelled) return
        const msg =
          e instanceof Error ? e.message : "Không tải được cấu hình cảnh báo"
        toast.error(msg)
      })
      .finally(() => {
        if (cancelled) return
        setIsLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  const handleSave = async () => {
    setIsLoading(true)
    try {
      const desired: Array<{
        alertType: AlertType
        isEnabled: boolean
        thresholdValue?: number | null
      }> = [
        { alertType: "LowStock", isEnabled: settings.lowStock },
        { alertType: "OverStock", isEnabled: settings.overStock },
        { alertType: "SalesOrderCreated", isEnabled: settings.newOrder },
        { alertType: "SystemHealth", isEnabled: settings.systemError },
        {
          alertType: "HighValueTransaction",
          isEnabled: settings.largeTransaction,
          thresholdValue: thresholds.largeTransaction,
        },
        {
          alertType: "PartnerDebtDueSoon",
          isEnabled: settings.debtDue,
          thresholdValue: thresholds.debtDueDays,
        },
      ]

      const nextMap: Partial<Record<AlertType, AlertSettingItemData>> = {
        ...itemsByType,
      }

      for (const d of desired) {
        const existing = itemsByType[d.alertType]
        if (!existing) {
          if (!d.isEnabled) continue
          const created = await postCreateAlertSetting({
            alertType: d.alertType,
            channel: "App",
            frequency: "Realtime",
            thresholdValue: d.thresholdValue ?? null,
            isEnabled: true,
          })
          nextMap[created.alertType] = created
          continue
        }

        const patched = await patchAlertSetting(existing.id, {
          isEnabled: d.isEnabled,
          ...(d.alertType === "HighValueTransaction" ||
          d.alertType === "PartnerDebtDueSoon"
            ? { thresholdValue: d.thresholdValue ?? null }
            : {}),
        })
        nextMap[patched.alertType] = patched
      }

      setItemsByType(nextMap)
      toast.success("Đã lưu cấu hình cảnh báo")
    } catch (e) {
      if (e instanceof ApiRequestError && e.status === 400) {
        const details = e.body.details
        const detailsMsg =
          details && Object.keys(details).length > 0
            ? Object.entries(details)
                .slice(0, 3)
                .map(([k, v]) => `${k}: ${v}`)
                .join(" • ")
            : ""
        toast.error(
          detailsMsg
            ? `${e.body.message} (${detailsMsg})`
            : e.body.message || "Dữ liệu không hợp lệ",
        )
        return
      }
      if (e instanceof ApiRequestError && e.status === 409) {
        toast.error(
          e.body.message || "Bạn đã có cấu hình cho loại cảnh báo này",
        )
        return
      }
      if (e instanceof ApiRequestError && e.status === 404) {
        toast.error(e.body.message || "Không tìm thấy cấu hình cảnh báo")
        return
      }
      const msg =
        e instanceof Error ? e.message : "Không thể lưu cấu hình cảnh báo"
      toast.error(msg)
    } finally {
      setIsLoading(false)
    }
  }

  const isInitialLoading =
    isLoading && Object.keys(itemsByType).length === 0

  return (
    <div className="p-4 md:p-8 space-y-6 h-full overflow-y-auto">
      {/* Header */}
      <div className="max-w-4xl mx-auto">
        <h1 className="text-xl md:text-2xl font-semibold text-slate-900 tracking-tight flex items-center gap-3">
          <Bell className="h-6 w-6 text-slate-400" />
          Cấu hình cảnh báo
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Quản lý cách hệ thống thông báo các sự kiện quan trọng
        </p>
      </div>

      {/* Skeleton khi fetch lần đầu */}
      {isInitialLoading ? (
        <div className="max-w-4xl mx-auto space-y-6">
          {[1, 2, 3].map((i) => (
            <div
              key={i}
              className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden animate-pulse"
            >
              <div className="p-6 border-b border-slate-100 bg-slate-50">
                <div className="h-4 w-32 bg-slate-200 rounded" />
              </div>
              {[1, 2].map((j) => (
                <div
                  key={j}
                  className="p-6 flex items-center justify-between border-b border-slate-100 last:border-0"
                >
                  <div className="space-y-2">
                    <div className="h-4 w-48 bg-slate-200 rounded" />
                    <div className="h-3 w-64 bg-slate-100 rounded" />
                  </div>
                  <div className="h-6 w-10 bg-slate-200 rounded-full" />
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : (
        <div className="max-w-4xl mx-auto space-y-6">
          {/* Section: Kho hàng */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <ShieldAlert className="h-4 w-4 text-slate-400" />
                Cảnh báo kho hàng
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-6 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
                <div className="space-y-1">
                  <Label className="text-[15px] font-bold text-slate-800">
                    Cảnh báo sắp hết hàng
                  </Label>
                  <p className="text-sm text-slate-500">
                    Thông báo khi tồn kho thấp hơn định mức tối thiểu
                  </p>
                </div>
                <Switch
                  checked={settings.lowStock}
                  onCheckedChange={(val) =>
                    setSettings((s) => ({ ...s, lowStock: val }))
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="p-6 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
                <div className="space-y-1">
                  <Label className="text-[15px] font-bold text-slate-800">
                    Cảnh báo tồn kho quá cao
                  </Label>
                  <p className="text-sm text-slate-500">
                    Nhắc nhở khi sản phẩm vượt quá định mức tối đa
                  </p>
                </div>
                <Switch
                  checked={settings.overStock}
                  onCheckedChange={(val) =>
                    setSettings((s) => ({ ...s, overStock: val }))
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Section: Giao dịch & Doanh thu */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-slate-400" />
                Giao dịch & Doanh thu
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-6 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
                <div className="space-y-1">
                  <Label className="text-[15px] font-bold text-slate-800">
                    Thông báo đơn hàng mới
                  </Label>
                  <p className="text-sm text-slate-500">
                    Nhận thông báo mỗi khi có đơn bán sỉ hoặc lẻ thành công
                  </p>
                </div>
                <Switch
                  checked={settings.newOrder}
                  onCheckedChange={(val) =>
                    setSettings((s) => ({ ...s, newOrder: val }))
                  }
                  disabled={isLoading}
                />
              </div>
              <div className="p-6 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
                <div className="space-y-1">
                  <Label className="text-[15px] font-bold text-slate-800">
                    Giao dịch giá trị lớn
                  </Label>
                  <p className="text-sm text-slate-500">
                    Thông báo khi có giao dịch thu/chi vượt ngưỡng đã đặt
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {settings.largeTransaction && (
                    <div className="flex items-center gap-2">
                      <Input
                        type="number"
                        min={0}
                        step={100000}
                        value={thresholds.largeTransaction}
                        onChange={(e) =>
                          setThresholds((s) => ({
                            ...s,
                            largeTransaction: Number(e.target.value || 0),
                          }))
                        }
                        className="w-[160px] h-9 border-slate-200 text-sm"
                        disabled={isLoading}
                      />
                      <span className="text-xs text-slate-500">đ</span>
                    </div>
                  )}
                  <Switch
                    checked={settings.largeTransaction}
                    onCheckedChange={(val) =>
                      setSettings((s) => ({ ...s, largeTransaction: val }))
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Section: Tài chính & Hệ thống */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-100 bg-slate-50/50">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-slate-400" />
                Tài chính & Hệ thống
              </h3>
            </div>
            <div className="divide-y divide-slate-100">
              <div className="p-6 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
                <div className="space-y-1">
                  <Label className="text-[15px] font-bold text-slate-800">
                    Nhắc nợ đến hạn
                  </Label>
                  <p className="text-sm text-slate-500">
                    Cảnh báo các khoản nợ phải thu/trả sắp đến hạn
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {settings.debtDue && (
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-slate-400" />
                      <Input
                        type="number"
                        min={1}
                        step={1}
                        value={thresholds.debtDueDays}
                        onChange={(e) =>
                          setThresholds((s) => ({
                            ...s,
                            debtDueDays: Number(e.target.value || 1),
                          }))
                        }
                        className="w-[90px] h-9 border-slate-200 text-sm"
                        disabled={isLoading}
                      />
                      <span className="text-xs font-bold text-slate-500">
                        Ngày
                      </span>
                    </div>
                  )}
                  <Switch
                    checked={settings.debtDue}
                    onCheckedChange={(val) =>
                      setSettings((s) => ({ ...s, debtDue: val }))
                    }
                    disabled={isLoading}
                  />
                </div>
              </div>
              <div className="p-6 flex items-center justify-between hover:bg-slate-50/30 transition-colors">
                <div className="space-y-1">
                  <Label className="text-[15px] font-bold text-slate-800">
                    Báo cáo lỗi hệ thống
                  </Label>
                  <p className="text-sm text-slate-500">
                    Thông báo cho Admin khi có lỗi bất thường trong quá trình
                    vận hành
                  </p>
                </div>
                <Switch
                  checked={settings.systemError}
                  onCheckedChange={(val) =>
                    setSettings((s) => ({ ...s, systemError: val }))
                  }
                  disabled={isLoading}
                />
              </div>
            </div>
          </div>

          {/* Save button — cuối trang */}
          <div className="flex justify-end pt-2">
            <Button
              onClick={handleSave}
              disabled={isLoading}
              className="bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-100 px-8"
            >
              <Save className="h-4 w-4 mr-2" />
              Lưu cấu hình
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
