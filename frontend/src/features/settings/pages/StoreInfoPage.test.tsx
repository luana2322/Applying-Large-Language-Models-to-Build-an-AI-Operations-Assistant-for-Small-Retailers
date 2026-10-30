import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PageTitleProvider } from "@/context/PageTitleContext"
import { StoreInfoPage } from "./StoreInfoPage"

const apiMocks = vi.hoisted(() => ({
  getStoreProfile: vi.fn(),
  patchStoreProfile: vi.fn(),
  uploadStoreLogo: vi.fn(),
}))

vi.mock("../api/storeProfileApi", () => ({
  STORE_PROFILE_QUERY_KEY: ["store-profile"],
  getStoreProfile: apiMocks.getStoreProfile,
  patchStoreProfile: apiMocks.patchStoreProfile,
  uploadStoreLogo: apiMocks.uploadStoreLogo,
}))

vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn(), info: vi.fn() },
}))

const fixtureProfile = {
  id: 1,
  name: "Cửa hàng ABC",
  businessCategory: "Bán lẻ",
  address: "123 Nguyễn Huệ",
  phone: "0901234567",
  email: "abc@store.com",
  website: "https://abc.com",
  taxCode: "0123456789",
  footerNote: "Cảm ơn quý khách",
  logoUrl: null,
  facebookUrl: "https://facebook.com/abc",
  instagramHandle: "abc_store",
  defaultRetailLocationId: null,
  updatedAt: "2026-01-01T00:00:00Z",
}

function renderPage() {
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } })
  return render(
    <QueryClientProvider client={client}>
      <PageTitleProvider>
        <StoreInfoPage />
      </PageTitleProvider>
    </QueryClientProvider>,
  )
}

describe("StoreInfoPage redesign", () => {
  beforeEach(() => {
    vi.clearAllMocks()
    apiMocks.getStoreProfile.mockResolvedValue({ ...fixtureProfile })
    apiMocks.patchStoreProfile.mockResolvedValue({ ...fixtureProfile })
    apiMocks.uploadStoreLogo.mockResolvedValue({ logoUrl: "https://cdn/logo.png", updatedAt: "2026-01-01T00:00:00Z" })
  })

  it("renders view mode with store data — no textbox inputs visible", async () => {
    renderPage()

    await screen.findAllByText("Cửa hàng ABC")
    expect(screen.queryByRole("textbox")).toBeNull()
    expect(screen.getByText("0901234567")).toBeInTheDocument()
    expect(screen.getByText("abc@store.com")).toBeInTheDocument()
    expect(screen.getByText("Cảm ơn quý khách")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /chỉnh sửa thông tin/i })).toBeInTheDocument()
  })

  it("enters edit mode when clicking 'Chỉnh sửa thông tin'", async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findAllByText("Cửa hàng ABC")
    await user.click(screen.getByRole("button", { name: /chỉnh sửa thông tin/i }))

    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0)
    expect(screen.getByRole("button", { name: /lưu thay đổi/i })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /hủy/i })).toBeInTheDocument()
  })

  it("saves changed field and calls patchStoreProfile with correct payload", async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findAllByText("Cửa hàng ABC")
    await user.click(screen.getByRole("button", { name: /chỉnh sửa thông tin/i }))

    const nameInput = screen.getByDisplayValue("Cửa hàng ABC")
    await user.clear(nameInput)
    await user.type(nameInput, "Cửa hàng XYZ")

    await user.click(screen.getByRole("button", { name: /lưu thay đổi/i }))

    await waitFor(() => {
      expect(apiMocks.patchStoreProfile).toHaveBeenCalledWith(
        expect.objectContaining({ name: "Cửa hàng XYZ" }),
        expect.anything(),
      )
    })
  })

  it("cancels editing and reverts to view mode without saving", async () => {
    const user = userEvent.setup()
    renderPage()

    await screen.findAllByText("Cửa hàng ABC")
    await user.click(screen.getByRole("button", { name: /chỉnh sửa thông tin/i }))
    expect(screen.getAllByRole("textbox").length).toBeGreaterThan(0)

    await user.click(screen.getByRole("button", { name: /hủy/i }))

    expect(screen.queryByRole("textbox")).toBeNull()
    expect(apiMocks.patchStoreProfile).not.toHaveBeenCalled()
    expect(screen.getByRole("button", { name: /chỉnh sửa thông tin/i })).toBeInTheDocument()
  })
})
