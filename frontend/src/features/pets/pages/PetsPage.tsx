import React, { useEffect, useState } from "react"
import { Plus, Heart, Trash2, Edit, Search, Phone, User, Calendar, ShieldCheck } from "lucide-react"
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

export interface Pet {
  id: number
  customerId: number
  customerName?: string
  name: string
  species: string
  breed: string
  gender: string
  birthDate: string
  weightKg: number
  color: string
  allergies: string
  healthNotes: string
  isActive: boolean
}

const SPECIES_CONFIG: Record<string, { label: string; icon: string; badgeClass: string }> = {
  DOG: { label: "Chó", icon: "🐕", badgeClass: "bg-amber-100 text-amber-800 border-amber-200" },
  CAT: { label: "Mèo", icon: "🐈", badgeClass: "bg-cyan-100 text-cyan-800 border-cyan-200" },
  SMALL_PET: { label: "Thú nhỏ (Hamster/Thỏ)", icon: "🐰", badgeClass: "bg-purple-100 text-purple-800 border-purple-200" },
  BIRD: { label: "Chim cảnh", icon: "🦜", badgeClass: "bg-emerald-100 text-emerald-800 border-emerald-200" },
  FISH: { label: "Cá cảnh", icon: "🐠", badgeClass: "bg-blue-100 text-blue-800 border-blue-200" },
  OTHER: { label: "Khác", icon: "🐾", badgeClass: "bg-slate-100 text-slate-800 border-slate-200" },
}

const DEFAULT_PETS: Pet[] = [
  {
    id: 1,
    customerId: 2,
    customerName: "Hoàng Văn Nam",
    name: "Miu",
    species: "CAT",
    breed: "Anh lông ngắn",
    gender: "FEMALE",
    birthDate: "2022-03-15",
    weightKg: 4.2,
    color: "Xám tro",
    allergies: "Không",
    healthNotes: "Đã tiêm phòng dại & 4 bệnh đầy đủ",
    isActive: true,
  },
  {
    id: 2,
    customerId: 2,
    customerName: "Hoàng Văn Nam",
    name: "Bông",
    species: "DOG",
    breed: "Poodle",
    gender: "MALE",
    birthDate: "2021-11-01",
    weightKg: 3.8,
    color: "Trắng",
    allergies: "Dị ứng phấn hoa",
    healthNotes: "Lông hơi xơ, cần tỉa định kỳ 4 tuần/lần",
    isActive: true,
  },
  {
    id: 3,
    customerId: 3,
    customerName: "Trần Thị Lan",
    name: "Kiki",
    species: "DOG",
    breed: "Corgi",
    gender: "MALE",
    birthDate: "2023-01-10",
    weightKg: 10.5,
    color: "Vàng trắng",
    allergies: "Không",
    healthNotes: "Sức khỏe tốt, tính hiếu động",
    isActive: true,
  },
]

export const PetsPage: React.FC = () => {
  const [pets, setPets] = useState<Pet[]>([])
  const [search, setSearch] = useState("")
  const [filterSpecies, setFilterSpecies] = useState<string>("ALL")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editingPet, setEditingPet] = useState<Pet | null>(null)

  // Form State
  const [formData, setFormData] = useState<Partial<Pet>>({
    name: "",
    species: "DOG",
    breed: "",
    gender: "MALE",
    weightKg: 1,
    customerName: "",
    birthDate: "",
    color: "",
    allergies: "",
    healthNotes: "",
    isActive: true,
  })

  useEffect(() => {
    fetchPets()
  }, [])

  const fetchPets = async () => {
    try {
      const res = await fetch("/api/pets")
      if (res.ok) {
        const data = await res.json()
        setPets(Array.isArray(data) && data.length > 0 ? data : DEFAULT_PETS)
      } else {
        setPets(DEFAULT_PETS)
      }
    } catch {
      setPets(DEFAULT_PETS)
    }
  }

  const handleOpenDialog = (pet?: Pet) => {
    if (pet) {
      setEditingPet(pet)
      setFormData(pet)
    } else {
      setEditingPet(null)
      setFormData({
        name: "",
        species: "DOG",
        breed: "",
        gender: "MALE",
        weightKg: 1,
        customerName: "",
        birthDate: new Date().toISOString().split("T")[0],
        color: "",
        allergies: "",
        healthNotes: "",
        isActive: true,
      })
    }
    setDialogOpen(true)
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.name?.trim()) {
      toast.error("Vui lòng nhập tên thú cưng")
      return
    }

    try {
      if (editingPet) {
        // update local
        setPets((prev) =>
          prev.map((item) => (item.id === editingPet.id ? ({ ...item, ...formData } as Pet) : item))
        )
        toast.success("Cập nhật thông tin thú cưng thành công!")
      } else {
        const newPet: Pet = {
          id: Date.now(),
          customerId: 1,
          name: formData.name || "",
          species: formData.species || "DOG",
          breed: formData.breed || "",
          gender: formData.gender || "MALE",
          birthDate: formData.birthDate || "",
          weightKg: Number(formData.weightKg) || 0,
          color: formData.color || "",
          allergies: formData.allergies || "",
          healthNotes: formData.healthNotes || "",
          customerName: formData.customerName || "Khách vãng lai",
          isActive: true,
        }
        setPets((prev) => [newPet, ...prev])
        toast.success("Thêm hồ sơ thú cưng mới thành công!")
      }
      setDialogOpen(false)
    } catch {
      toast.error("Không thể lưu thông tin thú cưng")
    }
  }

  const handleDelete = (id: number) => {
    if (window.confirm("Bạn có chắc chắn muốn xóa hồ sơ thú cưng này?")) {
      setPets((prev) => prev.filter((p) => p.id !== id))
      toast.success("Đã xóa thú cưng")
    }
  }

  const filteredPets = pets.filter((pet) => {
    const matchSearch =
      pet.name.toLowerCase().includes(search.toLowerCase()) ||
      (pet.customerName && pet.customerName.toLowerCase().includes(search.toLowerCase())) ||
      (pet.breed && pet.breed.toLowerCase().includes(search.toLowerCase()))
    const matchSpecies = filterSpecies === "ALL" || pet.species === filterSpecies
    return matchSearch && matchSpecies
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Quản lý Thú cưng</h1>
          <p className="text-sm text-slate-500">
            Hồ sơ thú cưng, theo dõi tình trạng sức khỏe, cân nặng và chủ sở hữu.
          </p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="bg-primary hover:bg-primary/90 text-white">
          <Plus className="mr-2 h-4 w-4" />
          Thêm thú cưng mới
        </Button>
      </div>

      {/* Filter bar */}
      <Card>
        <CardContent className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Tìm theo tên bé, chủ nuôi, giống..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
          <div className="flex items-center gap-2 w-full md:w-auto overflow-x-auto">
            <span className="text-xs text-slate-500 whitespace-nowrap">Loài:</span>
            <Button
              variant={filterSpecies === "ALL" ? "default" : "outline"}
              size="sm"
              onClick={() => setFilterSpecies("ALL")}
            >
              Tất cả
            </Button>
            {Object.entries(SPECIES_CONFIG).map(([key, config]) => (
              <Button
                key={key}
                variant={filterSpecies === key ? "default" : "outline"}
                size="sm"
                onClick={() => setFilterSpecies(key)}
                className="whitespace-nowrap"
              >
                <span className="mr-1">{config.icon}</span>
                {config.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Grid List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredPets.map((pet) => {
          const speciesInfo = SPECIES_CONFIG[pet.species] || SPECIES_CONFIG.OTHER
          return (
            <Card key={pet.id} className="hover:shadow-md transition-shadow relative overflow-hidden group">
              <div className="absolute top-0 left-0 w-1.5 h-full bg-primary" />
              <CardHeader className="pb-3 pt-5 pl-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-2xl border shadow-xs">
                      {speciesInfo.icon}
                    </div>
                    <div>
                      <CardTitle className="text-lg flex items-center gap-2">
                        {pet.name}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full border font-normal ${speciesInfo.badgeClass}`}
                        >
                          {speciesInfo.label}
                        </span>
                      </CardTitle>
                      <CardDescription className="text-xs text-slate-500 mt-0.5">
                        {pet.breed || "Chưa rõ giống"} • {pet.gender === "MALE" ? "Đực ♂" : "Cái ♀"}
                      </CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-slate-500 hover:text-primary"
                      onClick={() => handleOpenDialog(pet)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-rose-500 hover:text-rose-700"
                      onClick={() => handleDelete(pet.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3 pl-6 text-sm">
                <div className="grid grid-cols-2 gap-2 text-xs py-2 px-3 rounded-lg bg-slate-50 border border-slate-100">
                  <div>
                    <span className="text-slate-400 block">Cân nặng:</span>
                    <span className="font-semibold text-slate-800">{pet.weightKg} kg</span>
                  </div>
                  <div>
                    <span className="text-slate-400 block">Màu sắc:</span>
                    <span className="font-semibold text-slate-800">{pet.color || "—"}</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-slate-600">
                    <User className="h-3.5 w-3.5 text-slate-400" />
                    <span>Chủ nuôi: <strong>{pet.customerName || "Khách lẻ"}</strong></span>
                  </div>
                  {pet.birthDate && (
                    <div className="flex items-center gap-2 text-xs text-slate-600">
                      <Calendar className="h-3.5 w-3.5 text-slate-400" />
                      <span>Ngày sinh: {pet.birthDate}</span>
                    </div>
                  )}
                  {pet.healthNotes && (
                    <div className="flex items-start gap-2 text-xs text-slate-600 pt-1">
                      <ShieldCheck className="h-3.5 w-3.5 text-emerald-500 shrink-0 mt-0.5" />
                      <span className="line-clamp-2 italic">{pet.healthNotes}</span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {filteredPets.length === 0 && (
        <div className="text-center py-12 bg-white rounded-lg border border-dashed text-slate-500">
          <Heart className="mx-auto h-10 w-10 text-slate-300 mb-2" />
          <p className="font-medium">Chưa có thú cưng nào phù hợp với bộ lọc</p>
        </div>
      )}

      {/* Dialog Add/Edit */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <form onSubmit={handleSave}>
            <DialogHeader>
              <DialogTitle>{editingPet ? "Chỉnh sửa thông tin thú cưng" : "Thêm thú cưng mới"}</DialogTitle>
              <DialogDescription>
                Nhập đầy đủ thông tin nhận diện và sức khỏe của thú cưng để phục vụ chăm sóc và lưu trữ.
              </DialogDescription>
            </DialogHeader>

            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="pet-name">Tên bé *</Label>
                  <Input
                    id="pet-name"
                    value={formData.name || ""}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="VD: Miu, Lu, Bông..."
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label>Loài thú cưng</Label>
                  <Select
                    value={formData.species || "DOG"}
                    onValueChange={(val) => setFormData({ ...formData, species: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Chọn loài" />
                    </SelectTrigger>
                    <SelectContent>
                      {Object.entries(SPECIES_CONFIG).map(([k, cfg]) => (
                        <SelectItem key={k} value={k}>
                          {cfg.icon} {cfg.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Giống thú cưng</Label>
                  <Input
                    value={formData.breed || ""}
                    onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
                    placeholder="VD: Corgi, Poodle, Tai cụp..."
                  />
                </div>
                <div className="space-y-2">
                  <Label>Giới tính</Label>
                  <Select
                    value={formData.gender || "MALE"}
                    onValueChange={(val) => setFormData({ ...formData, gender: val })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="MALE">Đực ♂</SelectItem>
                      <SelectItem value="FEMALE">Cái ♀</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Cân nặng (kg)</Label>
                  <Input
                    type="number"
                    step="0.1"
                    value={formData.weightKg || ""}
                    onChange={(e) => setFormData({ ...formData, weightKg: parseFloat(e.target.value) || 0 })}
                    placeholder="VD: 4.5"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Chủ nuôi</Label>
                  <Input
                    value={formData.customerName || ""}
                    onChange={(e) => setFormData({ ...formData, customerName: e.target.value })}
                    placeholder="Tên khách hàng"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Ghi chú sức khỏe & Lịch sử tiêm phòng</Label>
                <Input
                  value={formData.healthNotes || ""}
                  onChange={(e) => setFormData({ ...formData, healthNotes: e.target.value })}
                  placeholder="Đã tiêm dại, triệt sản..."
                />
              </div>
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setDialogOpen(false)}>
                Hủy
              </Button>
              <Button type="submit">Lưu thông tin</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
export default PetsPage

