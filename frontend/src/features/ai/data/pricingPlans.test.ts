import { describe, it, expect } from "vitest"
import {
  CURRENT_PLAN_ID,
  comparisonRows,
  faqItems,
  featureHighlights,
  pricingPlans,
} from "./pricingPlans"

describe("pricingPlans data", () => {
  it("có đúng 3 gói theo thứ tự free / pro / proPlus", () => {
    expect(pricingPlans.map((p) => p.id)).toEqual(["free", "pro", "proPlus"])
  })

  it("chỉ một gói được đánh dấu phổ biến và đó là Pro", () => {
    const popular = pricingPlans.filter((p) => p.popular)
    expect(popular).toHaveLength(1)
    expect(popular[0].id).toBe("pro")
  })

  it("chỉ gói hiện tại (free) bị disable CTA", () => {
    const free = pricingPlans.find((p) => p.id === "free")!
    expect(free.ctaDisabled).toBe(true)
    expect(pricingPlans.filter((p) => p.ctaDisabled)).toHaveLength(1)
    expect(CURRENT_PLAN_ID).toBe("free")
  })

  it("khóa Custom Build ở gói free trong bảng so sánh", () => {
    const row = comparisonRows.find((r) => r.label === "Giao diện Custom Build")!
    expect(row.free).toBe(false)
    expect(row.pro).toBe("5")
    expect(row.proPlus).toBe("Không giới hạn")
  })

  it("có đủ highlights (4, có ít nhất 1 proOnly) và FAQ (>= 4)", () => {
    expect(featureHighlights).toHaveLength(4)
    expect(featureHighlights.some((h) => h.proOnly)).toBe(true)
    expect(faqItems.length).toBeGreaterThanOrEqual(4)
  })
})
