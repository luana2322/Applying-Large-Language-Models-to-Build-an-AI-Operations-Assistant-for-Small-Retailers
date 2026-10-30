import { apiJson } from "@/lib/api/http"
import type {
  BuilderMenuTree,
  ApiCreateRecordBody,
  ApiCustomBuilderBundle,
  ApiCustomRecord,
  ApiCustomRecordPage,
  ApiValidationSummary,
  BuilderPageBundle,
  CreatePageWizardDraft,
} from "@/features/custom-builder/api/customBuilderTypes"
import {
  toBuilderBundleRequest,
  toBuilderUiBundle,
  toCreatePageBody,
} from "@/features/custom-builder/api/customBuilderTypes"
import type { RuntimeCustomPage } from "@/features/custom-builder/runtime/customMenuRuntime"

export type FolderDraftBody = {
  key: string
  label: string
  icon?: string
  description?: string
  visibilityRoles?: string[]
  sortOrder?: number
  etag?: string
}

export type PageDraftBody = {
  parentKey: string
  key: string
  label: string
  icon?: string
  description?: string
  routePath: string
  entityKey: string
  pageType: RuntimeCustomPage["pageType"]
  visibilityRoles?: string[]
  entityPermission?: string
  dataPermission?: string
  sortOrder?: number
  etag?: string
}

export function getCustomMenuTree() {
  return apiJson<BuilderMenuTree>("/api/v1/custom/menu-tree", {
    method: "GET",
    auth: true,
  })
}

export function createCustomMenuFolder(body: FolderDraftBody) {
  return apiJson<BuilderMenuTree>("/api/v1/custom/menu-folders", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  })
}

export function patchCustomMenuFolder(folderKey: string, body: FolderDraftBody) {
  return apiJson<BuilderMenuTree>(`/api/v1/custom/menu-folders/${encodeURIComponent(folderKey)}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(body),
  })
}

export function createCustomMenuPage(body: PageDraftBody) {
  return apiJson<BuilderMenuTree>("/api/v1/custom/menu-pages", {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  })
}

export function patchCustomMenuPage(pageKey: string, body: PageDraftBody) {
  return apiJson<BuilderMenuTree>(`/api/v1/custom/menu-pages/${encodeURIComponent(pageKey)}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(body),
  })
}

export function publishCustomMenu(treeEtag?: string) {
  return apiJson<BuilderMenuTree>("/api/v1/custom/menu/publish", {
    method: "POST",
    auth: true,
    body: JSON.stringify({ scope: "all", etag: treeEtag }),
  })
}

export function publishCustomMenuFolder(folderKey: string) {
  return apiJson<BuilderMenuTree>(`/api/v1/custom/menu-folders/${encodeURIComponent(folderKey)}/publish`, {
    method: "POST",
    auth: true,
  })
}

export function getRuntimeCustomMenu() {
  return apiJson<BuilderMenuTree>("/api/v1/custom/runtime-menu", {
    method: "GET",
    auth: true,
  })
}

export function getRuntimeCustomPage(pageKey: string) {
  return apiJson<ApiCustomBuilderBundle>(`/api/v1/custom/pages/${encodeURIComponent(pageKey)}/runtime`, {
    method: "GET",
    auth: true,
  }).then(toBuilderUiBundle)
}

export function getBuilderPageBundle(pageKey: string): Promise<BuilderPageBundle | null> {
  return apiJson<ApiCustomBuilderBundle>(`/api/v1/custom/builder/pages/${encodeURIComponent(pageKey)}/bundle`, {
    method: "GET",
    auth: true,
  }).then(toBuilderUiBundle)
}

export function saveBuilderPageBundle(bundle: BuilderPageBundle): Promise<BuilderPageBundle> {
  return apiJson<ApiCustomBuilderBundle>(
    `/api/v1/custom/builder/pages/${encodeURIComponent(bundle.menuPage.key)}/bundle`,
    {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(toBuilderBundleRequest(bundle)),
    },
  ).then(toBuilderUiBundle)
}

export function publishBuilderPageBundle(pageKey: string, etag?: string): Promise<BuilderPageBundle> {
  return apiJson<ApiCustomBuilderBundle>(
    `/api/v1/custom/builder/pages/${encodeURIComponent(pageKey)}/publish`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify({ etag }),
    },
  ).then(toBuilderUiBundle)
}

export function validateBuilderPage(pageKey: string) {
  return apiJson<ApiValidationSummary>(`/api/v1/custom/builder/pages/${encodeURIComponent(pageKey)}/validate`, {
    method: "POST",
    auth: true,
  })
}

export async function createBuilderPage(input: CreatePageWizardDraft): Promise<BuilderPageBundle> {
  await createCustomMenuPage(toCreatePageBody(input))
  return getBuilderPageBundle(input.key)
}

export type RuntimeRecordsQuery = {
  page?: number
  size?: number
  search?: string
}

function withQuery(path: string, params: RuntimeRecordsQuery) {
  const query = new URLSearchParams()
  if (params.page != null) query.set("page", String(params.page))
  if (params.size != null) query.set("size", String(params.size))
  if (params.search) query.set("search", params.search)
  const qs = query.toString()
  return qs ? `${path}?${qs}` : path
}

export function listRuntimeRecords(pageKey: string, query: RuntimeRecordsQuery = {}) {
  return apiJson<ApiCustomRecordPage>(
    withQuery(`/api/v1/custom/pages/${encodeURIComponent(pageKey)}/records`, query),
    {
      method: "GET",
      auth: true,
    },
  )
}

export function createRuntimeRecord(pageKey: string, values: Record<string, unknown>) {
  const body: ApiCreateRecordBody = { values }
  return apiJson<ApiCustomRecord>(`/api/v1/custom/pages/${encodeURIComponent(pageKey)}/records`, {
    method: "POST",
    auth: true,
    body: JSON.stringify(body),
  })
}

export function getRuntimeRecord(pageKey: string, recordId: number) {
  return apiJson<ApiCustomRecord>(
    `/api/v1/custom/pages/${encodeURIComponent(pageKey)}/records/${recordId}`,
    {
      method: "GET",
      auth: true,
    },
  )
}

export function patchRuntimeRecord(pageKey: string, recordId: number, values: Record<string, unknown>) {
  const body: ApiCreateRecordBody = { values }
  return apiJson<ApiCustomRecord>(
    `/api/v1/custom/pages/${encodeURIComponent(pageKey)}/records/${recordId}`,
    {
      method: "PATCH",
      auth: true,
      body: JSON.stringify(body),
    },
  )
}

export function transitionRuntimeRecord(pageKey: string, recordId: number, toStateKey: string) {
  return apiJson<ApiCustomRecord>(
    `/api/v1/custom/pages/${encodeURIComponent(pageKey)}/records/${recordId}/workflow-transitions`,
    {
      method: "POST",
      auth: true,
      body: JSON.stringify({ toStateKey }),
    },
  )
}

export function deleteRuntimeRecord(pageKey: string, recordId: number) {
  return apiJson<{ id: number; deleted: boolean }>(
    `/api/v1/custom/pages/${encodeURIComponent(pageKey)}/records/${recordId}`,
    {
      method: "DELETE",
      auth: true,
    },
  )
}

export type { BuilderMenuTree, ApiCustomRecord, ApiCustomRecordPage }
