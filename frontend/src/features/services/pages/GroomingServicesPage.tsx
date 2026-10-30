import React, { useEffect, useState } from "react"
import { Scissors, Plus, Calendar, Clock, CheckCircle2, AlertCircle, XCircle, User, Sparkles, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

export interface ServiceBooking {
  id: number
  bookingCode: string
  customerId: number
  customerName?: string
  petId: number
  petName?: string
  staffId?: number
  staffName?: string
  bookingDate: string
  startTime: string
  endTime?: string
  status: "PENDING" | "CONFIRMED" | "IN_PROGRESS" | "COMPLETED" | "CANCELLED"
  totalAmount: number
  notes?: string
}

export interface ServiceItem {
  id: number
  serviceCode: string
  name: string
  category: string
  durationMinutes: number
  basePrice: number
  petType: string
}

const STATUS_CONFIG: Record<string, { label: string; badgeClass: string; icon: any }> = {
  PENDING: { label: "Chờ xác nhận", badgeClass: "bg-amber-100 text-amber-800 border-amber-200", icon: Clock },
  CONFIRMED: { label: "Đã xác nhận", badgeClass: "bg-blue-100 text-blue-800 border-blue-200", icon: Calendar },
  IN_PROGRESS: { label: "Đang thực hiện", badgeClass: "bg-purple-100 text-purple-800 border-purple-200", icon: Sparkles },
  COMPLETED: { label: "Hoàn thành", badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200", icon: CheckCircle2 },
  CANCELLED: { label: "Đã hủy", badgeClass: "bg-rose-100 text-rose-800 border-rose-200", icon: XCircle },
}

const DEFAULT_SERVICES: ServiceItem[] = [
  { id: 1, serviceCode: "SV-TAM-MEO", name: "Tắm & sấy spa mèo", category: "BATH", durationMinutes: 45, basePrice: 120000, petType: "CAT" },
  { id: 2, serviceCode: "SV-TAM-CHO", name: "Tắm & sấy spa chó", category: "BATH", durationMinutes: 60, basePrice: 150000, petType: "DOG" },
  { id: 3, serviceCode: "SV-CAT-TIA", name: "Cắt tỉa lông tạo kiểu nghệ thuật", category: "GROOMING", durationMinutes: 90, basePrice: 250000, petType: "ALL" },
  { id: 4, serviceCode: "SV-CAT-MONG", name: "Cắt móng & vệ sinh tai chuyên sâu", category: "NAIL", durationMinutes: 20, basePrice: 60000, petType: "ALL" },
]

const DEFAULT_BOOKINGS: ServiceBooking[] = [
  {
    id: 1,
    bookingCode: "BK-2026-001",
    customerId: 2,
    customerName: "Hoàng Văn Nam",
    petId: 1,
    petName: "Miu (Mèo)",
    staffId: 3,
    staffName: "Lê Thị Thu",
    bookingDate: new Date().toISOString().split("T")[0],
    startTime: "09:30",
    endTime: "10:30",
    status: "IN_PROGRESS",
    totalAmount: 180000,
    notes: "Bé hơi nhát nước, cần tắm nhẹ tay",
  },
  {
    id: 2,
    bookingCode: "BK-2026-002",
    customerId: 3,
    customerName: "Trần Thị Lan",
    petId: 2,
    petName: "Bông (Poodle)",
    staffId: 3,
    staffName: "Lê Thị Thu",
    bookingDate: new Date().toISOString().split("T")[0],
    startTime: "14:00",
    endTime: "15:30",
    status: "CONFIRMED",
    totalAmount: 250000,
    notes: "Cắt ngắn phần chân và tỉa tròn mặt",
  },
]

export const GroomingServicesPage: React.FC = () => {
  const [bookings, setBookings] = useState<ServiceBooking[]>([])
  const [services, setServices] = useState<ServiceItem[]>([])
  const [activeTab, setActiveTab] = useState<"bookings" | "services">("bookings")
  const [filterStatus, setFilterStatus] = useState<string>("ALL")
  const [bookingDialogOpen, setBookingDialogOpen] = useState(false)

  // Booking Form State
  const [newBooking, setNewBooking] = useState({
    customerName: "",
    petName: "",
    serviceId: "1",
    bookingDate: new Date().toISOString().split("T")[0],
    startTime: "10:00",
    notes: "",
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [resB, resS] = await Promise.all([
        fetch("/api/services/bookings"),
        fetch("/api/services"),
      ])
      if (resB.ok) {
        const b = await resB.json()
        setBookings(Array.isArray(b) && b.length > 0 ? b : DEFAULT_BOOKINGS)
      } else {
        setBookings(DEFAULT_BOOKINGS)
      }
      if (resS.ok) {
        const s = await resS.json()
        setServices(Array.isArray(s) && s.length > 0 ? s : DEFAULT_SERVICES)
      } else {
        setServices(DEFAULT_SERVICES)
      }
    } catch {
      setBookings(DEFAULT_BOOKINGS)
      setServices(DEFAULT_SERVICES)
    }
  }

  const handleCreateBooking = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newBooking.customerName || !newBooking.petName) {
      toast.error("Vui lòng điền tên khách và thú cưng")
      return
    }

    const selectedSvc = services.find((s) => s.id.toString() === newBooking.serviceId)
    const bookingItem: ServiceBooking = {
      id: Date.now(),
      bookingCode: `BK-${Math.floor(1000 + Math.random() * 9000)}`,
      customerId: 1,
      customerName: newBooking.customerName,
      petId: 1,
      petName: newBooking.petName,
      staffName: "Kỹ thuật viên Spa",
      bookingDate: newBooking.bookingDate,
      startTime: newBooking.startTime,
      status: "CONFIRMED",
      totalAmount: selectedSvc ? selectedSvc.basePrice : 150000,
      notes: newBooking.notes,
    }

    setBookings([bookingItem, ...bookings])
    toast.success("Đặt lịch dịch vụ thành công!")
    setBookingDialogOpen(false)
  }

  const updateBookingStatus = (id: number, status: ServiceBooking["status"]) => {
    setBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    )
    toast.success(`Đã cập nhật trạng thái đơn đặt lịch`)
  }

  const filteredBookings = bookings.filter((b) =>
    filterStatus === "ALL" ? true : b.status === filterStatus
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Dịch vụ Spa & Grooming</h1>
          <p className="text-sm text-slate-500">
            Quản lý bảng giá dịch vụ cắt tỉa, tắm spa và danh sách lịch hẹn khách hàng.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={activeTab === "bookings" ? "default" : "outline"}
            onClick={() => setActiveTab("bookings")}
          >
            Lịch hẹn hôm nay
          </Button>
          <Button
            variant={activeTab === "services" ? "default" : "outline"}
            onClick={() => setActiveTab("services")}
          >
            Bảng giá dịch vụ
          </Button>
          <Button onClick={() => setBookingDialogOpen(true)} className="bg-primary hover:bg-primary/90 text-white">
            <Plus className="mr-2 h-4 w-4" />
            Đặt lịch mới
          </Button>
        </div>
      </div>

      {activeTab === "bookings" ? (
        <div className="space-y-4">
          {/* Status filters */}
          <div className="flex items-center gap-2 overflow-x-auto pb-1">
            <Button
              variant={filterStatus === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterStatus("ALL")}
            >
              Tất cả ({bookings.length})
            </Button>
            {Object.entries(STATUS_CONFIG).map(([k, cfg]) => {
              const count = bookings.filter((b) => b.status === k).length
              return (
                <Button
                  key={k}
                  variant={filterStatus === k ? "default" : "outline"}
                  size="sm"
                  onClick={() => setFilterStatus(k)}
                >
                  {cfg.label} ({count})
                </Button>
              )
            })}
          </div>

          {/* Bookings List */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredBookings.map((b) => {
              const cfg = STATUS_CONFIG[b.status] || STATUS_CONFIG.PENDING
              const IconComp = cfg.icon
              return (
                <Card key={b.id} className="relative overflow-hidden hover:shadow-md transition">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-xs font-mono text-slate-400 block">{b.bookingCode}</span>
                        <CardTitle className="text-base font-semibold text-slate-900 mt-1">
                          {b.petName || "Thú cưng"}
                        </CardTitle>
                        <CardDescription className="text-xs text-slate-500">
                          Khách hàng: <strong>{b.customerName}</strong>
                        </CardDescription>
                      </div>
                      <Badge variant="outline" className={`${cfg.badgeClass} flex items-center gap-1 text-xs py-0.5`}>
                        <IconComp className="h-3 w-3" />
                        {cfg.label}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3 text-xs">
                    <div className="flex justify-between items-center py-2 px-3 bg-slate-50 rounded-md border border-slate-100">
                      <div className="flex items-center gap-2 text-slate-600">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        <span>{b.startTime} • {b.bookingDate}</span>
                      </div>
                      <span className="font-semibold text-primary">
                        {b.totalAmount.toLocaleString()} đ
                      </span>
                    </div>

                    {b.notes && (
                      <p className="text-slate-600 italic bg-amber-50/50 p-2 rounded border border-amber-100">
                        "{b.notes}"
                      </p>
                    )}

                    <div className="flex items-center justify-end gap-2 pt-2 border-t">
                      {b.status === "CONFIRMED" && (
                        <Button
                          size="sm"
                          variant="outline"
                          className="text-purple-600 border-purple-200 hover:bg-purple-50"
                          onClick={() => updateBookingStatus(b.id, "IN_PROGRESS")}
                        >
                          Bắt đầu làm
                        </Button>
                      )}
                      {b.status === "IN_PROGRESS" && (
                        <Button
                          size="sm"
                          className="bg-emerald-600 hover:bg-emerald-700 text-white"
                          onClick={() => updateBookingStatus(b.id, "COMPLETED")}
                        >
                          Hoàn tất
                        </Button>
                      )}
                      {b.status !== "COMPLETED" && b.status !== "CANCELLED" && (
                        <Button
                          size="sm"
                          variant="ghost"
                          className="text-rose-500 hover:text-rose-700 hover:bg-rose-50"
                          onClick={() => updateBookingStatus(b.id, "CANCELLED")}
                        >
                          Hủy lịch
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      ) : (
        /* Services Price Table */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {services.map((svc) => (
            <Card key={svc.id} className="hover:border-primary/50 transition">
              <CardHeader className="pb-3">
                <div className="w-10 h-10 rounded-lg bg-orange-100 text-primary flex items-center justify-center mb-2">
                  <Scissors className="h-5 w-5" />
                </div>
                <CardTitle className="text-base">{svc.name}</CardTitle>
                <CardDescription className="text-xs font-mono">{svc.serviceCode}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-baseline justify-between">
                  <span className="text-2xl font-bold text-slate-900">
                    {svc.basePrice.toLocaleString()} đ
                  </span>
                  <span className="text-xs text-slate-500">~{svc.durationMinutes} phút</span>
                </div>
                <div className="text-xs text-slate-600">
                  Dành cho: <Badge variant="secondary">{svc.petType === "ALL" ? "Chó & Mèo" : svc.petType}</Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Booking Dialog */}
      <Dialog open={bookingDialogOpen} onOpenChange={setBookingDialogOpen}>
        <DialogContent className="sm:max-w-[450px]">
          <form onSubmit={handleCreateBooking}>
            <DialogHeader>
              <DialogTitle>Đặt lịch hẹn dịch vụ Grooming</DialogTitle>
              <DialogDescription>
                Tạo lịch hẹn mới cho thú cưng và chọn gói dịch vụ phù hợp.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="space-y-2">
                <Label>Tên khách hàng *</Label>
                <Input
                  value={newBooking.customerName}
                  onChange={(e) => setNewBooking({ ...newBooking, customerName: e.target.value })}
                  placeholder="VD: Anh Minh..."
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Tên thú cưng & loài *</Label>
                <Input
                  value={newBooking.petName}
                  onChange={(e) => setNewBooking({ ...newBooking, petName: e.target.value })}
                  placeholder="VD: Bé Bông (Poodle)"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label>Chọn gói dịch vụ</Label>
                <Select
                  value={newBooking.serviceId}
                  onValueChange={(val) => setNewBooking({ ...newBooking, serviceId: val })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {services.map((s) => (
                      <SelectItem key={s.id} value={s.id.toString()}>
                        {s.name} - {s.basePrice.toLocaleString()} đ
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Ngày hẹn</Label>
                  <Input
                    type="date"
                    value={newBooking.bookingDate}
                    onChange={(e) => setNewBooking({ ...newBooking, bookingDate: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giờ hẹn</Label>
                  <Input
                    type="time"
                    value={newBooking.startTime}
                    onChange={(e) => setNewBooking({ ...newBooking, startTime: e.target.value })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Yêu cầu hoặc dặn dò đặc biệt</Label>
                <Input
                  value={newBooking.notes}
                  onChange={(e) => setNewBooking({ ...newBooking, notes: e.target.value })}
                  placeholder="VD: Cắt ngắn đuôi, sấy ấm..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setBookingDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Xác nhận lịch</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default GroomingServicesPage

