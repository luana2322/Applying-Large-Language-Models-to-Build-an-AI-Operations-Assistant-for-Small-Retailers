import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"

import { CustomBuilderPage } from "./CustomBuilderPage"

const mockGetCustomMenuTree = vi.fn()
const mockGetBuilderPageBundle = vi.fn()
const mockSaveBuilderPageBundle = vi.fn()
const mockPublishBuilderPageBundle = vi.fn()
const mockCreateBuilderPage = vi.fn()

vi.mock("@/context/PageTitleContext", () => ({
  usePageTitle: () => ({ setTitle: vi.fn() }),
}))

vi.mock("@/features/auth/store/useAuthStore", () => ({
  useAuthStore: (selector: (state: any) => unknown) =>
    selector({
      menuPermissions: {
        can_manage_custom_builder: true,
      },
      user: { role: "Owner" },
    }),
}))

vi.mock("@/features/custom-builder/api/customInterfaceApi", () => ({
  getCustomMenuTree: (...args: unknown[]) => mockGetCustomMenuTree(...args),
  getBuilderPageBundle: (...args: unknown[]) => mockGetBuilderPageBundle(...args),
  saveBuilderPageBundle: (...args: unknown[]) => mockSaveBuilderPageBundle(...args),
  publishBuilderPageBundle: (...args: unknown[]) => mockPublishBuilderPageBundle(...args),
  createBuilderPage: (...args: unknown[]) => mockCreateBuilderPage(...args),
}))

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}))

const workflow = {
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

const logicConnector = {
  enabled: true,
  rules: [
    {
      id: "r1",
      name: "Set status",
      trigger: "onCreate" as const,
      sourceFieldKey: "",
      operation: "set" as const,
      targetFieldKey: "status_text",
      value: "New",
    },
  ],
}

const page = {
  nodeType: "page" as const,
  id: "1",
  key: "damaged_stock",
  label: "Damaged stock",
  parentKey: "quality",
  routePath: "/custom/damaged_stock",
  entityKey: "damaged_stock_report",
  pageType: "record_list" as const,
  status: "NeedsConfig" as const,
  sortOrder: 0,
  description: "Track damaged stock",
  roles: ["Owner" as const],
  version: 1,
  draftVersion: 1,
  publishedVersion: null,
  hasDraft: true,
  updatedAt: "2026-06-13T00:00:00Z",
  etag: "page-damaged_stock-draft-1",
  validationSummary: { valid: true, errors: [], warnings: [] },
}

const bundle = {
  menuPage: page,
  entityDefinition: {
    key: "damaged_stock_report",
    label: "Damaged stock",
    description: "Track damaged stock",
    status: "NeedsConfig" as const,
    version: 1,
  },
  fields: [
    {
      id: "field-report-code",
      label: "Report code",
      fieldKey: "report_code",
      type: "text" as const,
      required: true,
      filterable: true,
      sortable: true,
      searchable: true,
      order: 0,
      options: [],
      readOnly: false,
      hidden: false,
      validation: {},
      status: "Active" as const,
    },
    {
      id: "field-status-text",
      label: "Status text",
      fieldKey: "status_text",
      type: "text" as const,
      required: false,
      filterable: false,
      sortable: false,
      searchable: false,
      order: 1,
      options: [],
      readOnly: false,
      hidden: false,
      validation: {},
      status: "Active" as const,
    },
  ],
  views: {
    listColumns: [{ fieldKey: "report_code", label: "Report code", width: 180, align: "left" as const, format: "text" as const }],
    filterFields: ["report_code"],
    defaultSort: "report_code asc",
    formSections: [{ id: "section-main", title: "Main", fieldKeys: ["report_code", "status_text"] }],
    previewMode: "desktop" as const,
  },
  permissions: {
    view: ["Owner" as const],
    create: ["Owner" as const],
    update: ["Owner" as const],
    delete: ["Owner" as const],
  },
  workflow,
  logicConnector,
  validationSummary: { valid: true, errors: [], warnings: [] },
  etag: "bundle-damaged_stock-draft-1",
}

describe("CustomBuilderPage", () => {
  beforeEach(() => {
    mockGetCustomMenuTree.mockReset()
    mockGetBuilderPageBundle.mockReset()
    mockSaveBuilderPageBundle.mockReset()
    mockPublishBuilderPageBundle.mockReset()
    mockCreateBuilderPage.mockReset()
    mockGetCustomMenuTree.mockResolvedValue({
      treeEtag: "tree-1",
      folders: [{ ...page, nodeType: "folder", key: "quality", label: "Quality", children: [page] }],
    })
    mockGetBuilderPageBundle.mockResolvedValue(bundle)
    mockSaveBuilderPageBundle.mockResolvedValue(bundle)
  })

  it("saves workflow and logic connector metadata through the real builder API", async () => {
    render(<CustomBuilderPage />)

    fireEvent.click(await screen.findByRole("button", { name: /Sửa/i }))
    fireEvent.change(screen.getAllByRole("textbox")[0], { target: { value: "Damaged stock updated" } })
    fireEvent.click(screen.getByRole("button", { name: /L.*u.*nh/i }))

    await waitFor(() => {
      expect(mockSaveBuilderPageBundle).toHaveBeenCalledWith(
        expect.objectContaining({
          workflow: expect.objectContaining({ enabled: true }),
          logicConnector: expect.objectContaining({ enabled: true }),
        }),
      )
    })
  })

  it("does not render local-only workflow, logic, inventory, or AI copy", async () => {
    render(<CustomBuilderPage />)

    fireEvent.click(await screen.findByRole("button", { name: /Sửa/i }))

    expect(screen.queryByText(/preview local/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/sample local/i)).not.toBeInTheDocument()
    expect(screen.queryByText(/AI copilot/i)).not.toBeInTheDocument()
  })
})
