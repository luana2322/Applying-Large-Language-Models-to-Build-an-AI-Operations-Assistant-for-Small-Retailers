import { apiJson } from "@/lib/api/http"
import { inferColumnFormat, type BuilderFieldDefinition, type BuilderFieldType } from "@/features/custom-builder/api/customBuilderTypes"
import {
  createCustomMenuFolder,
  createCustomMenuPage,
  getBuilderPageBundle,
  saveBuilderPageBundle,
  publishBuilderPageBundle as publishBuilderPage,
  publishCustomMenuFolder,
} from "@/features/custom-builder/api/customInterfaceApi"

export type PageDraftField = {
  fieldKey: string
  label: string
  type: string
  required: boolean
  filterable?: boolean
  sortable?: boolean
  searchable?: boolean
  order?: number
  helperText?: string
  options?: string[]
  reference?: { refType: string; refEntityKey: string } | null
}

export type PageDraftFormSection = { title?: string; fieldKeys: string[] }

export type PageDraftPayload = {
  entityKey: string
  entityLabel: string
  pageLabel: string
  fields: PageDraftField[]
  listColumnKeys: string[]
  formSections: PageDraftFormSection[]
  viewRoles: string[]
  sampleRecords: Record<string, unknown>[]
  previewMessage?: string
}

export type CommitPageResult = {
  pageKey: string
  routePath: string
  published: boolean
}

const FOLDER_KEY = "ai_generated"          // folder mac dinh chua trang AI tao
const FOLDER_LABEL = "Giao diện AI tạo"

/** menuPage object dung chung cho createPage + bundle (key/entityKey phai khop). */
function buildMenuPage(p: PageDraftPayload, routePath: string) {
  return {
    parentKey: FOLDER_KEY,
    key: p.entityKey,
    label: p.pageLabel,
    routePath,
    entityKey: p.entityKey,
    pageType: "record_list",
    visibilityRoles: p.viewRoles,
  }
}

/**
 * Tạo custom page từ bản nháp AI: ensureFolder → createPage → GET bundle → PATCH bundle with etag → publish with etag.
 * Python read-only (R1) nên mọi thao tác GHI đi qua frontend → Spring sau khi user duyệt.
 * Sample records KHÔNG ghi được (backend chưa có endpoint records) — chỉ để preview.
 */
export async function commitPageDraft(p: PageDraftPayload): Promise<CommitPageResult> {
  const routePath = `/custom/${p.entityKey}`
  const menuPage = buildMenuPage(p, routePath)

  // 0) Đảm bảo folder cha tồn tại (createPage yêu cầu parent folder có sẵn).
  //    Bỏ qua lỗi nếu folder đã tồn tại (conflict).
  try {
    await createCustomMenuFolder({ key: FOLDER_KEY, label: FOLDER_LABEL })
  } catch (error) {
    const status = (error as { status?: number })?.status
    if (status !== 409) throw error
  }

  // 1) Tạo vỏ trang (record_list)
  try {
    await createCustomMenuPage(menuPage)
  } catch (error) {
    const status = (error as { status?: number })?.status
    if (status !== 409) throw error
  }

  // 2) GET bundle để lấy etag hiện tại
  let current = await getBuilderPageBundle(p.entityKey)

  // 3) Nếu bundle chưa tồn tại (null), retry 1 lần — bundle cần thời gian tạo sau khi create page
  if (!current) {
    await new Promise((r) => setTimeout(r, 300))
    current = await getBuilderPageBundle(p.entityKey)
    if (!current) {
      throw new Error("Không tìm thấy bundle sau khi tạo trang. Vui lòng thử lại.")
    }
  }

  // 4) PATCH bundle với etag — dùng current làm base, override các phần thay đổi
  const saved = await saveBuilderPageBundle({
    ...current,
    menuPage: { ...current.menuPage, ...menuPage, etag: current.etag },
    entityDefinition: { ...current.entityDefinition, key: p.entityKey, label: p.entityLabel, description: "" },
    fields: p.fields.map((f, i) => {
      const existing = current.fields[i]
      return {
        id: existing?.id ?? `new_${f.fieldKey}_${Date.now()}`,
        fieldKey: f.fieldKey,
        label: f.label,
        type: f.type as BuilderFieldDefinition["type"],
        required: f.required,
        filterable: Boolean(f.filterable),
        sortable: Boolean(f.sortable),
        searchable: Boolean(f.searchable),
        order: f.order ?? i,
        helperText: f.helperText ?? "",
        options: f.options ?? [],
        refType: f.reference?.refType as "core" | "custom" | undefined,
        refEntityKey: f.reference?.refEntityKey,
        status: "Active",
      }
    }),
    views: {
      ...current.views,
      listColumns: p.listColumnKeys.map((fieldKey) => {
        const field = p.fields.find(f => f.fieldKey === fieldKey)
        return {
          fieldKey,
          label: field?.label ?? fieldKey,
          width: 120,
          align: "left" as const,
          format: inferColumnFormat((field?.type as BuilderFieldType) ?? "text"),
        }
      }),
      filterFields: [],
      defaultSort: null,
      formSections: (p.formSections ?? []).map((s, i) => ({
        id: `section_${i}`,
        title: s.title ?? "",
        fieldKeys: s.fieldKeys,
      })),
      previewMode: "desktop",
    },
    permissions: {
      view: p.viewRoles,
      create: p.viewRoles,
      update: p.viewRoles,
      delete: p.viewRoles,
    },
    etag: current.etag,
  })

  // 5) Publish page với etag từ saved bundle
  try {
    await publishBuilderPage(p.entityKey, saved.etag)
  } catch {
    throw new Error("Tạo trang thất bại ở bước publish page. Vui lòng thử lại.")
  }

  // 6) Publish folder (cần thiết để runtime page load được)
  try {
    await publishCustomMenuFolder(FOLDER_KEY)
  } catch {
    // Folder có thể đã được publish từ lần tạo AI trước — bỏ qua lỗi
  }

  return { pageKey: p.entityKey, routePath, published: true }
}
