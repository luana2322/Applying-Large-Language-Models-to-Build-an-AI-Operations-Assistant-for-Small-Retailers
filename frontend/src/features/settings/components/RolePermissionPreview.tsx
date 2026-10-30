import { Check } from "lucide-react"
import { getEnabledPermissionLabels, PERMISSION_GROUPS } from "../lib/rolePermissionLabels"
import { cn } from "@/lib/utils"

interface RolePermissionPreviewProps {
  roleName: string
  permissions: Record<string, boolean>
  compact?: boolean
}

export function RolePermissionPreview({ roleName, permissions, compact }: RolePermissionPreviewProps) {
  const enabled = getEnabledPermissionLabels(permissions)

  if (enabled.length === 0) {
    return <p className="text-xs text-slate-500">Không có quyền nào được bật cho vai trò này.</p>
  }

  return (
    <div className={cn("space-y-3", compact && "space-y-2")} data-testid="role-permission-preview">
      <p className={cn("font-semibold text-slate-800", compact ? "text-xs" : "text-sm")}>
        Quyền của {roleName}
      </p>
      {PERMISSION_GROUPS.map((group) => {
        const items = enabled.filter((e) => e.group === group.title)
        if (items.length === 0) return null
        return (
          <div key={group.title}>
            <p className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1">{group.title}</p>
            <ul className="space-y-1">
              {items.map((item) => (
                <li key={item.key} className="flex items-center gap-2 text-xs text-slate-700">
                  <Check className="h-3.5 w-3.5 shrink-0 text-emerald-600" />
                  {item.label}
                </li>
              ))}
            </ul>
          </div>
        )
      })}
    </div>
  )
}
