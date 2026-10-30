import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { CustomRuntimePage } from "./CustomRuntimePage"

const mockGetRuntimeCustomPage = vi.fn()
const mockListRuntimeRecords = vi.fn()
const mockCreateRuntimeRecord = vi.fn()
const mockPatchRuntimeRecord = vi.fn()
const mockTransitionRuntimeRecord = vi.fn()

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    useParams: () => ({ pageKey: "phieu_kiem_hang_hong" }),
  }
})

vi.mock("@/context/PageTitleContext", () => ({
  usePageTitle: () => ({ setTitle: vi.fn() }),
}))

vi.mock("@/features/auth/store/useAuthStore", () => ({
  useAuthStore: (selector: (state: any) => unknown) =>
    selector({
      menuPermissions: {
        can_manage_inventory: true,
        can_use_custom_entities: true,
      },
      user: { role: "Owner" },
    }),
}))

vi.mock("@/features/custom-builder/api/customInterfaceApi", () => ({
  getRuntimeCustomPage: (...args: unknown[]) => mockGetRuntimeCustomPage(...args),
  listRuntimeRecords: (...args: unknown[]) => mockListRuntimeRecords(...args),
  createRuntimeRecord: (...args: unknown[]) => mockCreateRuntimeRecord(...args),
  patchRuntimeRecord: (...args: unknown[]) => mockPatchRuntimeRecord(...args),
  transitionRuntimeRecord: (...args: unknown[]) => mockTransitionRuntimeRecord(...args),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const runtimeBundle = {
  menuPage: {
    nodeType: "page",
    id: "1",
    key: "phieu_kiem_hang_hong",
    label: "Phiếu kiểm hàng hỏng",
    parentKey: "kiem_hang",
    routePath: "/custom/phieu_kiem_hang_hong",
    entityKey: "damaged_stock_report",
    pageType: "table_detail",
    status: "Published",
    sortOrder: 0,
    description: "Ghi nhận sản phẩm hỏng",
    roles: ["Owner"],
    entityPermission: "can_manage_inventory",
    dataPermission: "can_manage_inventory",
    version: 5,
    draftVersion: 6,
    publishedVersion: 5,
    hasDraft: true,
    publishedAt: "2026-06-03T09:00:00Z",
    updatedAt: "2026-06-03T09:00:00Z",
    etag: "page-phieu_kiem_hang_hong-published-5",
    validationSummary: { valid: true, errors: [], warnings: [] },
  },
  entityDefinition: {
    key: "damaged_stock_report",
    label: "Phiếu kiểm hàng hỏng",
    description: "Desc",
    status: "Published",
    version: 5,
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
      helperText: undefined,
      options: [],
      defaultValue: undefined,
      readOnly: false,
      hidden: false,
      validation: {},
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
    view: ["Owner"],
    create: ["Owner"],
    update: ["Owner"],
    delete: ["Owner"],
  },
  workflow: { enabled: false, states: [], transitions: [] },
  logicConnector: { enabled: false, rules: [] },
  validationSummary: { valid: true, errors: [], warnings: [] },
  etag: "bundle-phieu_kiem_hang_hong-v5",
}

const workflowBundle = {
  ...runtimeBundle,
  workflow: {
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
  },
}

describe("CustomRuntimePage", () => {
  beforeEach(() => {
    mockGetRuntimeCustomPage.mockReset()
    mockListRuntimeRecords.mockReset()
    mockCreateRuntimeRecord.mockReset()
    mockPatchRuntimeRecord.mockReset()
    mockTransitionRuntimeRecord.mockReset()
  })

  it("loads runtime bundle and records from the real API layer", async () => {
    mockGetRuntimeCustomPage.mockResolvedValue(runtimeBundle)
    mockListRuntimeRecords.mockResolvedValue({
      items: [
        {
          id: 1,
          entityKey: "damaged_stock_report",
          publishedVersion: 5,
          values: { report_code: "KH-2026-0001" },
          state: "Active",
          createdAt: "2026-06-13T00:00:00Z",
          updatedAt: "2026-06-13T00:00:00Z",
        },
      ],
      page: 1,
      size: 50,
      total: 1,
    })

    render(<CustomRuntimePage />)

    expect(await screen.findByText("Phiếu kiểm hàng hỏng")).toBeInTheDocument()
    expect(await screen.findByText("KH-2026-0001")).toBeInTheDocument()
    expect(mockGetRuntimeCustomPage).toHaveBeenCalledWith("phieu_kiem_hang_hong")
    expect(mockListRuntimeRecords).toHaveBeenCalledWith("phieu_kiem_hang_hong", {
      page: 1,
      size: 50,
      search: undefined,
    })
  })

  it("creates a runtime record from form values instead of writing to the mock adapter", async () => {
    mockGetRuntimeCustomPage.mockResolvedValue(runtimeBundle)
    mockListRuntimeRecords.mockResolvedValue({ items: [], page: 1, size: 50, total: 0 })
    mockCreateRuntimeRecord.mockResolvedValue({
      id: 9,
      entityKey: "damaged_stock_report",
      publishedVersion: 5,
      values: { report_code: "KH-2026-0009" },
      state: "Active",
      createdAt: "2026-06-13T00:00:00Z",
      updatedAt: "2026-06-13T00:00:00Z",
    })

    render(<CustomRuntimePage />)

    expect(await screen.findByText("Phiếu kiểm hàng hỏng")).toBeInTheDocument()
    fireEvent.click(screen.getByRole("button", { name: /Tạo bản ghi/i }))
    fireEvent.change(screen.getByLabelText("Mã phiếu *"), { target: { value: "KH-2026-0009" } })
    fireEvent.click(screen.getByRole("button", { name: /Lưu bản nháp/i }))

    await waitFor(() => {
      expect(mockCreateRuntimeRecord).toHaveBeenCalledWith("phieu_kiem_hang_hong", {
        report_code: "KH-2026-0009",
      })
    })
  })

  it("renders persisted workflow state and audit events from the records API", async () => {
    mockGetRuntimeCustomPage.mockResolvedValue(workflowBundle)
    mockListRuntimeRecords.mockResolvedValue({
      items: [
        {
          id: 12,
          entityKey: "damaged_stock_report",
          publishedVersion: 5,
          values: { report_code: "KH-1" },
          state: "Active",
          workflowState: "pending",
          events: [
            {
              id: 1,
              eventType: "created",
              fromState: null,
              toState: "pending",
              actorId: 7,
              payload: {},
              createdAt: "2026-06-13T00:00:00Z",
            },
          ],
          createdAt: "2026-06-13T00:00:00Z",
          updatedAt: "2026-06-13T00:00:00Z",
        },
      ],
      page: 1,
      size: 50,
      total: 1,
    })

    render(<CustomRuntimePage />)

    expect(await screen.findByText("KH-1")).toBeInTheDocument()
    expect(screen.getAllByText(/pending/i).length).toBeGreaterThan(0)
    expect(screen.getByText(/created/i)).toBeInTheDocument()
  })

  it("transitions records through the runtime transition API", async () => {
    mockGetRuntimeCustomPage.mockResolvedValue(workflowBundle)
    mockListRuntimeRecords.mockResolvedValue({
      items: [
        {
          id: 12,
          entityKey: "damaged_stock_report",
          publishedVersion: 5,
          values: { report_code: "KH-1" },
          state: "Active",
          workflowState: "pending",
          events: [],
          createdAt: "2026-06-13T00:00:00Z",
          updatedAt: "2026-06-13T00:00:00Z",
        },
      ],
      page: 1,
      size: 50,
      total: 1,
    })
    mockTransitionRuntimeRecord.mockResolvedValue({
      id: 12,
      entityKey: "damaged_stock_report",
      publishedVersion: 5,
      values: { report_code: "KH-1" },
      state: "Active",
      workflowState: "approved",
      events: [{ id: 2, eventType: "workflow_transition", fromState: "pending", toState: "approved", actorId: 7, payload: {} }],
      createdAt: "2026-06-13T00:00:00Z",
      updatedAt: "2026-06-13T00:00:00Z",
    })

    render(<CustomRuntimePage />)

    fireEvent.click(await screen.findByRole("button", { name: /Approve/i }))

    await waitFor(() => {
      expect(mockTransitionRuntimeRecord).toHaveBeenCalledWith("phieu_kiem_hang_hong", 12, "approved")
    })
    expect((await screen.findAllByText(/approved/i)).length).toBeGreaterThan(0)
  })
})
