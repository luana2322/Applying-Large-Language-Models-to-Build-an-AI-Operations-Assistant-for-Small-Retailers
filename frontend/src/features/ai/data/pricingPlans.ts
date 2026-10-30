import type { LucideIcon } from "lucide-react"
import { BarChart3, FileText, MessageSquareText, Wand2 } from "lucide-react"

export type PlanId = "free" | "pro" | "proPlus"

export interface PricingPlan {
  id: PlanId
  name: string
  priceLabel: string
  pricePeriod: string
  tagline: string
  highlights: string[]
  cta: string
  ctaDisabled: boolean
  popular: boolean
}

export interface FeatureHighlight {
  icon: LucideIcon
  title: string
  description: string
  proOnly: boolean
}

export interface ComparisonRow {
  label: string
  free: string | boolean
  pro: string | boolean
  proPlus: string | boolean
}

export interface FaqItem {
  question: string
  answer: string
}

/** Gói đang dùng (giả định cứng để minh họa UI). */
export const CURRENT_PLAN_ID: PlanId = "free"

export const pricingPlans: PricingPlan[] = [
  {
    id: "free",
    name: "Free",
    priceLabel: "0đ",
    pricePeriod: "",
    tagline: "Dùng thử Trợ lý AI cơ bản",
    highlights: ["10 câu hỏi Trợ lý AI / ngày", "1 người dùng", "Chưa có Custom Build"],
    cta: "Gói hiện tại",
    ctaDisabled: true,
    popular: false,
  },
  {
    id: "pro",
    name: "Pro",
    priceLabel: "99.000đ",
    pricePeriod: "/tháng",
    tagline: "Mở khóa Custom Build cho cửa hàng",
    highlights: ["100 câu hỏi / ngày", "5 giao diện Custom Build", "3 người dùng", "Xuất báo cáo"],
    cta: "Nâng cấp Pro",
    ctaDisabled: false,
    popular: true,
  },
  {
    id: "proPlus",
    name: "Pro+",
    priceLabel: "199.000đ",
    pricePeriod: "/tháng",
    tagline: "Không giới hạn cho team lớn",
    highlights: ["Câu hỏi không giới hạn", "Custom Build không giới hạn", "10 người dùng", "Hỗ trợ ưu tiên"],
    cta: "Nâng cấp Pro+",
    ctaDisabled: false,
    popular: false,
  },
]

export const featureHighlights: FeatureHighlight[] = [
  {
    icon: MessageSquareText,
    title: "Hỏi-đáp dữ liệu tức thì",
    description: "Hỏi về tồn kho, doanh thu, công nợ… và nhận trả lời ngay.",
    proOnly: false,
  },
  {
    icon: BarChart3,
    title: "Vẽ biểu đồ & phân tích",
    description: "Yêu cầu trợ lý dựng biểu đồ doanh thu, top sản phẩm.",
    proOnly: false,
  },
  {
    icon: FileText,
    title: "Tạo phiếu nhập/xuất nháp",
    description: "Mô tả nhu cầu, trợ lý soạn phiếu nháp để bạn duyệt.",
    proOnly: false,
  },
  {
    icon: Wand2,
    title: "Tự tạo giao diện (Custom Build)",
    description: "Sinh giao diện quản lý riêng bằng AI, không cần code.",
    proOnly: true,
  },
]

export const comparisonRows: ComparisonRow[] = [
  { label: "Câu hỏi Trợ lý AI / ngày", free: "10", pro: "100", proPlus: "Không giới hạn" },
  { label: "Giao diện Custom Build", free: false, pro: "5", proPlus: "Không giới hạn" },
  { label: "Người dùng / team", free: "1", pro: "3", proPlus: "10" },
  { label: "Vẽ biểu đồ & phân tích", free: true, pro: true, proPlus: true },
  { label: "Tạo phiếu nháp", free: true, pro: true, proPlus: true },
  { label: "Xuất báo cáo", free: false, pro: true, proPlus: true },
  { label: "Hỗ trợ ưu tiên", free: false, pro: false, proPlus: true },
]

export const faqItems: FaqItem[] = [
  {
    question: "Câu hỏi mỗi ngày được tính thế nào?",
    answer: "Số lượt hỏi Trợ lý AI reset vào 0h mỗi ngày. Gói Free có 10 lượt mỗi ngày.",
  },
  {
    question: "Hết lượt Free thì sao?",
    answer: "Bạn có thể chờ sang ngày hôm sau hoặc nâng cấp lên Pro/Pro+ để có thêm lượt.",
  },
  {
    question: "Custom Build là gì?",
    answer: "Tính năng để AI tự tạo giao diện và quy trình quản lý riêng cho cửa hàng. Cần gói Pro trở lên.",
  },
  {
    question: "Tôi có thể đổi hoặc huỷ gói không?",
    answer: "Có. Bạn có thể đổi gói bất kỳ lúc nào; thay đổi áp dụng cho kỳ thanh toán kế tiếp.",
  },
]
