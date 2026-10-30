import React, { useState, useEffect } from "react"
import { Sparkles, ShoppingCart, Layers, Palette, Check, ArrowRight, ShieldCheck, Box } from "lucide-react"

export const RecommendationsPage: React.FC = () => {
  const [selectedLavabo, setSelectedLavabo] = useState<number>(1)
  const [comboData, setComboData] = useState<any>(null)
  const [loading, setLoading] = useState<boolean>(true)
  const [addedCombo, setAddedCombo] = useState<boolean>(false)

  useEffect(() => {
    fetchCombo(selectedLavabo)
  }, [selectedLavabo])

  const fetchCombo = async (id: number) => {
    setLoading(true)
    setAddedCombo(false)
    try {
      const res = await fetch(`/api/v1/recommend/combo/${id}`)
      const json = await res.json()
      if (json.success) {
        setComboData(json.data)
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-gradient-to-r from-blue-700 via-indigo-700 to-cyan-600 p-6 rounded-2xl text-white shadow-lg">
        <div>
          <div className="flex items-center gap-2 text-cyan-200 text-sm font-semibold tracking-wide uppercase">
            <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
            AI Recommendation Engine & Combo Builder
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold mt-1">
            Gợi ý Combo Phối Màu & Thiết Bị Vệ Sinh
          </h1>
          <p className="text-blue-100 text-sm mt-1 max-w-2xl">
            Tự động gợi ý phụ kiện lắp đặt tương thích và tư vấn phối màu gạch men ốp lát ăn nhập (Calacatta, Terrazzo, Gạch thẻ Emerald).
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setSelectedLavabo(1)}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              selectedLavabo === 1
                ? "bg-white text-blue-800 shadow-md scale-105"
                : "bg-blue-600/40 hover:bg-blue-600/60 text-white"
            }`}
          >
            Chậu Lavabo Đặt Bàn (INAX)
          </button>
          <button
            onClick={() => setSelectedLavabo(2)}
            className={`px-4 py-2.5 rounded-xl font-medium text-sm transition-all ${
              selectedLavabo === 2
                ? "bg-white text-blue-800 shadow-md scale-105"
                : "bg-blue-600/40 hover:bg-blue-600/60 text-white"
            }`}
          >
            Chậu Lavabo Dương Vành (TOTO)
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64 text-slate-500">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
          Đang tính toán quy tắc tương thích và phối màu...
        </div>
      ) : comboData ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cột 1: Sản phẩm chủ đạo (Lavabo) */}
          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2 text-blue-700 font-bold text-sm">
              <Box className="w-4 h-4" />
              SẢN PHẨM CHỦ ĐẠO
            </div>
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-slate-100 border border-slate-200 relative group">
              <img
                src={comboData.baseProduct.imageUrl}
                alt={comboData.baseProduct.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
              />
              <span className="absolute top-2 right-2 bg-blue-600 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow">
                {comboData.baseProduct.specifications?.color || "Trắng tuyết"}
              </span>
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-snug">
                {comboData.baseProduct.name}
              </h3>
              <p className="text-xs text-slate-500 mt-1">Mã SKU: {comboData.baseProduct.skuCode}</p>
              <div className="mt-3 flex items-baseline justify-between">
                <span className="text-xs text-slate-400">Giá bán lẻ:</span>
                <span className="text-xl font-extrabold text-blue-700">
                  {comboData.baseProduct.price?.toLocaleString()}đ
                </span>
              </div>
            </div>

            {/* Thông số kỹ thuật chuyên ngành */}
            <div className="bg-slate-50 rounded-xl p-3 text-xs space-y-2 border border-slate-100">
              <div className="font-semibold text-slate-700 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                Thông số kỹ thuật lắp đặt
              </div>
              <div className="grid grid-cols-2 gap-2 text-slate-600">
                <div>Chất liệu: <strong className="text-slate-800">{comboData.baseProduct.specifications?.material || "Men Aqua Ceramic"}</strong></div>
                <div>Kiểu lắp: <strong className="text-slate-800">{comboData.baseProduct.specifications?.installation_type || "Đặt bàn"}</strong></div>
                <div>Kích thước: <strong className="text-slate-800">{comboData.baseProduct.specifications?.dimensions || "480x370 mm"}</strong></div>
                <div>Phong cách: <strong className="text-slate-800">{comboData.baseProduct.specifications?.finish_style || "Hiện đại"}</strong></div>
              </div>
            </div>
          </div>

          {/* Cột 2: Phụ kiện tương thích & Gạch men phối màu */}
          <div className="lg:col-span-2 space-y-6">
            {/* Phụ kiện bắt buộc */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-sm">
                  <Layers className="w-4 h-4" />
                  PHỤ KIỆN LẮP ĐẶT ĐI KÈM THEO COMBO
                </div>
                <span className="text-xs text-slate-500 bg-emerald-50 text-emerald-700 font-medium px-2.5 py-0.5 rounded-full border border-emerald-200">
                  Chuẩn kỹ thuật 100%
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {comboData.requiredAccessories.map((acc: any) => (
                  <div key={acc.productId} className="flex gap-3 p-3 rounded-xl border border-slate-100 bg-slate-50/70 hover:bg-white hover:border-blue-200 transition-all shadow-xs">
                    <img src={acc.imageUrl} alt={acc.name} className="w-14 h-14 rounded-lg object-cover border border-slate-200 shrink-0" />
                    <div className="flex flex-col justify-between overflow-hidden">
                      <div>
                        <h4 className="font-semibold text-xs text-slate-800 truncate" title={acc.name}>{acc.name}</h4>
                        <p className="text-[11px] text-slate-500 mt-0.5 line-clamp-1">{acc.reason}</p>
                      </div>
                      <div className="flex items-center justify-between mt-1">
                        <span className="font-bold text-xs text-blue-700">{acc.price?.toLocaleString()}đ</span>
                        <span className="text-[10px] text-emerald-600 bg-emerald-100/60 px-1.5 py-0.2 rounded font-medium">Sẵn kho: {acc.stockQuantity}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Phối màu gạch men */}
            <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-sm space-y-4">
              <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                <Palette className="w-4 h-4" />
                AI TƯ VẤN PHỐI MÀU GẠCH MEN ỐP LÁT
              </div>
              <p className="text-xs text-slate-600 bg-amber-50/80 p-3 rounded-xl border border-amber-200/60 leading-relaxed">
                💡 <strong>Lời khuyên thiết kế:</strong> {comboData.colorConsultation.styleAdvice}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {comboData.matchingTiles.map((tile: any) => (
                  <div key={tile.productId} className="border border-slate-200 rounded-xl overflow-hidden hover:shadow-md transition-all group bg-white">
                    <div className="aspect-4/3 w-full bg-slate-100 overflow-hidden">
                      <img src={tile.imageUrl} alt={tile.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                    </div>
                    <div className="p-3">
                      <h5 className="font-bold text-xs text-slate-800 line-clamp-1">{tile.name}</h5>
                      <p className="text-[11px] text-slate-500 mt-1 line-clamp-2">{tile.reason}</p>
                      <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs">
                        <span className="text-slate-400">Giá ốp:</span>
                        <span className="font-bold text-blue-700">{tile.price?.toLocaleString()}đ/{tile.unit}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Chốt đơn Combo */}
            <div className="bg-gradient-to-r from-slate-900 to-blue-950 text-white rounded-2xl p-5 flex flex-col sm:flex-row items-center justify-between gap-4 shadow-xl">
              <div>
                <span className="bg-amber-400 text-slate-950 text-xs font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Ưu Đãi Trọn Bộ Combo
                </span>
                <div className="flex items-baseline gap-3 mt-1.5">
                  <span className="text-2xl font-black text-amber-300">
                    {comboData.comboDiscountPrice?.toLocaleString()}đ
                  </span>
                  <span className="text-sm text-slate-400 line-through">
                    {comboData.totalComboPrice?.toLocaleString()}đ
                  </span>
                  <span className="text-xs text-emerald-400 font-semibold">(Tiết kiệm 5%)</span>
                </div>
                <p className="text-xs text-slate-300 mt-0.5">Bao gồm: Chậu Lavabo + Vòi nóng lạnh + Xi phông sứ + Cặp van góc dây cấp + Keo silicon</p>
              </div>

              <button
                onClick={() => setAddedCombo(true)}
                className={`px-6 py-3 rounded-xl font-bold text-sm flex items-center gap-2 transition-all shadow-md ${
                  addedCombo
                    ? "bg-emerald-500 text-white"
                    : "bg-blue-600 hover:bg-blue-500 text-white active:scale-95"
                }`}
              >
                {addedCombo ? (
                  <>
                    <Check className="w-4 h-4" />
                    Đã thêm trọn bộ vào đơn POS!
                  </>
                ) : (
                  <>
                    <ShoppingCart className="w-4 h-4" />
                    Áp dụng Combo vào Đơn hàng
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
