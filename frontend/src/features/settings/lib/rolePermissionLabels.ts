export const ROLE_PERMISSION_LABELS: Record<string, string> = {
  can_view_dashboard: "Xem tổng quan",
  can_manage_inventory: "Quản lý kho",
  can_manage_products: "Quản lý sản phẩm",
  can_manage_customers: "Quản lý khách hàng",
  can_manage_orders: "Quản lý đơn hàng",
  can_view_finance: "Xem tài chính",
  can_approve: "Duyệt phiếu",
  can_manage_staff: "Quản lý nhân viên",
  can_configure_alerts: "Cấu hình cảnh báo",
  can_manage_custom_builder: "Trình thiết kế dữ liệu",
  can_use_custom_entities: "Dùng thực thể tùy chỉnh",
  can_use_ai: "Sử dụng AI",
  can_view_store_profile: "Xem thông tin cửa hàng",
  can_view_system_logs: "Xem nhật ký hệ thống",
}

export const PERMISSION_GROUPS: Array<{ title: string; keys: string[] }> = [
  {
    title: "Vận hành",
    keys: [
      "can_view_dashboard",
      "can_manage_inventory",
      "can_manage_products",
      "can_manage_customers",
      "can_manage_orders",
    ],
  },
  {
    title: "Tài chính & duyệt",
    keys: ["can_view_finance", "can_approve"],
  },
  {
    title: "Hệ thống",
    keys: [
      "can_manage_staff",
      "can_configure_alerts",
      "can_manage_custom_builder",
      "can_use_custom_entities",
      "can_use_ai",
      "can_view_store_profile",
      "can_view_system_logs",
    ],
  },
]

export type EnabledPermission = { key: string; label: string; group: string }

export function getEnabledPermissionLabels(
  permissions: Record<string, boolean>,
): EnabledPermission[] {
  const out: EnabledPermission[] = []
  for (const group of PERMISSION_GROUPS) {
    for (const key of group.keys) {
      if (permissions[key]) {
        out.push({ key, label: ROLE_PERMISSION_LABELS[key] ?? key, group: group.title })
      }
    }
  }
  return out
}
