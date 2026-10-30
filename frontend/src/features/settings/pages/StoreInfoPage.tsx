import { useEffect, useState, useRef } from "react"
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query"
import { usePageTitle } from "@/context/PageTitleContext"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  Save, Upload, Store, Globe, MapPin, Phone, Mail,
  FileText, Link2, AtSign, Pencil,
} from "lucide-react"
import { toast } from "sonner"
import { ApiRequestError } from "@/lib/api/http"
import {
  getStoreProfile,
  patchStoreProfile,
  uploadStoreLogo,
  STORE_PROFILE_QUERY_KEY,
  type StoreProfileData,
} from "../api/storeProfileApi"

export function StoreInfoPage() {
  const { setTitle } = usePageTitle()
  const queryClient = useQueryClient()
  const [isEditing, setIsEditing] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [storeData, setStoreData] = useState({
    name: "",
    businessCategory: "",
    address: "",
    phone: "",
    email: "",
    website: "",
    taxCode: "",
    footerNote: "",
    logoUrl: "",
    facebookUrl: "",
    instagramHandle: "",
  })

  const storeProfileQuery = useQuery({
    queryKey: STORE_PROFILE_QUERY_KEY,
    queryFn: getStoreProfile,
  })

  const patchMutation = useMutation({
    mutationFn: patchStoreProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: STORE_PROFILE_QUERY_KEY })
    },
  })

  const uploadLogoMutation = useMutation({
    mutationFn: uploadStoreLogo,
    onSuccess: (data) => {
      setStoreData((prev) => ({ ...prev, logoUrl: data.logoUrl }))
      queryClient.invalidateQueries({ queryKey: STORE_PROFILE_QUERY_KEY })
      toast.success("Đã cập nhật logo")
    },
  })

  useEffect(() => {
    setTitle("Thông Tin Cửa Hàng")
  }, [setTitle])

  useEffect(() => {
    if (!storeProfileQuery.data) return
    if (isEditing) return
    const d = storeProfileQuery.data
    setStoreData({
      name: d.name ?? "",
      businessCategory: d.businessCategory ?? "",
      address: d.address ?? "",
      phone: d.phone ?? "",
      email: d.email ?? "",
      website: d.website ?? "",
      taxCode: d.taxCode ?? "",
      footerNote: d.footerNote ?? "",
      logoUrl: d.logoUrl ?? "",
      facebookUrl: d.facebookUrl ?? "",
      instagramHandle: d.instagramHandle ?? "",
    })
  }, [storeProfileQuery.data, isEditing])

  function buildPatchBody(form: typeof storeData, baseline: StoreProfileData | undefined) {
    const out: Record<string, unknown> = {}
    const base = baseline
    const norm = (s: string) => s.trim()
    const toNullable = (s: string) => {
      const t = norm(s)
      return t.length > 0 ? t : null
    }
    const changed = (a: unknown, b: unknown) => (a ?? null) !== (b ?? null)

    const name = norm(form.name)
    if (changed(name, base?.name ?? "")) out.name = name
    const businessCategory = toNullable(form.businessCategory)
    if (changed(businessCategory, base?.businessCategory ?? null)) out.businessCategory = businessCategory
    const address = toNullable(form.address)
    if (changed(address, base?.address ?? null)) out.address = address
    const phone = toNullable(form.phone)
    if (changed(phone, base?.phone ?? null)) out.phone = phone
    const email = toNullable(form.email)
    if (changed(email, base?.email ?? null)) out.email = email
    const website = toNullable(form.website)
    if (changed(website, base?.website ?? null)) out.website = website
    const taxCode = toNullable(form.taxCode)
    if (changed(taxCode, base?.taxCode ?? null)) out.taxCode = taxCode
    const footerNote = toNullable(form.footerNote)
    if (changed(footerNote, base?.footerNote ?? null)) out.footerNote = footerNote
    const logoUrl = toNullable(form.logoUrl)
    if (changed(logoUrl, base?.logoUrl ?? null)) out.logoUrl = logoUrl
    const facebookUrl = toNullable(form.facebookUrl)
    if (changed(facebookUrl, base?.facebookUrl ?? null)) out.facebookUrl = facebookUrl
    const instagramHandle = toNullable(form.instagramHandle)
    if (changed(instagramHandle, base?.instagramHandle ?? null)) out.instagramHandle = instagramHandle

    return out
  }

  const handleSave = async () => {
    const body = buildPatchBody(storeData, storeProfileQuery.data)
    if (Object.keys(body).length === 0) {
      toast.info("Chưa có thay đổi để lưu")
      setIsEditing(false)
      return
    }
    try {
      await patchMutation.mutateAsync(body)
      toast.success("Đã cập nhật thông tin cửa hàng")
      setIsEditing(false)
    } catch (e) {
      if (e instanceof ApiRequestError) {
        const details = e.body?.details ?? {}
        const keys = Object.keys(details)
        if (keys.length > 0) {
          toast.error(e.body?.message ?? "Dữ liệu không hợp lệ", {
            description: keys.slice(0, 4).map((k) => `${k}: ${details[k]}`).join(" • "),
          })
        } else {
          toast.error(e.body?.message ?? "Không thể lưu thông tin cửa hàng")
        }
        return
      }
      toast.error("Không thể lưu thông tin cửa hàng")
    }
  }

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      uploadLogoMutation.mutate(file, {
        onError: (err) => {
          if (err instanceof ApiRequestError) {
            toast.error(err.body?.message ?? "Không thể cập nhật logo")
            return
          }
          toast.error("Không thể cập nhật logo")
        },
      })
    }
  }

  const handleChange = (field: string, value: string) => {
    setStoreData(prev => ({ ...prev, [field]: value }))
  }

  useEffect(() => {
    const err = storeProfileQuery.error
    if (!err) return
    if (err instanceof ApiRequestError) {
      toast.error(err.body?.message ?? "Không tải được thông tin cửa hàng")
      return
    }
    toast.error("Không tải được thông tin cửa hàng")
  }, [storeProfileQuery.error])

  return (
    <div className="min-h-full bg-slate-50 overflow-y-auto p-4 md:p-6">
      <div className="max-w-5xl mx-auto flex flex-col gap-4">

        {/* Header */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-sm px-5 py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg border border-slate-200 bg-slate-50 flex items-center justify-center shrink-0">
              <Store className="h-4 w-4 text-slate-600" />
            </div>
            <div>
              <h1 className="text-xl font-semibold text-slate-950">Thông tin cửa hàng</h1>
              <p className="text-sm text-slate-500 mt-0.5">Quản lý nhận diện thương hiệu và thông tin liên hệ</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {!isEditing ? (
              <Button
                variant="outline"
                onClick={() => setIsEditing(true)}
                disabled={storeProfileQuery.isLoading}
              >
                <Pencil className="h-4 w-4" />
                Chỉnh sửa thông tin
              </Button>
            ) : (
              <>
                <Button
                  variant="ghost"
                  className="text-slate-500"
                  onClick={() => setIsEditing(false)}
                  disabled={patchMutation.isPending || uploadLogoMutation.isPending}
                >
                  Hủy
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={patchMutation.isPending || uploadLogoMutation.isPending}
                  className="bg-slate-900 text-white hover:bg-slate-800"
                >
                  <Save className="h-4 w-4" />
                  {patchMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Main 2-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-4">

          {/* Left column */}
          <div className="flex flex-col gap-4">

            {/* Logo card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Logo cửa hàng</p>
              <div
                className={cn(
                  "mx-auto h-40 w-40 rounded-2xl overflow-hidden border-2 border-slate-200 bg-slate-100 relative",
                  isEditing && "cursor-pointer",
                )}
                onClick={() => isEditing && fileInputRef.current?.click()}
                role={isEditing ? "button" : undefined}
                aria-label={isEditing ? "Tải logo mới" : undefined}
              >
                {storeData.logoUrl ? (
                  <img src={storeData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Store className="h-10 w-10 text-slate-400" />
                  </div>
                )}
                {isEditing && (
                  <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                    <Upload className="h-8 w-8 text-white mb-1" />
                    <span className="text-xs font-semibold text-white uppercase tracking-wide">Tải ảnh mới</span>
                  </div>
                )}
              </div>
              <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleLogoUpload} />
              <p className="text-[11px] text-slate-400 text-center mt-3 leading-relaxed">
                512×512px • PNG/JPG • Tối đa 2MB
              </p>
              <div className="border-t border-slate-100 my-4" />
              <div className="text-center">
                <p className="text-sm font-semibold text-slate-900">{storeData.name || "—"}</p>
                <p className="text-xs text-slate-500 mt-0.5">{storeData.businessCategory || "—"}</p>
              </div>
            </div>

            {/* Social media card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
              <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-4">Mạng xã hội</p>
              <div className="flex flex-col gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Facebook</p>
                  {isEditing ? (
                    <div className="relative">
                       <Link2 className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" aria-hidden />
                      <Input
                        value={storeData.facebookUrl}
                        onChange={(e) => handleChange("facebookUrl", e.target.value)}
                        className="pl-8 h-9 text-sm"
                      />
                    </div>
                  ) : (
                    <p className={cn("text-sm", storeData.facebookUrl ? "text-slate-700 truncate" : "text-slate-400 italic")}>
                      {storeData.facebookUrl || "Chưa cập nhật"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Instagram</p>
                  {isEditing ? (
                    <div className="relative">
                       <AtSign className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" aria-hidden />
                      <Input
                        value={storeData.instagramHandle}
                        onChange={(e) => handleChange("instagramHandle", e.target.value)}
                        className="pl-8 h-9 text-sm"
                      />
                    </div>
                  ) : (
                    <p className={cn("text-sm", storeData.instagramHandle ? "text-slate-700 truncate" : "text-slate-400 italic")}>
                      {storeData.instagramHandle || "Chưa cập nhật"}
                    </p>
                  )}
                </div>
              </div>
            </div>

          </div>

          {/* Right column */}
          <div className="flex flex-col gap-4">

            {/* Basic info card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <div className="h-6 w-6 rounded-md bg-slate-100 flex items-center justify-center shrink-0">
                  <Store className="h-3.5 w-3.5 text-slate-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Cấu hình cơ bản</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Tên cửa hàng</p>
                  {isEditing ? (
                    <Input
                      value={storeData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      className="h-9 text-sm"
                    />
                  ) : (
                    <p className={cn("text-sm font-medium min-h-[36px] flex items-center", storeData.name ? "text-slate-900" : "text-slate-400 italic")}>
                      {storeData.name || "Chưa cập nhật"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Lĩnh vực hoạt động</p>
                  {isEditing ? (
                    <Input
                      value={storeData.businessCategory}
                      onChange={(e) => handleChange("businessCategory", e.target.value)}
                      className="h-9 text-sm"
                    />
                  ) : (
                    <p className={cn("text-sm min-h-[36px] flex items-center", storeData.businessCategory ? "text-slate-900" : "text-slate-400 italic")}>
                      {storeData.businessCategory || "Chưa cập nhật"}
                    </p>
                  )}
                </div>
                <div className="md:col-span-2">
                  <p className="text-xs font-medium text-slate-500 mb-1">Địa chỉ kinh doanh</p>
                  {isEditing ? (
                    <div className="relative">
                       <MapPin className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" aria-hidden />
                      <Input
                        value={storeData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        className="pl-8 h-9 text-sm"
                      />
                    </div>
                  ) : (
                    <p className={cn("text-sm min-h-[36px] flex items-center", storeData.address ? "text-slate-900" : "text-slate-400 italic")}>
                      {storeData.address || "Chưa cập nhật"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Contact card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
              <div className="flex items-center gap-2 border-b border-slate-100 pb-3 mb-4">
                <div className="h-6 w-6 rounded-md bg-emerald-50 flex items-center justify-center shrink-0">
                  <Phone className="h-3.5 w-3.5 text-emerald-600" />
                </div>
                <h2 className="text-sm font-semibold text-slate-900">Thông tin liên hệ</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Số điện thoại</p>
                  {isEditing ? (
                    <div className="relative">
                       <Phone className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" aria-hidden />
                      <Input
                        value={storeData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="pl-8 h-9 text-sm font-mono"
                      />
                    </div>
                  ) : (
                    <p className={cn("text-sm min-h-[36px] flex items-center", storeData.phone ? "text-slate-900 font-mono" : "text-slate-400 italic")}>
                      {storeData.phone || "Chưa cập nhật"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Email hỗ trợ</p>
                  {isEditing ? (
                    <div className="relative">
                       <Mail className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" aria-hidden />
                      <Input
                        value={storeData.email}
                        onChange={(e) => handleChange("email", e.target.value)}
                        className="pl-8 h-9 text-sm"
                      />
                    </div>
                  ) : (
                    <p className={cn("text-sm min-h-[36px] flex items-center", storeData.email ? "text-slate-900" : "text-slate-400 italic")}>
                      {storeData.email || "Chưa cập nhật"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Website</p>
                  {isEditing ? (
                    <div className="relative">
                       <Globe className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" aria-hidden />
                      <Input
                        value={storeData.website}
                        onChange={(e) => handleChange("website", e.target.value)}
                        className="pl-8 h-9 text-sm"
                      />
                    </div>
                  ) : (
                    <p className={cn("text-sm min-h-[36px] flex items-center", storeData.website ? "text-slate-900" : "text-slate-400 italic")}>
                      {storeData.website || "Chưa cập nhật"}
                    </p>
                  )}
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-500 mb-1">Mã số thuế</p>
                  {isEditing ? (
                    <div className="relative">
                       <FileText className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" aria-hidden />
                      <Input
                        value={storeData.taxCode}
                        onChange={(e) => handleChange("taxCode", e.target.value)}
                        className="pl-8 h-9 text-sm font-mono"
                      />
                    </div>
                  ) : (
                    <p className={cn("text-sm min-h-[36px] flex items-center", storeData.taxCode ? "text-slate-900 font-mono" : "text-slate-400 italic")}>
                      {storeData.taxCode || "Chưa cập nhật"}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Footer note card */}
            <div className="rounded-xl border border-slate-200 bg-white shadow-sm p-5">
              <p className="text-xs font-medium text-slate-500 mb-2">Ghi chú (Hiển thị cuối hóa đơn)</p>
              {isEditing ? (
                <Textarea
                  value={storeData.footerNote}
                  onChange={(e) => handleChange("footerNote", e.target.value)}
                  className="min-h-[100px] text-sm resize-none rounded-lg"
                />
              ) : (
                <p className={cn("text-sm min-h-[80px] whitespace-pre-wrap leading-relaxed", storeData.footerNote ? "text-slate-900" : "text-slate-400 italic")}>
                  {storeData.footerNote || "Chưa có ghi chú"}
                </p>
              )}
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}
