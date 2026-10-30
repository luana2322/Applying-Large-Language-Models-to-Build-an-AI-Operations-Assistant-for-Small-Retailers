import { useEffect, useMemo, useState } from "react"
import { useParams } from "react-router-dom"
import {
  AlertTriangle,
  CheckCircle2,
  Clock,
  Edit,
  FileText,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldAlert,
} from "lucide-react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { usePageTitle } from "@/context/PageTitleContext"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import {
  createRuntimeRecord,
  getRuntimeCustomPage,
  listRuntimeRecords,
  patchRuntimeRecord,
  transitionRuntimeRecord,
} from "@/features/custom-builder/api/customInterfaceApi"
import type { ApiCustomRecord, BuilderPageBundle } from "@/features/custom-builder/api/customBuilderTypes"
import { canSeeRuntimePage } from "@/features/custom-builder/runtime/customMenuRuntime"

function StateMessage({
  icon,
  title,
  message,
}: {
  icon: React.ReactNode
  title: string
  message: string
}) {
  return (
    <div className="flex min-h-full items-center justify-center bg-slate-50 p-6">
      <div className="max-w-md rounded-md border border-slate-200 bg-white p-6 text-center shadow-sm">
        <div className="mx-auto flex h-10 w-10 items-center justify-center text-slate-400">{icon}</div>
        <h1 className="mt-4 text-lg font-semibold text-slate-950">{title}</h1>
        <p className="mt-2 text-sm text-slate-500">{message}</p>
      </div>
    </div>
  )
}

function formatValue(value: unknown) {
  if (value == null || value === "") return "-"
  if (typeof value === "boolean") return value ? "Có" : "Không"
  if (typeof value === "object") {
    const ref = value as Record<string, unknown>
    return String(ref.labelSnapshot ?? ref.refId ?? JSON.stringify(value))
  }
  return String(value)
}

type DraftValue = string | number | boolean | Record<string, unknown>
type DraftValues = Record<string, DraftValue>

function toDraftValues(values: Record<string, unknown> | undefined): DraftValues {
  const out: DraftValues = {}
  if (!values) return out
  for (const [key, value] of Object.entries(values)) {
    if (value === null || value === undefined) continue
    if (typeof value === "string") out[key] = value
    else if (typeof value === "number") out[key] = value
    else if (typeof value === "boolean") out[key] = value
    else if (typeof value === "object") out[key] = value as Record<string, unknown>
  }
  return out
}

function toRecordPayload(values: DraftValues) {
  return Object.fromEntries(
    Object.entries(values).filter(([, value]) => value !== undefined),
  )
}

const pageTypeLabels: Record<BuilderPageBundle["menuPage"]["pageType"], string> = {
  record_list: "Danh sách bản ghi",
  form: "Biểu mẫu",
  table_detail: "Bảng kèm chi tiết",
}

function transitionsForRecord(bundle: BuilderPageBundle, record: ApiCustomRecord, role: string | null) {
  if (!bundle.workflow.enabled || !record.workflowState) return []
  return bundle.workflow.transitions.filter((transition) => {
    const roleAllowed = transition.allowedRoles.length === 0
      || (role != null && transition.allowedRoles.some((allowedRole) => allowedRole.toLowerCase() === role.toLowerCase()))
    return transition.fromStateKey === record.workflowState && roleAllowed
  })
}

export function CustomRuntimePage() {
  const { pageKey, recordId } = useParams()
  const { setTitle } = usePageTitle()
  const menuPermissions = useAuthStore((state) => state.menuPermissions)
  const role = useAuthStore((state) => state.user?.role ?? null)
  const [bundle, setBundle] = useState<BuilderPageBundle | null>(null)
  const [records, setRecords] = useState<ApiCustomRecord[]>([])
  const [pageInfo, setPageInfo] = useState({ page: 1, size: 50, total: 0 })
  const [loadingBundle, setLoadingBundle] = useState(true)
  const [loadingRecords, setLoadingRecords] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [query, setQuery] = useState("")
  const [selectedId, setSelectedId] = useState<number | null>(recordId ? Number(recordId) : null)
  const [mode, setMode] = useState<"detail" | "create" | "edit">("detail")
  const [draftValues, setDraftValues] = useState<DraftValues>({})
  const [transitioningId, setTransitioningId] = useState<number | null>(null)

  const loadBundle = async () => {
    if (!pageKey) {
      setBundle(null)
      setError("Không tìm thấy page key runtime.")
      setLoadingBundle(false)
      return
    }
    setLoadingBundle(true)
    setError(null)
    try {
      setBundle(await getRuntimeCustomPage(pageKey))
    } catch {
      setError("Không tải được metadata runtime.")
      setBundle(null)
    } finally {
      setLoadingBundle(false)
    }
  }

  const loadRecords = async (search = query) => {
    if (!pageKey) {
      setRecords([])
      setPageInfo({ page: 1, size: 50, total: 0 })
      setLoadingRecords(false)
      return
    }
    setLoadingRecords(true)
    try {
      const result = await listRuntimeRecords(pageKey, {
        page: 1,
        size: 50,
        search: search.trim() || undefined,
      })
      setRecords(result.items)
      setPageInfo({ page: result.page, size: result.size, total: result.total })
    } catch {
      setError((current) => current ?? "Không tải được dữ liệu bản ghi runtime.")
      setRecords([])
      setPageInfo({ page: 1, size: 50, total: 0 })
    } finally {
      setLoadingRecords(false)
    }
  }

  const reloadAll = async () => {
    await Promise.all([loadBundle(), loadRecords()])
  }

  useEffect(() => {
    void loadBundle()
  }, [pageKey])

  useEffect(() => {
    void loadRecords()
  }, [pageKey, query])

  useEffect(() => {
    setTitle(bundle?.menuPage.label ?? "Giao diện tùy chỉnh")
  }, [bundle?.menuPage.label, setTitle])

  useEffect(() => {
    if (recordId) {
      const parsed = Number(recordId)
      setSelectedId(Number.isFinite(parsed) ? parsed : null)
      setMode("detail")
    }
  }, [recordId])

  const selectedRecord = useMemo<ApiCustomRecord | null>(() => {
    if (!records.length) return null
    return records.find((record) => record.id === selectedId) ?? records[0] ?? null
  }, [records, selectedId])

  useEffect(() => {
    if (selectedId == null && records[0]) {
      setSelectedId(records[0].id)
    }
  }, [records, selectedId])

  useEffect(() => {
    if (mode === "create") {
      setDraftValues({})
      return
    }
    setDraftValues(toDraftValues(selectedRecord?.values))
  }, [mode, selectedRecord])

  const handleSave = async () => {
    if (!pageKey || !bundle) return
    setSaving(true)
    try {
      const payload = toRecordPayload(draftValues)
      if (mode === "create") {
        const created = await createRuntimeRecord(pageKey, payload)
        setRecords((current) => [created, ...current])
        setPageInfo((current) => ({ ...current, total: current.total + 1 }))
        setSelectedId(created.id)
        setMode("detail")
        setDraftValues(toDraftValues(created.values))
        toast.success("Đã tạo bản ghi")
        return
      }
      if (mode === "edit" && selectedRecord) {
        const updated = await patchRuntimeRecord(pageKey, selectedRecord.id, payload)
        setRecords((current) =>
          current.map((record) => (record.id === updated.id ? updated : record)),
        )
        setSelectedId(updated.id)
        setMode("detail")
        setDraftValues(toDraftValues(updated.values))
        toast.success("Đã cập nhật bản ghi")
      }
    } catch {
      toast.error("Không lưu được bản ghi runtime.")
    } finally {
      setSaving(false)
    }
  }

  const handleTransition = async (toStateKey: string) => {
    if (!pageKey || !selectedRecord) return
    setTransitioningId(selectedRecord.id)
    try {
      const updated = await transitionRuntimeRecord(pageKey, selectedRecord.id, toStateKey)
      setRecords((current) => current.map((record) => (record.id === updated.id ? updated : record)))
      setSelectedId(updated.id)
      setMode("detail")
      toast.success("Đã cập nhật workflow")
    } catch {
      toast.error("Không chuyển được workflow.")
    } finally {
      setTransitioningId(null)
    }
  }

  const loading = loadingBundle || (bundle == null && loadingRecords)

  if (loading) {
    return (
      <StateMessage
        icon={<Loader2 className="h-10 w-10 animate-spin" />}
        title="Đang tải cấu hình giao diện"
        message="Frontend đang đọc metadata runtime và bản ghi thật từ API backend."
      />
    )
  }

  if (!bundle || error) {
    return (
      <StateMessage
        icon={<AlertTriangle className="h-10 w-10" />}
        title="Không tìm thấy giao diện tùy chỉnh"
        message={error ?? "Route này chưa được publish hoặc đã bị ngừng hiển thị."}
      />
    )
  }

  if (!canSeeRuntimePage(bundle.menuPage, menuPermissions, role)) {
    return (
      <StateMessage
        icon={<ShieldAlert className="h-10 w-10" />}
        title="Bạn không có quyền mở giao diện này"
        message="Frontend giữ lại kiểm tra hiển thị, nhưng backend vẫn là lớp enforce quyền cuối cùng."
      />
    )
  }

  const fieldLabels: Record<string, string> = Object.fromEntries(
    bundle.fields.map((field) => [field.fieldKey, field.label]),
  )
  const listColumns = bundle.views.listColumns
  const columnLabel = (column: { fieldKey: string; label?: string }) =>
    column.label?.trim() || fieldLabels[column.fieldKey] || column.fieldKey
  const warnings = [...bundle.menuPage.validationSummary.warnings, ...bundle.validationSummary.warnings]
  const canCreate = role == null || bundle.permissions.create.includes(role)
  const canEdit = role == null || bundle.permissions.update.includes(role)
  const selectedTransitions = selectedRecord ? transitionsForRecord(bundle, selectedRecord, role) : []

  return (
    <div className="h-full overflow-y-auto bg-slate-50 p-4 md:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-4">
        <header className="flex flex-col gap-4 rounded-md border border-slate-200 bg-white p-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h1 className="text-2xl font-semibold text-slate-950">{bundle.menuPage.label}</h1>
              <Badge variant="outline" className="border-emerald-200 bg-emerald-50 text-emerald-700">
                Đã publish v{bundle.menuPage.publishedVersion}
              </Badge>
              <Badge variant="secondary">{pageTypeLabels[bundle.menuPage.pageType]}</Badge>
              {bundle.menuPage.hasDraft && <Badge variant="outline">Có draft v{bundle.menuPage.draftVersion}</Badge>}
            </div>
            <p className="mt-1 max-w-3xl text-sm text-slate-500">{bundle.menuPage.description}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="outline" onClick={() => void reloadAll()}>
              <RefreshCw className="mr-2 h-4 w-4" />
              Tải lại
            </Button>
            <Button
              type="button"
              className="bg-slate-900 text-white hover:bg-slate-800"
              disabled={!canCreate}
              onClick={() => setMode("create")}
            >
              <Plus className="mr-2 h-4 w-4" />
              Tạo bản ghi
            </Button>
          </div>
        </header>

        {warnings.length > 0 && (
          <div className="rounded-md border border-amber-200 bg-amber-50 p-4">
            <div className="flex items-start gap-2">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
              <div>
                <p className="text-sm font-semibold text-amber-800">Cảnh báo runtime</p>
                <ul className="mt-1 space-y-1 text-sm text-amber-700">
                  {warnings.map((warning) => (
                    <li key={`${warning.section}-${warning.message}`}>{warning.message}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_360px]">
          <section className="rounded-md border border-slate-200 bg-white">
            <div className="flex flex-col gap-3 border-b border-slate-200 p-4 lg:flex-row lg:items-center lg:justify-between">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-slate-500" />
                <h2 className="text-sm font-semibold text-slate-900">Danh sách bản ghi</h2>
                <Badge variant="outline">
                  Trang {pageInfo.page} / {Math.max(1, Math.ceil(pageInfo.total / Math.max(1, pageInfo.size)))}
                </Badge>
              </div>
              <div className="relative w-full lg:w-80">
                <Search className="pointer-events-none absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                <Input
                  className="pl-9"
                  placeholder="Tìm bản ghi..."
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                />
              </div>
            </div>
            {loadingRecords ? (
              <div className="flex min-h-[240px] items-center justify-center">
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              </div>
            ) : records.length === 0 ? (
              <div className="flex min-h-[360px] flex-col items-center justify-center p-8 text-center">
                <FileText className="h-10 w-10 text-slate-400" />
                <h3 className="mt-3 text-base font-semibold text-slate-900">Chưa có bản ghi</h3>
                <p className="mt-1 text-sm text-slate-500">Runtime thật đang trả mảng rỗng cho page này.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-[760px] w-full text-sm">
                  <thead className="bg-slate-50 text-left text-xs uppercase text-slate-500">
                    <tr>
                      {listColumns.map((column) => (
                        <th key={column.fieldKey} className="px-4 py-3" style={{ width: column.width }}>
                          {columnLabel(column)}
                        </th>
                      ))}
                      <th className="px-4 py-3">Trạng thái</th>
                      <th className="px-4 py-3">Workflow</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-200">
                    {records.map((record) => (
                      <tr
                        key={record.id}
                        className={selectedRecord?.id === record.id ? "bg-slate-50" : "hover:bg-slate-50"}
                      >
                        {listColumns.map((column) => (
                          <td key={column.fieldKey} className="px-4 py-3">
                            <button
                              type="button"
                              className="text-left text-slate-900"
                              onClick={() => {
                                setSelectedId(record.id)
                                setMode("detail")
                              }}
                            >
                              {formatValue(record.values[column.fieldKey])}
                            </button>
                          </td>
                        ))}
                        <td className="px-4 py-3">
                          <Badge variant="outline">{record.state}</Badge>
                        </td>
                        <td className="px-4 py-3">
                          <Badge variant="outline">{record.workflowState ?? "No workflow"}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>

          <aside className="rounded-md border border-slate-200 bg-white">
            <div className="flex items-center justify-between border-b border-slate-200 p-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  {mode === "create" ? "Tạo bản ghi" : mode === "edit" ? "Chỉnh sửa bản ghi" : "Chi tiết bản ghi"}
                </h2>
                <p className="mt-1 text-xs text-slate-500">Đang render theo metadata publish từ backend.</p>
              </div>
              {mode === "detail" && selectedRecord && (
                <Button
                  type="button"
                  size="icon"
                  variant="outline"
                  onClick={() => setMode("edit")}
                  disabled={!canEdit}
                  title="Sửa"
                >
                  <Edit className="h-4 w-4" />
                </Button>
              )}
            </div>
            <div className="space-y-4 p-4">
              {bundle.fields.filter((field) => field.status !== "Archived").map((field) => {
                const inputId = `runtime-field-${field.id}`
                const draft = draftValues[field.fieldKey]
                const setValue = (value: DraftValue | undefined) =>
                  setDraftValues((current) => {
                    if (value === undefined || value === "") {
                      const { [field.fieldKey]: _drop, ...rest } = current
                      return rest
                    }
                    return { ...current, [field.fieldKey]: value }
                  })
                const selectClass =
                  "mt-1.5 flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm"
                return (
                  <div key={field.id}>
                    <Label htmlFor={inputId}>
                      {field.label}
                      {field.required ? " *" : ""}
                    </Label>
                    {mode === "detail" ? (
                      <Input id={inputId} className="mt-1.5" readOnly value={formatValue(selectedRecord?.values[field.fieldKey])} />
                    ) : field.type === "boolean" ? (
                      <select
                        id={inputId}
                        className={selectClass}
                        value={draft === true ? "true" : draft === false ? "false" : ""}
                        onChange={(event) => setValue(event.target.value === "" ? undefined : event.target.value === "true")}
                      >
                        <option value="">-- Chọn --</option>
                        <option value="true">Có</option>
                        <option value="false">Không</option>
                      </select>
                    ) : field.type === "single_select" || field.type === "select" ? (
                      <select
                        id={inputId}
                        className={selectClass}
                        value={typeof draft === "string" ? draft : ""}
                        onChange={(event) => setValue(event.target.value || undefined)}
                      >
                        <option value="">-- Chọn --</option>
                        {(field.options ?? []).map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                    ) : field.type === "reference" ? (
                      <Input
                        id={inputId}
                        className="mt-1.5"
                        value={
                          draft && typeof draft === "object"
                            ? String((draft as Record<string, unknown>).refId ?? "")
                            : ""
                        }
                        placeholder={`Nhập ID ${field.refEntityKey ?? "tham chiếu"}`}
                        onChange={(event) => {
                          const refId = event.target.value.trim()
                          setValue(
                            refId === ""
                              ? undefined
                              : {
                                  refType: field.refType ?? "core",
                                  refEntityKey: field.refEntityKey ?? "",
                                  refId,
                                  labelSnapshot: refId,
                                },
                          )
                        }}
                      />
                    ) : (
                      <Input
                        id={inputId}
                        className="mt-1.5"
                        type={field.type === "number" || field.type === "money" ? "number" : field.type === "date" ? "date" : "text"}
                        value={typeof draft === "string" || typeof draft === "number" ? draft : ""}
                        placeholder={field.fieldKey}
                        onChange={(event) => {
                          const raw = event.target.value
                          if (field.type === "number" || field.type === "money") {
                            setValue(raw === "" ? undefined : Number(raw))
                          } else {
                            setValue(raw)
                          }
                        }}
                      />
                    )}
                    {field.type === "reference" && (
                      <p className="mt-1 text-xs text-slate-500">
                        {field.refType}:{field.refEntityKey}
                      </p>
                    )}
                  </div>
                )
              })}
              {mode === "detail" && selectedRecord && bundle.workflow.enabled && (
                <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">Workflow</p>
                      <p className="mt-1 text-xs text-slate-500">State hiện tại lấy từ API records.</p>
                    </div>
                    <Badge variant="outline">{selectedRecord.workflowState ?? "No workflow"}</Badge>
                  </div>
                  {selectedTransitions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      {selectedTransitions.map((transition) => (
                        <Button
                          key={transition.id}
                          type="button"
                          variant="outline"
                          size="sm"
                          disabled={transitioningId === selectedRecord.id}
                          onClick={() => void handleTransition(transition.toStateKey)}
                        >
                          {transitioningId === selectedRecord.id ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                          {transition.label}
                        </Button>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <div className="flex gap-2 border-t border-slate-200 pt-4">
                <Button
                  type="button"
                  className="bg-slate-900 text-white hover:bg-slate-800"
                  disabled={mode === "detail" || saving || (mode === "create" ? !canCreate : !canEdit)}
                  onClick={() => void handleSave()}
                >
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  {saving ? "Đang lưu..." : "Lưu bản nháp"}
                </Button>
                {mode !== "detail" && (
                  <Button type="button" variant="outline" onClick={() => setMode("detail")}>
                    Hủy
                  </Button>
                )}
              </div>
              <div className="rounded-md border border-slate-200 bg-slate-50 p-3">
                <div className="flex items-center gap-2">
                  <Clock className="h-4 w-4 text-slate-500" />
                  <h3 className="text-sm font-semibold text-slate-900">Timeline / audit</h3>
                </div>
                <div className="mt-3 space-y-2">
                  {(selectedRecord?.events ?? []).length === 0 ? (
                    <div className="rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-600">
                      Chưa có audit event.
                    </div>
                  ) : (
                    selectedRecord?.events.map((event) => (
                      <div key={event.id} className="rounded-md border border-slate-200 bg-white p-2 text-xs text-slate-600">
                        <span className="font-semibold text-slate-900">{event.eventType}</span>
                        {event.fromState || event.toState ? `: ${event.fromState ?? "-"} -> ${event.toState ?? "-"}` : ""}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  )
}
