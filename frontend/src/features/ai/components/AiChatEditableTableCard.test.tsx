import { render, screen, fireEvent, within } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useAuthStore } from "@/features/auth/store/useAuthStore"
import { AiChatEditableTableCard } from "./AiChatEditableTableCard"
import type { ArtifactTablePayload } from "../api/aiEditableTableTypes"

const mockPatchResource = vi.fn(async () => ({}))

vi.mock("../api/aiEditableTableApi", () => ({
  patchResource: (...args: unknown[]) => mockPatchResource(...args),
}))

const WRITE_PERMS = {
  can_view_dashboard: true,
  can_use_ai: true,
  can_manage_inventory: false,
  can_manage_products: true,
  can_manage_customers: false,
  can_manage_orders: false,
  can_approve: false,
  can_view_finance: false,
  can_manage_staff: false,
  can_configure_alerts: false,
  can_manage_custom_builder: false,
  can_use_custom_entities: false,
}

const READ_ONLY_PERMS = {
  ...WRITE_PERMS,
  can_manage_products: false,
}

const payload: ArtifactTablePayload = {
  resourceUrl: "/api/v1/products",
  pkField: "id",
  columns: [
    { key: "id", label: "ID", editable: false, pk: true },
    { key: "sku_code", label: "SKU", editable: false, pk: false },
    { key: "name", label: "Product name", editable: true, pk: false },
    { key: "selling_price", label: "Price", editable: true, pk: false },
    { key: "status", label: "Status", editable: false, pk: false },
  ],
  rows: [
    { id: 1, sku_code: "MILK-01", name: "Fresh milk", selling_price: 12000, status: "Active" },
    { id: 2, sku_code: "TEA-02", name: "Green tea", selling_price: 18000, status: "Active" },
    { id: 3, sku_code: "CAKE-03", name: "Rice cake", selling_price: 9000, status: "Inactive" },
  ],
}

function setPermissions(perms = WRITE_PERMS) {
  useAuthStore.getState().setMenuPermissions(perms)
}

async function openDialog() {
  fireEvent.click(screen.getByRole("button", { name: /mở bảng|open table/i }))
  return screen.findByRole("dialog")
}

describe("AiChatEditableTableCard", () => {
  beforeEach(() => {
    mockPatchResource.mockClear()
    setPermissions()
  })

  it("renders a compact preview with row, column, editable-column, and permission counts", () => {
    render(<AiChatEditableTableCard payload={payload} />)

    expect(screen.getByText(/3 (records|bản ghi)/i)).toBeInTheDocument()
    expect(screen.getByText(/5 columns/i)).toBeInTheDocument()
    expect(screen.getByText(/2 (editable|cột có thể sửa)/i)).toBeInTheDocument()
    expect(screen.getByText(/Can edit|Có thể sửa/i)).toBeInTheDocument()
    expect(screen.getByText(/Fresh milk/)).toBeInTheDocument()
  })

  it("searches rows inside the dialog without changing the original payload", async () => {
    const user = userEvent.setup()
    render(<AiChatEditableTableCard payload={payload} />)

    const dialog = await openDialog()
    await user.type(within(dialog).getByRole("searchbox", { name: /search rows/i }), "tea")

    expect(within(dialog).getByText("Green tea")).toBeInTheDocument()
    expect(within(dialog).queryByText("Fresh milk")).not.toBeInTheDocument()
    expect(within(dialog).getByText(/Showing 1 of 3 rows/i)).toBeInTheDocument()
  })

  it("marks edited rows, enables save, and can discard changes", async () => {
    const user = userEvent.setup()
    render(<AiChatEditableTableCard payload={payload} />)

    const dialog = await openDialog()
    const nameInput = within(dialog).getByDisplayValue("Fresh milk")
    await user.clear(nameInput)
    await user.type(nameInput, "Fresh milk premium")

    expect(within(dialog).getByText(/1 edited row/i)).toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: /save changes/i })).toBeEnabled()
    expect(within(dialog).getByRole("row", { name: /Fresh milk premium/i })).toHaveAttribute(
      "data-edited",
      "true",
    )

    fireEvent.click(within(dialog).getByRole("button", { name: /discard changes/i }))

    expect(within(dialog).getByDisplayValue("Fresh milk")).toBeInTheDocument()
    expect(within(dialog).queryByText(/1 edited row/i)).not.toBeInTheDocument()
    expect(within(dialog).getByRole("button", { name: /save changes/i })).toBeDisabled()
  })

  it("filters to edited rows", async () => {
    const user = userEvent.setup()
    render(<AiChatEditableTableCard payload={payload} />)

    const dialog = await openDialog()
    const priceInput = within(dialog).getByDisplayValue("18000")
    await user.clear(priceInput)
    await user.type(priceInput, "19000")

    fireEvent.click(within(dialog).getByRole("button", { name: /edited rows/i }))

    expect(within(dialog).getByDisplayValue("19000")).toBeInTheDocument()
    expect(within(dialog).queryByText("Fresh milk")).not.toBeInTheDocument()
    expect(within(dialog).getByText(/Showing 1 of 3 rows/i)).toBeInTheDocument()
  })

  it("shows a no-match state for search results", async () => {
    const user = userEvent.setup()
    render(<AiChatEditableTableCard payload={payload} />)

    const dialog = await openDialog()
    await user.type(within(dialog).getByRole("searchbox", { name: /search rows/i }), "no-match")

    expect(within(dialog).getByText(/No rows match/i)).toBeInTheDocument()
  })

  it("keeps read-only users from editing or saving", async () => {
    setPermissions(READ_ONLY_PERMS)
    render(<AiChatEditableTableCard payload={payload} />)

    expect(screen.getByText(/Read only|Chỉ xem/i)).toBeInTheDocument()
    const dialog = await openDialog()

    expect(within(dialog).queryByDisplayValue("Fresh milk")).not.toBeInTheDocument()
    expect(within(dialog).queryByRole("button", { name: /save changes/i })).not.toBeInTheDocument()
    expect(within(dialog).getByText("Fresh milk")).toBeInTheDocument()
  })
})
