import type { UserRole } from "@/features/auth/store/useAuthStore"
import type {
  CustomRuntimePageType,
  CustomRuntimeStatus,
  RuntimeCustomMenuFolder,
  RuntimeCustomPage,
  ValidationSummary,
} from "@/features/custom-builder/runtime/customMenuRuntime"

export type BuilderStatus = CustomRuntimeStatus
export type BuilderRolePreview = UserRole | "All"
export type BuilderFieldType =
  | "text"
  | "long_text"
  | "number"
  | "money"
  | "date"
  | "boolean"
  | "single_select"
  | "select"
  | "reference"
  | "line_items"
export type ValidationSection = "menu" | "data" | "view" | "workflow" | "logic" | "inventory" | "permission" | "runtime"

export type BuilderFieldDefinition = {
  id: string
  label: string
  fieldKey: string
  type: BuilderFieldType
  required: boolean
  filterable: boolean
  sortable: boolean
  searchable: boolean
  order: number
  helperText?: string
  refType?: "core" | "custom"
  refEntityKey?: string
  options?: string[]
  defaultValue?: string | number | boolean
  readOnly?: boolean
  hidden?: boolean
  validation?: {
    minLength?: string
    maxLength?: string
    min?: string
    max?: string
    pattern?: string
    message?: string
  }
  conditionalVisibility?: {
    sourceFieldKey?: string
    operator: "equals" | "not_empty"
    value?: string
    effect: "show" | "hide"
  }
  computed?: {
    enabled: boolean
    label?: string
  }
  status: "Active" | "Draft" | "Archived"
}

export type BuilderViewColumn = {
  fieldKey: string
  label: string
  width: number
  align: "left" | "right" | "center"
  format: "text" | "number" | "currency" | "date" | "badge"
}

export function inferColumnFormat(fieldType: BuilderFieldType): BuilderViewColumn["format"] {
  if (fieldType === "money") return "currency"
  if (fieldType === "number") return "number"
  if (fieldType === "date") return "date"
  return "text"
}

export type BuilderFormSection = {
  id: string
  title: string
  fieldKeys: string[]
}

export type BuilderViewDefinition = {
  listColumns: BuilderViewColumn[]
  filterFields: string[]
  defaultSort: string
  formSections: BuilderFormSection[]
  previewMode: "desktop" | "tablet" | "mobile"
}

export type BuilderPermissionDraft = {
  view: UserRole[]
  create: UserRole[]
  update: UserRole[]
  delete: UserRole[]
}

export type BuilderWorkflowState = {
  id: string
  key: string
  label: string
  type: "start" | "normal" | "final"
}

export type BuilderWorkflowTransition = {
  id: string
  label: string
  fromStateKey: string
  toStateKey: string
  allowedRoles: UserRole[]
}

export type BuilderWorkflowDefinition = {
  enabled: boolean
  states: BuilderWorkflowState[]
  transitions: BuilderWorkflowTransition[]
}

export type BuilderLogicConnectorTrigger = "onCreate" | "onUpdate" | "onWorkflowTransition"
export type BuilderLogicConnectorOperation = "copy" | "set" | "add" | "subtract" | "multiply"

export const LOGIC_CONNECTOR_OPERATIONS: Record<BuilderLogicConnectorOperation, true> = {
  copy: true,
  set: true,
  add: true,
  subtract: true,
  multiply: true,
}

export type BuilderLogicConnectorRule = {
  id: string
  name: string
  trigger: BuilderLogicConnectorTrigger
  sourceFieldKey: string
  operation: BuilderLogicConnectorOperation
  targetFieldKey: string
  value: string
}

export type BuilderLogicConnectorDefinition = {
  enabled: boolean
  rules: BuilderLogicConnectorRule[]
}

export type BuilderPageBundle = {
  menuPage: RuntimeCustomPage
  entityDefinition: {
    key: string
    label: string
    description: string
    status: BuilderStatus
    version: number
  }
  fields: BuilderFieldDefinition[]
  views: BuilderViewDefinition
  permissions: BuilderPermissionDraft
  workflow: BuilderWorkflowDefinition
  logicConnector: BuilderLogicConnectorDefinition
  validationSummary: ValidationSummary
  etag: string
}

export type CreatePageWizardDraft = {
  parentKey: string
  parentLabel?: string
  label: string
  key: string
  icon?: string
  description?: string
  routePath: string
  entityKey: string
  pageType: CustomRuntimePageType
  roles: UserRole[]
  fields?: BuilderFieldDefinition[]
  listColumnKeys?: string[]
  formFieldKeys?: string[]
}

export type BuilderMenuTree = {
  treeEtag: string
  folders: RuntimeCustomMenuFolder[]
}

export type ApiValidationItem = {
  section: string
  message: string
  fieldKey?: string
}

export type ApiValidationSummary = {
  valid: boolean
  errors: ApiValidationItem[]
  warnings: ApiValidationItem[]
}

export type ApiCustomMenuPage = {
  nodeType: "page"
  id: string
  key: string
  label: string
  icon?: string | null
  parentKey: string
  routePath: string
  entityKey: string
  pageType: string
  status: string
  sortOrder: number
  description?: string | null
  roles: string[]
  entityPermission?: string | null
  dataPermission?: string | null
  version: number
  draftVersion?: number | null
  publishedVersion?: number | null
  hasDraft: boolean
  publishedAt?: string | null
  publishedByName?: string | null
  updatedAt?: string | null
  updatedByName?: string | null
  etag: string
  validationSummary: ApiValidationSummary
}

export type ApiCustomEntity = {
  key: string
  label: string
  description?: string | null
  status: string
  draftVersion?: number | null
  version?: number | null
  publishedVersion?: number | null
  etag?: string | null
}

export type ApiCustomField = {
  id: string
  label: string
  fieldKey: string
  type: string
  required: boolean
  filterable: boolean
  sortable: boolean
  searchable: boolean
  order: number
  helperText?: string | null
  options?: unknown
  reference?: unknown
  validation?: unknown
  defaultValue?: unknown
  readOnly: boolean
  hidden: boolean
  status: string
}

export type ApiCustomView = {
  listColumns: unknown
  filterFields: unknown
  defaultSort?: string | null
  formSections: unknown
  previewMode?: string | null
}

export type ApiCustomPermissions = {
  view: string[]
  create: string[]
  update: string[]
  delete: string[]
}

export type ApiCustomWorkflow = {
  enabled: boolean
  states: BuilderWorkflowState[]
  transitions: BuilderWorkflowTransition[]
}

export type ApiCustomLogicConnector = {
  enabled: boolean
  rules: BuilderLogicConnectorRule[]
}

export type ApiCustomBuilderBundle = {
  menuPage: ApiCustomMenuPage
  entityDefinition: ApiCustomEntity
  fields: ApiCustomField[]
  views: ApiCustomView
  permissions: ApiCustomPermissions
  workflow: ApiCustomWorkflow
  logicConnector: ApiCustomLogicConnector
  validationSummary: ApiValidationSummary
  etag: string
}

export type ApiCustomRecordEvent = {
  id: number
  eventType: string
  fromState?: string | null
  toState?: string | null
  actorId?: number | null
  payload?: Record<string, unknown> | null
  createdAt?: string | null
}

export type ApiCustomRecord = {
  id: number
  entityKey: string
  publishedVersion: number
  values: Record<string, unknown>
  state: string
  workflowState?: string | null
  events: ApiCustomRecordEvent[]
  createdAt?: string | null
  updatedAt?: string | null
}

export type ApiCustomRecordPage = {
  items: ApiCustomRecord[]
  page: number
  size: number
  total: number
}

export type ApiCreateRecordBody = {
  values: Record<string, unknown>
}

export type ApiCustomBuilderBundleRequest = {
  menuPage: {
    parentKey: string
    key: string
    label: string
    icon?: string | null
    description?: string | null
    routePath: string
    entityKey: string
    pageType: CustomRuntimePageType
    visibilityRoles: string[]
    entityPermission?: string | null
    dataPermission?: string | null
    sortOrder?: number
    etag?: string | null
  }
  entityKey: string
  entityLabel: string
  entityDescription?: string | null
  fields: Array<{
    id: string
    label: string
    fieldKey: string
    type: string
    required: boolean
    filterable: boolean
    sortable: boolean
    searchable: boolean
    order: number
    helperText?: string | null
    options: string[]
    reference: Record<string, unknown>
    validation: Record<string, unknown>
    defaultValue?: string | number | boolean | null
    readOnly: boolean
    hidden: boolean
    status: string
  }>
  views: {
    listColumns: Array<{
      fieldKey: string
      label: string
      width: number
      align: BuilderViewColumn["align"]
      format: BuilderViewColumn["format"]
    }>
    filterFields: string[]
    defaultSort: string
    formSections: Array<{ id: string; title: string; fieldKeys: string[] }>
    previewMode: "desktop" | "tablet" | "mobile"
  }
  permissions: {
    view: string[]
    create: string[]
    update: string[]
    delete: string[]
  }
  workflow: BuilderWorkflowDefinition
  logicConnector: BuilderLogicConnectorDefinition
  etag: string
}

export type CreatePageBody = {
  parentKey: string
  key: string
  label: string
  icon?: string
  description?: string
  routePath: string
  entityKey: string
  pageType: CustomRuntimePageType
  visibilityRoles: string[]
  entityPermission?: string
  dataPermission?: string
  sortOrder?: number
  etag?: string
}

export function validateBundle(bundle: BuilderPageBundle): ValidationSummary {
  const errors: ValidationSummary["errors"] = []
  const warnings: ValidationSummary["warnings"] = []
  const activeFields = bundle.fields.filter((field) => field.status !== "Archived")

  if (bundle.fields.length === 0) {
    errors.push({ section: "data", message: "Entity cần tối thiểu một field." })
  }

  const seenFieldKeys = new Set<string>()
  bundle.fields.forEach((field) => {
    if (!field.label.trim()) {
      errors.push({ section: "data", message: "Field bắt buộc phải có tên hiển thị.", fieldKey: field.fieldKey })
    }
    if (!/^[a-z0-9_]+$/.test(field.fieldKey)) {
      errors.push({ section: "data", message: `${field.fieldKey || "field"} chỉ được dùng lowercase, số và underscore.`, fieldKey: field.fieldKey })
    }
    if (seenFieldKeys.has(field.fieldKey)) {
      errors.push({ section: "data", message: `Field key ${field.fieldKey} bị trùng.`, fieldKey: field.fieldKey })
    }
    seenFieldKeys.add(field.fieldKey)
  })

  if (!bundle.views.listColumns.length) {
    errors.push({ section: "view", message: "List view cần tối thiểu một cột." })
  }

  const fieldKeys = new Set(bundle.fields.map((field) => field.fieldKey))
  bundle.views.listColumns.forEach((column) => {
    if (!fieldKeys.has(column.fieldKey)) {
      errors.push({ section: "view", message: `Cột ${column.fieldKey} đang tham chiếu field không tồn tại.` })
    }
  })
  bundle.views.filterFields.forEach((fieldKey) => {
    if (!fieldKeys.has(fieldKey)) {
      errors.push({ section: "view", message: `Filter ${fieldKey} đang tham chiếu field không tồn tại.` })
    }
  })

  const [sortFieldKey, sortDirection] = bundle.views.defaultSort.split(" ")
  if (sortFieldKey && !fieldKeys.has(sortFieldKey)) {
    errors.push({ section: "view", message: `Default sort ${sortFieldKey} đang tham chiếu field không tồn tại.` })
  }
  if (sortDirection && sortDirection !== "asc" && sortDirection !== "desc") {
    errors.push({ section: "view", message: "Default sort chỉ hỗ trợ asc hoặc desc." })
  }

  bundle.fields.forEach((field) => {
    const options = (field.options ?? []).map((option) => option.trim()).filter(Boolean)
    const normalizedOptions = options.map((option) => option.toLowerCase())
    const validation = field.validation ?? {}

    if ((field.filterable || field.sortable) && field.status !== "Archived") {
      // Gợi ý hiệu năng, không phải lỗi thiết kế -> không chặn publish (blocking: false).
      warnings.push({ section: "data", message: `${field.label} cần index backend khi publish.`, fieldKey: field.fieldKey, blocking: false })
    }
    if (field.type === "line_items") {
      warnings.push({ section: "inventory", message: `${field.label} cần giới hạn số dòng trước khi nối inventory effect.`, fieldKey: field.fieldKey })
    }
    if (field.type === "reference" && (!field.refType || !field.refEntityKey)) {
      errors.push({ section: "data", message: `${field.label} cần refType và refEntityKey.`, fieldKey: field.fieldKey })
    }
    if ((field.type === "single_select" || field.type === "select") && options.length === 0) {
      errors.push({ section: "logic", message: `${field.label} cần tối thiểu một option.`, fieldKey: field.fieldKey })
    }
    if (new Set(normalizedOptions).size !== normalizedOptions.length) {
      errors.push({ section: "logic", message: `${field.label} có option bị trùng.`, fieldKey: field.fieldKey })
    }
    if ((field.type === "single_select" || field.type === "select") && field.defaultValue && !options.includes(String(field.defaultValue))) {
      errors.push({ section: "logic", message: `${field.label} có giá trị mặc định không nằm trong option.`, fieldKey: field.fieldKey })
    }
    if ((field.type === "number" || field.type === "money") && field.defaultValue !== undefined && Number.isNaN(Number(field.defaultValue))) {
      errors.push({ section: "logic", message: `${field.label} cần default value dạng số.`, fieldKey: field.fieldKey })
    }

    const minLength = validation.minLength ? Number(validation.minLength) : null
    const maxLength = validation.maxLength ? Number(validation.maxLength) : null
    if (minLength != null && Number.isNaN(minLength)) {
      errors.push({ section: "logic", message: `${field.label} có min length không hợp lệ.`, fieldKey: field.fieldKey })
    }
    if (maxLength != null && Number.isNaN(maxLength)) {
      errors.push({ section: "logic", message: `${field.label} có max length không hợp lệ.`, fieldKey: field.fieldKey })
    }
    if (minLength != null && maxLength != null && !Number.isNaN(minLength) && !Number.isNaN(maxLength) && minLength > maxLength) {
      errors.push({ section: "logic", message: `${field.label} có min length lớn hơn max length.`, fieldKey: field.fieldKey })
    }

    const min = validation.min ? Number(validation.min) : null
    const max = validation.max ? Number(validation.max) : null
    if (min != null && Number.isNaN(min)) {
      errors.push({ section: "logic", message: `${field.label} có min number không hợp lệ.`, fieldKey: field.fieldKey })
    }
    if (max != null && Number.isNaN(max)) {
      errors.push({ section: "logic", message: `${field.label} có max number không hợp lệ.`, fieldKey: field.fieldKey })
    }
    if (min != null && max != null && !Number.isNaN(min) && !Number.isNaN(max) && min > max) {
      errors.push({ section: "logic", message: `${field.label} có min number lớn hơn max number.`, fieldKey: field.fieldKey })
    }
    if (validation.pattern) {
      try {
        new RegExp(validation.pattern)
      } catch {
        errors.push({ section: "logic", message: `${field.label} có regex pattern không hợp lệ.`, fieldKey: field.fieldKey })
      }
    }
    if (field.required && field.hidden) {
      errors.push({ section: "logic", message: `${field.label} đang bắt buộc nhưng bị ẩn.`, fieldKey: field.fieldKey })
    }
    if (field.required && field.readOnly && field.defaultValue === undefined) {
      warnings.push({ section: "logic", message: `${field.label} read-only nên cần default value trước khi publish.`, fieldKey: field.fieldKey })
    }
    if (field.conditionalVisibility) {
      if (!field.conditionalVisibility.sourceFieldKey) {
        errors.push({ section: "logic", message: `${field.label} cần chọn field điều kiện.`, fieldKey: field.fieldKey })
      } else if (field.conditionalVisibility.sourceFieldKey === field.fieldKey) {
        errors.push({ section: "logic", message: `${field.label} không được dùng chính nó làm điều kiện hiển thị.`, fieldKey: field.fieldKey })
      } else if (!activeFields.some((item) => item.fieldKey === field.conditionalVisibility?.sourceFieldKey)) {
        errors.push({ section: "logic", message: `${field.label} đang tham chiếu field điều kiện không tồn tại.`, fieldKey: field.fieldKey })
      }
    }
    if (field.computed?.enabled) {
      warnings.push({ section: "logic", message: `${field.label} mới là computed placeholder, chưa chạy công thức thật.`, fieldKey: field.fieldKey })
    }
  })

  const formFieldKeys = new Set(bundle.views.formSections.flatMap((section) => section.fieldKeys))
  bundle.views.formSections.forEach((section) => {
    if (!section.title.trim()) {
      errors.push({ section: "view", message: "Form section cần tên hiển thị." })
    }
    section.fieldKeys.forEach((fieldKey) => {
      if (!fieldKeys.has(fieldKey)) {
        errors.push({ section: "view", message: `Form section ${section.title || section.id} đang tham chiếu field ${fieldKey} không tồn tại.` })
      }
    })
  })
  bundle.fields
    .filter((field) => field.required && field.status !== "Archived")
    .forEach((field) => {
      if (!formFieldKeys.has(field.fieldKey)) {
        errors.push({ section: "view", message: `${field.label} là bắt buộc nên phải có trong form.`, fieldKey: field.fieldKey })
      }
    })

  const workflowSummary = validateWorkflow(bundle.workflow)
  workflowSummary.errors.forEach((error) => errors.push(error))
  workflowSummary.warnings.forEach((warning) => warnings.push(warning))
  const logicConnectorSummary = validateLogicConnector(bundle.logicConnector, bundle.fields)
  logicConnectorSummary.errors.forEach((error) => errors.push(error))
  logicConnectorSummary.warnings.forEach((warning) => warnings.push(warning))
  return { valid: errors.length === 0, errors, warnings }
}

function validateLogicConnector(
  logicConnector: BuilderLogicConnectorDefinition,
  fields: BuilderFieldDefinition[],
): Pick<ValidationSummary, "errors" | "warnings"> {
  const errors: ValidationSummary["errors"] = []
  const warnings: ValidationSummary["warnings"] = []
  if (!logicConnector.enabled) return { errors, warnings }

  const activeFields = fields.filter((field) => field.status !== "Archived")
  const fieldByKey = new Map(activeFields.map((field) => [field.fieldKey, field]))
  const operationsRequiringSource: BuilderLogicConnectorOperation[] = ["copy", "add", "subtract"]

  if (logicConnector.rules.length === 0) {
    errors.push({ section: "logic", message: "Logic tự động đang bật cần tối thiểu một connector rule." })
  }
  logicConnector.rules.forEach((rule) => {
    const sourceField = fieldByKey.get(rule.sourceFieldKey)
    const targetField = fieldByKey.get(rule.targetFieldKey)
    if (!rule.name.trim()) {
      errors.push({ section: "logic", message: "Connector rule cần tên hiển thị." })
    }
    if (!(rule.operation in LOGIC_CONNECTOR_OPERATIONS)) {
      errors.push({ section: "logic", message: `${rule.name || "Connector rule"} dùng operation không nằm trong allowlist.` })
    }
    if (!rule.targetFieldKey || !targetField) {
      errors.push({ section: "logic", message: `${rule.name || "Connector rule"} cần target field hợp lệ.` })
    }
    if (operationsRequiringSource.includes(rule.operation) && (!rule.sourceFieldKey || !sourceField)) {
      errors.push({ section: "logic", message: `${rule.name || "Connector rule"} cần source field hợp lệ.` })
    }
    if (rule.operation === "multiply" && !rule.sourceFieldKey && !rule.value.trim()) {
      errors.push({ section: "logic", message: `${rule.name || "Connector rule"} cần source field hoặc giá trị hệ số.` })
    }
    if (rule.operation === "set" && !rule.value.trim()) {
      errors.push({ section: "logic", message: `${rule.name || "Connector rule"} cần giá trị set cố định.` })
    }
    if (rule.operation !== "set" && rule.sourceFieldKey && rule.sourceFieldKey === rule.targetFieldKey) {
      errors.push({ section: "logic", message: `${rule.name || "Connector rule"} không được dùng cùng một field làm source và target.` })
    }
    if (["add", "subtract", "multiply"].includes(rule.operation)) {
      const sourceNumeric = sourceField?.type === "number" || sourceField?.type === "money"
      const targetNumeric = targetField?.type === "number" || targetField?.type === "money"
      if (sourceField && !sourceNumeric) {
        errors.push({ section: "logic", message: `${rule.name || "Connector rule"} cần source dạng số cho operation ${rule.operation}.`, fieldKey: rule.sourceFieldKey })
      }
      if (targetField && !targetNumeric) {
        errors.push({ section: "logic", message: `${rule.name || "Connector rule"} cần target dạng số cho operation ${rule.operation}.`, fieldKey: rule.targetFieldKey })
      }
    }
  })
  return { errors, warnings }
}

function validateWorkflow(workflow: BuilderWorkflowDefinition): Pick<ValidationSummary, "errors" | "warnings"> {
  const errors: ValidationSummary["errors"] = []
  const warnings: ValidationSummary["warnings"] = []
  if (!workflow.enabled) return { errors, warnings }

  const activeStates = workflow.states.filter((state) => state.key.trim())
  if (activeStates.length < 2) {
    errors.push({ section: "workflow", message: "Workflow bật cần tối thiểu 2 state." })
  }
  const stateKeys = new Set<string>()
  activeStates.forEach((state) => {
    if (!/^[a-z0-9_]+$/.test(state.key)) {
      errors.push({ section: "workflow", message: `${state.label || state.key} có state key không hợp lệ.` })
    }
    if (!state.label.trim()) {
      errors.push({ section: "workflow", message: `${state.key || "state"} cần tên hiển thị.` })
    }
    if (stateKeys.has(state.key)) {
      errors.push({ section: "workflow", message: `State key ${state.key} bị trùng.` })
    }
    stateKeys.add(state.key)
  })
  if (!activeStates.some((state) => state.type === "start")) {
    errors.push({ section: "workflow", message: "Workflow cần một state bắt đầu." })
  }
  if (!activeStates.some((state) => state.type === "final")) {
    errors.push({ section: "workflow", message: "Workflow cần một state kết thúc." })
  }
  if (workflow.transitions.length === 0) {
    errors.push({ section: "workflow", message: "Workflow bật cần tối thiểu một transition." })
  }
  workflow.transitions.forEach((transition) => {
    if (!transition.label.trim()) {
      errors.push({ section: "workflow", message: "Transition cần tên hiển thị." })
    }
    if (!stateKeys.has(transition.fromStateKey)) {
      errors.push({ section: "workflow", message: `${transition.label || "Transition"} thiếu state nguồn hợp lệ.` })
    }
    if (!stateKeys.has(transition.toStateKey)) {
      errors.push({ section: "workflow", message: `${transition.label || "Transition"} thiếu state đích hợp lệ.` })
    }
    if (transition.fromStateKey && transition.fromStateKey === transition.toStateKey) {
      errors.push({ section: "workflow", message: `${transition.label || "Transition"} không được đi về cùng một state.` })
    }
    if (transition.allowedRoles.length === 0) {
      warnings.push({ section: "workflow", message: `${transition.label || "Transition"} chưa chọn role thực hiện.` })
    }
  })
  return { errors, warnings }
}

function asString(value: unknown) {
  return typeof value === "string" ? value : undefined
}

function asNumber(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : undefined
}

function asStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((item): item is string => typeof item === "string") : []
}

function asObject(value: unknown): Record<string, unknown> {
  return value != null && typeof value === "object" && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : {}
}

function asPrimitive(value: unknown): string | number | boolean | undefined {
  if (typeof value === "string" || typeof value === "number" || typeof value === "boolean") {
    return value
  }
  return undefined
}

function asRuntimePageType(value: string): CustomRuntimePageType {
  if (value === "form" || value === "table_detail") return value
  return "record_list"
}

function asFieldType(value: string): BuilderFieldDefinition["type"] {
  switch (value) {
    case "long_text":
    case "number":
    case "money":
    case "date":
    case "boolean":
    case "single_select":
    case "select":
    case "reference":
    case "line_items":
      return value
    default:
      return "text"
  }
}

function asAlign(value: unknown): BuilderViewColumn["align"] {
  if (value === "right" || value === "center") return value
  return "left"
}

function asFormat(value: unknown): BuilderViewColumn["format"] {
  if (value === "number" || value === "currency" || value === "date" || value === "badge") return value
  return "text"
}

function asStatus(value: string): RuntimeCustomPage["status"] {
  if (value === "Draft" || value === "NeedsConfig" || value === "Hidden") return value
  return "Published"
}

function asFieldStatus(value: string): BuilderFieldDefinition["status"] {
  if (value === "Draft" || value === "Archived") return value
  return "Active"
}

function toValidationSummary(summary: ApiValidationSummary | null | undefined): ValidationSummary {
  return {
    valid: Boolean(summary?.valid),
    errors: Array.isArray(summary?.errors) ? summary!.errors : [],
    warnings: Array.isArray(summary?.warnings) ? summary!.warnings : [],
  }
}

function toRoles(roles: string[] | null | undefined): UserRole[] {
  return (roles ?? []).filter((role): role is UserRole =>
    role === "Owner" || role === "Admin" || role === "Manager" || role === "Staff" || role === "Warehouse",
  )
}

function toWorkflow(value: ApiCustomWorkflow | null | undefined): BuilderWorkflowDefinition {
  return {
    enabled: Boolean(value?.enabled),
    states: Array.isArray(value?.states) ? value.states : [],
    transitions: Array.isArray(value?.transitions) ? value.transitions : [],
  }
}

function toLogicConnector(value: ApiCustomLogicConnector | null | undefined): BuilderLogicConnectorDefinition {
  return {
    enabled: Boolean(value?.enabled),
    rules: Array.isArray(value?.rules) ? value.rules : [],
  }
}

function toField(field: ApiCustomField): BuilderFieldDefinition {
  const reference = asObject(field.reference)
  const validation = asObject(field.validation)
  return {
    id: field.id,
    label: field.label,
    fieldKey: field.fieldKey,
    type: asFieldType(field.type),
    required: Boolean(field.required),
    filterable: Boolean(field.filterable),
    sortable: Boolean(field.sortable),
    searchable: Boolean(field.searchable),
    order: field.order ?? 0,
    helperText: field.helperText ?? undefined,
    refType: reference.refType === "custom" ? "custom" : reference.refType === "core" ? "core" : undefined,
    refEntityKey: asString(reference.refEntityKey),
    options: asStringArray(field.options),
    defaultValue: asPrimitive(field.defaultValue),
    readOnly: Boolean(field.readOnly),
    hidden: Boolean(field.hidden),
    validation: {
      minLength: asString(validation.minLength),
      maxLength: asString(validation.maxLength),
      min: asString(validation.min),
      max: asString(validation.max),
      pattern: asString(validation.pattern),
      message: asString(validation.message),
    },
    status: asFieldStatus(field.status),
  }
}

function toListColumns(value: unknown): BuilderPageBundle["views"]["listColumns"] {
  if (!Array.isArray(value)) return []
  return value.map((item, index) => {
    const row = asObject(item)
    return {
      fieldKey: asString(row.fieldKey) ?? `field_${index}`,
      label: asString(row.label) ?? asString(row.fieldKey) ?? `Field ${index + 1}`,
      width: asNumber(row.width) ?? 180,
      align: asAlign(row.align),
      format: asFormat(row.format),
    }
  })
}

function toFormSections(value: unknown): BuilderPageBundle["views"]["formSections"] {
  if (!Array.isArray(value)) return []
  return value.map((item, index) => {
    const row = asObject(item)
    return {
      id: asString(row.id) ?? `section-${index + 1}`,
      title: asString(row.title) ?? `Section ${index + 1}`,
      fieldKeys: asStringArray(row.fieldKeys),
    }
  })
}

function toRuntimePage(page: ApiCustomMenuPage): RuntimeCustomPage {
  return {
    nodeType: "page",
    id: page.id,
    key: page.key,
    label: page.label,
    icon: page.icon ?? undefined,
    parentKey: page.parentKey,
    routePath: page.routePath,
    entityKey: page.entityKey,
    pageType: asRuntimePageType(page.pageType),
    status: asStatus(page.status),
    sortOrder: page.sortOrder,
    description: page.description ?? undefined,
    roles: toRoles(page.roles),
    entityPermission: page.entityPermission ?? undefined,
    dataPermission: page.dataPermission ?? undefined,
    version: page.version,
    draftVersion: page.draftVersion ?? undefined,
    publishedVersion: page.publishedVersion ?? page.version,
    hasDraft: Boolean(page.hasDraft),
    publishedAt: page.publishedAt ?? undefined,
    publishedByName: page.publishedByName ?? undefined,
    updatedAt: page.updatedAt ?? "",
    updatedByName: page.updatedByName ?? undefined,
    etag: page.etag,
    validationSummary: toValidationSummary(page.validationSummary),
  }
}

export function toBuilderUiBundle(data: ApiCustomBuilderBundle): BuilderPageBundle {
  return {
    menuPage: toRuntimePage(data.menuPage),
    entityDefinition: {
      key: data.entityDefinition.key,
      label: data.entityDefinition.label,
      description: data.entityDefinition.description ?? "",
      status: asStatus(data.entityDefinition.status),
      version:
        data.entityDefinition.publishedVersion ??
        data.entityDefinition.version ??
        data.entityDefinition.draftVersion ??
        1,
    },
    fields: (data.fields ?? []).map(toField),
    views: {
      listColumns: toListColumns(data.views?.listColumns),
      filterFields: asStringArray(data.views?.filterFields),
      defaultSort: data.views?.defaultSort ?? "",
      formSections: toFormSections(data.views?.formSections),
      previewMode:
        data.views?.previewMode === "tablet" || data.views?.previewMode === "mobile"
          ? data.views.previewMode
          : "desktop",
    },
    permissions: {
      view: toRoles(data.permissions?.view),
      create: toRoles(data.permissions?.create),
      update: toRoles(data.permissions?.update),
      delete: toRoles(data.permissions?.delete),
    },
    workflow: toWorkflow(data.workflow),
    logicConnector: toLogicConnector(data.logicConnector),
    validationSummary: toValidationSummary(data.validationSummary),
    etag: data.etag,
  }
}

export function toBuilderBundleRequest(bundle: BuilderPageBundle): ApiCustomBuilderBundleRequest {
  return {
    menuPage: {
      parentKey: bundle.menuPage.parentKey,
      key: bundle.menuPage.key,
      label: bundle.menuPage.label,
      icon: bundle.menuPage.icon ?? null,
      description: bundle.menuPage.description ?? null,
      routePath: bundle.menuPage.routePath,
      entityKey: bundle.menuPage.entityKey,
      pageType: bundle.menuPage.pageType,
      visibilityRoles: bundle.menuPage.roles,
      entityPermission: bundle.menuPage.entityPermission ?? null,
      dataPermission: bundle.menuPage.dataPermission ?? null,
      sortOrder: bundle.menuPage.sortOrder,
      etag: bundle.menuPage.etag,
    },
    entityKey: bundle.entityDefinition.key,
    entityLabel: bundle.entityDefinition.label,
    entityDescription: bundle.entityDefinition.description,
    fields: bundle.fields.map((field) => ({
      id: field.id,
      label: field.label,
      fieldKey: field.fieldKey,
      type: field.type,
      required: field.required,
      filterable: field.filterable,
      sortable: field.sortable,
      searchable: field.searchable,
      order: field.order,
      helperText: field.helperText ?? null,
      options: field.options ?? [],
      reference:
        field.type === "reference"
          ? {
              refType: field.refType ?? "core",
              refEntityKey: field.refEntityKey ?? null,
            }
          : {},
      validation: {
        minLength: field.validation?.minLength,
        maxLength: field.validation?.maxLength,
        min: field.validation?.min,
        max: field.validation?.max,
        pattern: field.validation?.pattern,
        message: field.validation?.message,
      },
      defaultValue: field.defaultValue ?? null,
      readOnly: Boolean(field.readOnly),
      hidden: Boolean(field.hidden),
      status: field.status,
    })),
    views: {
      listColumns: bundle.views.listColumns.map((column) => ({
        fieldKey: column.fieldKey,
        label: column.label,
        width: column.width,
        align: column.align,
        format: column.format,
      })),
      filterFields: bundle.views.filterFields,
      defaultSort: bundle.views.defaultSort,
      formSections: bundle.views.formSections.map((section) => ({
        id: section.id,
        title: section.title,
        fieldKeys: section.fieldKeys,
      })),
      previewMode: bundle.views.previewMode,
    },
    permissions: {
      view: bundle.permissions.view,
      create: bundle.permissions.create,
      update: bundle.permissions.update,
      delete: bundle.permissions.delete,
    },
    workflow: bundle.workflow,
    logicConnector: bundle.logicConnector,
    etag: bundle.etag,
  }
}

export function toCreatePageBody(input: CreatePageWizardDraft): CreatePageBody {
  return {
    parentKey: input.parentKey,
    key: input.key,
    label: input.label,
    icon: input.icon,
    description: input.description,
    routePath: input.routePath,
    entityKey: input.entityKey,
    pageType: input.pageType,
    visibilityRoles: input.roles,
  }
}
