import { beforeEach, describe, expect, it, vi } from "vitest"

import {
  createBuilderPage,
  createRuntimeRecord,
  getBuilderPageBundle,
  getRuntimeCustomPage,
  listRuntimeRecords,
  saveBuilderPageBundle,
  transitionRuntimeRecord,
} from "./customInterfaceApi"

const fetchMock = vi.fn()

beforeEach(() => {
  fetchMock.mockReset()
  vi.stubGlobal("fetch", fetchMock)
  sessionStorage.clear()
  sessionStorage.setItem("accessToken", "test-token")
})

function mockEnvelope(data: unknown) {
  fetchMock.mockResolvedValueOnce({
    ok: true,
    status: 200,
    text: async () => JSON.stringify({ success: true, data }),
  })
}

const runtimeBundleEnvelope = {
  menuPage: {
    nodeType: "page",
    id: "1",
    key: "phieu_kiem_hang_hong",
    label: "Phiếu kiểm hàng hỏng",
    icon: "clipboard-check",
    parentKey: "kiem_hang",
    routePath: "/custom/phieu_kiem_hang_hong",
    entityKey: "damaged_stock_report",
    pageType: "table_detail",
    status: "Published",
    sortOrder: 0,
    description: "Ghi nhận sản phẩm hỏng",
    roles: ["Owner", "Admin"],
    entityPermission: "can_manage_inventory",
    dataPermission: "can_manage_inventory",
    version: 5,
    draftVersion: 6,
    publishedVersion: 5,
    hasDraft: true,
    publishedAt: "2026-06-03T09:00:00Z",
    publishedByName: null,
    updatedAt: "2026-06-03T09:00:00Z",
    updatedByName: null,
    etag: "page-phieu_kiem_hang_hong-published-5",
    validationSummary: { valid: true, errors: [], warnings: [] },
  },
  entityDefinition: {
    key: "damaged_stock_report",
    label: "Phiếu kiểm hàng hỏng",
    description: "Desc",
    status: "Published",
    draftVersion: 5,
    version: 5,
    publishedVersion: 5,
    etag: "entity-damaged_stock_report-published-5",
  },
  fields: [
    {
      id: "field-report-code",
      label: "Mã phiếu",
      fieldKey: "report_code",
      type: "text",
      required: true,
      filterable: true,
      sortable: true,
      searchable: true,
      order: 0,
      helperText: null,
      options: [],
      reference: {},
      validation: {},
      defaultValue: null,
      readOnly: false,
      hidden: false,
      status: "Active",
    },
  ],
  views: {
    listColumns: [{ fieldKey: "report_code", label: "Mã phiếu", width: 180, align: "left", format: "text" }],
    filterFields: ["report_code"],
    defaultSort: "report_code asc",
    formSections: [{ id: "section-main", title: "Thông tin", fieldKeys: ["report_code"] }],
    previewMode: "desktop",
  },
  permissions: {
    view: ["Owner", "Admin"],
    create: ["Owner"],
    update: ["Owner"],
    delete: ["Owner"],
  },
  validationSummary: { valid: true, errors: [], warnings: [] },
  etag: "bundle-phieu_kiem_hang_hong-v5",
}

const enabledWorkflow = {
  enabled: true,
  states: [
    { id: "s1", key: "pending", label: "Pending", type: "start" as const },
    { id: "s2", key: "approved", label: "Approved", type: "final" as const },
  ],
  transitions: [
    {
      id: "t1",
      label: "Approve",
      fromStateKey: "pending",
      toStateKey: "approved",
      allowedRoles: ["Owner" as const],
    },
  ],
}

const enabledLogicConnector = {
  enabled: true,
  rules: [
    {
      id: "r1",
      name: "Set status",
      trigger: "onCreate" as const,
      sourceFieldKey: "",
      operation: "set" as const,
      targetFieldKey: "handling_status",
      value: "New",
    },
  ],
}

describe("customInterfaceApi", () => {
  it("gets runtime page bundle from the runtime endpoint", async () => {
    mockEnvelope(runtimeBundleEnvelope)

    const data = await getRuntimeCustomPage("phieu_kiem_hang_hong")

    expect(String(fetchMock.mock.calls[0][0])).toContain("/api/v1/custom/pages/phieu_kiem_hang_hong/runtime")
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "GET" })
    expect(data.menuPage.key).toBe("phieu_kiem_hang_hong")
  })

  it("builds runtime records list query and returns the paged envelope data", async () => {
    mockEnvelope({
      items: [{ id: 1, entityKey: "damaged_stock_report", publishedVersion: 5, values: { report_code: "KH-2026-0001" }, state: "Active", createdAt: "2026-06-13T00:00:00Z", updatedAt: "2026-06-13T00:00:00Z" }],
      page: 2,
      size: 20,
      total: 1,
    })

    const data = await listRuntimeRecords("phieu_kiem_hang_hong", {
      page: 2,
      size: 20,
      search: "KH-2026",
    })

    const calledUrl = String(fetchMock.mock.calls[0][0])
    expect(calledUrl).toContain("/api/v1/custom/pages/phieu_kiem_hang_hong/records?")
    expect(calledUrl).toContain("page=2")
    expect(calledUrl).toContain("size=20")
    expect(calledUrl).toContain("search=KH-2026")
    expect(data.items[0].values.report_code).toBe("KH-2026-0001")
  })

  it("posts runtime record values to the records endpoint", async () => {
    mockEnvelope({
      id: 9,
      entityKey: "damaged_stock_report",
      publishedVersion: 5,
      values: { report_code: "KH-2026-0009" },
      state: "Active",
      createdAt: "2026-06-13T00:00:00Z",
      updatedAt: "2026-06-13T00:00:00Z",
    })

    const data = await createRuntimeRecord("phieu_kiem_hang_hong", {
      report_code: "KH-2026-0009",
    })

    expect(String(fetchMock.mock.calls[0][0])).toContain("/api/v1/custom/pages/phieu_kiem_hang_hong/records")
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "POST" })
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body))).toEqual({
      values: { report_code: "KH-2026-0009" },
    })
    expect(data.id).toBe(9)
  })

  it("maps builder bundle API data into the editor bundle shape", async () => {
    mockEnvelope(runtimeBundleEnvelope)

    const bundle = await getBuilderPageBundle("phieu_kiem_hang_hong")

    expect(String(fetchMock.mock.calls[0][0])).toContain("/api/v1/custom/builder/pages/phieu_kiem_hang_hong/bundle")
    expect(bundle?.menuPage.key).toBe("phieu_kiem_hang_hong")
    expect(bundle?.menuPage.icon).toBe("clipboard-check")
    expect(bundle?.fields[0].fieldKey).toBe("report_code")
    expect(bundle?.workflow.enabled).toBe(false)
    expect(bundle?.logicConnector.enabled).toBe(false)
  })

  it("serializes builder bundle edits back to the backend bundle request", async () => {
    mockEnvelope(runtimeBundleEnvelope)
    const bundle = await getBuilderPageBundle("phieu_kiem_hang_hong")
    if (!bundle) throw new Error("bundle missing in test")

    mockEnvelope(runtimeBundleEnvelope)
    await saveBuilderPageBundle(bundle)

    expect(String(fetchMock.mock.calls[1][0])).toContain("/api/v1/custom/builder/pages/phieu_kiem_hang_hong/bundle")
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "PATCH" })

    const body = JSON.parse(String(fetchMock.mock.calls[1][1].body))
    expect(body.entityKey).toBe("damaged_stock_report")
    expect(body.entityLabel).toBe("Phiếu kiểm hàng hỏng")
    expect(body.menuPage.key).toBe("phieu_kiem_hang_hong")
    expect(body.menuPage.icon).toBe("clipboard-check")
    expect(body.menuPage.visibilityRoles).toEqual(["Owner", "Admin"])
    expect(body.fields[0].fieldKey).toBe("report_code")
  })

  it("sends workflow and logic connector in builder bundle save requests", async () => {
    mockEnvelope(runtimeBundleEnvelope)
    const bundle = await getBuilderPageBundle("phieu_kiem_hang_hong")
    if (!bundle) throw new Error("bundle missing in test")

    mockEnvelope({
      ...runtimeBundleEnvelope,
      workflow: enabledWorkflow,
      logicConnector: enabledLogicConnector,
    })
    await saveBuilderPageBundle({
      ...bundle,
      workflow: enabledWorkflow,
      logicConnector: enabledLogicConnector,
    })

    expect(String(fetchMock.mock.calls[1][0])).toContain("/api/v1/custom/builder/pages/phieu_kiem_hang_hong/bundle")
    expect(fetchMock.mock.calls[1][1]).toMatchObject({ method: "PATCH" })
    const body = JSON.parse(String(fetchMock.mock.calls[1][1].body))
    expect(body.workflow.states[0].key).toBe("pending")
    expect(body.logicConnector.rules[0].trigger).toBe("onCreate")
  })

  it("posts workflow transitions to the runtime transition endpoint", async () => {
    mockEnvelope({
      id: 12,
      entityKey: "damaged_stock_report",
      publishedVersion: 5,
      values: { report_code: "KH-2026-0012" },
      state: "Active",
      workflowState: "approved",
      events: [],
      createdAt: "2026-06-13T00:00:00Z",
      updatedAt: "2026-06-13T00:00:00Z",
    })

    const data = await transitionRuntimeRecord("phieu_kiem_hang_hong", 12, "approved")

    expect(String(fetchMock.mock.calls[0][0])).toContain(
      "/api/v1/custom/pages/phieu_kiem_hang_hong/records/12/workflow-transitions",
    )
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "POST" })
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body))).toEqual({ toStateKey: "approved" })
    expect(data.workflowState).toBe("approved")
  })

  it("creates a builder page via menu API then loads its bundle", async () => {
    mockEnvelope({
      treeEtag: "tree-1",
      folders: [],
    })
    mockEnvelope({
      ...runtimeBundleEnvelope,
      menuPage: {
        ...runtimeBundleEnvelope.menuPage,
        key: "kiem_hang_moi",
        label: "Kiểm hàng mới",
        routePath: "/custom/kiem_hang_moi",
      },
      etag: "bundle-kiem_hang_moi-v1",
    })

    const bundle = await createBuilderPage({
      parentKey: "kiem_hang",
      label: "Kiểm hàng mới",
      key: "kiem_hang_moi",
      routePath: "/custom/kiem_hang_moi",
      entityKey: "kiem_hang_moi_entity",
      pageType: "record_list",
      roles: ["Owner"],
    })

    expect(String(fetchMock.mock.calls[0][0])).toContain("/api/v1/custom/menu-pages")
    expect(fetchMock.mock.calls[0][1]).toMatchObject({ method: "POST" })
    expect(JSON.parse(String(fetchMock.mock.calls[0][1].body))).toMatchObject({
      parentKey: "kiem_hang",
      key: "kiem_hang_moi",
      label: "Kiểm hàng mới",
      visibilityRoles: ["Owner"],
    })
    expect(String(fetchMock.mock.calls[1][0])).toContain("/api/v1/custom/builder/pages/kiem_hang_moi/bundle")
    expect(bundle.menuPage.key).toBe("kiem_hang_moi")
  })
})
