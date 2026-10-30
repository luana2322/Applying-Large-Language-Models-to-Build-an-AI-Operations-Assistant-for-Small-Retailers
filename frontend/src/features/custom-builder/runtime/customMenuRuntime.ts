import type { UserRole } from "@/features/auth/store/useAuthStore"
import type { MenuPermissions } from "@/features/auth/types/menuPermissions"

export type CustomRuntimeStatus = "Draft" | "Published" | "NeedsConfig" | "Hidden"
export type CustomRuntimePageType = "record_list" | "form" | "table_detail"

export type ValidationItem = { section: string; message: string; fieldKey?: string; blocking?: boolean }

export type ValidationSummary = {
  valid: boolean
  errors: ValidationItem[]
  warnings: ValidationItem[]
}

/**
 * Warning đủ nghiêm trọng để chặn publish/ghi dữ liệu. Gợi ý hiệu năng
 * (vd "cần index backend") được đánh dấu blocking=false nên không chặn.
 */
export function hasBlockingWarning(summary?: ValidationSummary): boolean {
  return (summary?.warnings ?? []).some((warning) => warning.blocking !== false)
}

/** Thiết kế đủ sạch để publish/ghi: không lỗi và không warning chặn. */
export function isWritableDesign(summary?: ValidationSummary): boolean {
  return Boolean(summary?.valid) && !hasBlockingWarning(summary)
}

export type RuntimeCustomPage = {
  nodeType: "page"
  id: string
  key: string
  label: string
  icon?: string
  parentKey: string
  routePath: string
  entityKey: string
  pageType: CustomRuntimePageType
  status: CustomRuntimeStatus
  sortOrder: number
  description?: string
  roles: UserRole[]
  entityPermission?: keyof MenuPermissions
  dataPermission?: keyof MenuPermissions
  version: number
  draftVersion?: number
  publishedVersion: number
  hasDraft: boolean
  publishedAt?: string
  publishedByName?: string
  updatedAt: string
  updatedByName?: string
  etag: string
  validationSummary: ValidationSummary
}

export type RuntimeCustomFolder = {
  nodeType: "folder"
  id: string
  key: string
  label: string
  icon?: string
  description?: string
  status: Exclude<CustomRuntimeStatus, "NeedsConfig">
  sortOrder: number
  roles: UserRole[]
  version: number
  draftVersion?: number
  publishedVersion: number
  hasDraft: boolean
  publishedAt?: string
  publishedByName?: string
  updatedAt: string
  updatedByName?: string
  etag: string
  validationSummary: ValidationSummary
  children: RuntimeCustomPage[]
}

export type RuntimeCustomMenuFolder = RuntimeCustomFolder & {
  children: RuntimeCustomPage[]
}

function roleAllowed(allowedRoles: UserRole[], role: UserRole | null) {
  return role == null || allowedRoles.includes(role)
}

function permissionAllowed(
  permission: keyof MenuPermissions | undefined,
  permissions: MenuPermissions,
  role: UserRole | null,
) {
  if (!permission) {
    return true
  }
  if (role == null) {
    return true
  }
  return Boolean(permissions[permission])
}

export function canSeeRuntimeFolder(
  folder: RuntimeCustomFolder,
  permissions: MenuPermissions,
  role: UserRole | null,
) {
  return folder.status === "Published" && roleAllowed(folder.roles, role) && getVisibleRuntimePages(folder, permissions, role).length > 0
}

export function canSeeRuntimePage(
  page: RuntimeCustomPage,
  permissions: MenuPermissions,
  role: UserRole | null,
) {
  return (
    page.status === "Published" &&
    roleAllowed(page.roles, role) &&
    permissionAllowed(page.entityPermission, permissions, role) &&
    permissionAllowed(page.dataPermission, permissions, role)
  )
}

export function getVisibleRuntimePages(
  folder: RuntimeCustomFolder,
  permissions: MenuPermissions,
  role: UserRole | null,
) {
  return folder.children
    .filter((page) => canSeeRuntimePage(page, permissions, role))
    .sort((a, b) => a.sortOrder - b.sortOrder)
}

export function getRuntimeCustomMenuForUser(
  permissions: MenuPermissions,
  role: UserRole | null,
  source: RuntimeCustomFolder[] = [],
): RuntimeCustomMenuFolder[] {
  return source
    .filter((folder) => canSeeRuntimeFolder(folder, permissions, role))
    .sort((a, b) => a.sortOrder - b.sortOrder)
    .map((folder) => ({
      ...folder,
      children: getVisibleRuntimePages(folder, permissions, role),
    }))
}

export function findRuntimeCustomPage(pageKey: string, source: RuntimeCustomFolder[] = []) {
  for (const folder of source) {
    const page = folder.children.find((child) => child.key === pageKey)
    if (page) {
      return { folder, page }
    }
  }
  return null
}
