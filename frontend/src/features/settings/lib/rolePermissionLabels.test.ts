import { describe, expect, it } from "vitest"
import { getEnabledPermissionLabels, ROLE_PERMISSION_LABELS } from "./rolePermissionLabels"

describe("rolePermissionLabels", () => {
  it("maps known keys to Vietnamese labels", () => {
    expect(ROLE_PERMISSION_LABELS.can_manage_staff).toBe("Quản lý nhân viên")
    expect(ROLE_PERMISSION_LABELS.can_view_dashboard).toBe("Xem tổng quan")
  })

  it("getEnabledPermissionLabels returns only true keys with labels", () => {
    const result = getEnabledPermissionLabels({
      can_manage_staff: true,
      can_view_dashboard: false,
      can_use_ai: true,
    })
    expect(result).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ key: "can_manage_staff", label: "Quản lý nhân viên" }),
        expect.objectContaining({ key: "can_use_ai", label: "Sử dụng AI" }),
      ]),
    )
    expect(result.find((r) => r.key === "can_view_dashboard")).toBeUndefined()
  })
})
