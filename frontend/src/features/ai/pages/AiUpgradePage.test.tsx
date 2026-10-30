import type { ReactElement } from "react"
import { render, screen, fireEvent } from "@testing-library/react"
import { MemoryRouter } from "react-router-dom"
import { describe, it, expect, vi, beforeEach } from "vitest"

import { PageTitleProvider } from "@/context/PageTitleContext"
import { AiUpgradePage } from "./AiUpgradePage"

const { mockToastInfo, mockNavigate } = vi.hoisted(() => ({
  mockToastInfo: vi.fn(),
  mockNavigate: vi.fn(),
}))

vi.mock("sonner", () => ({ toast: { info: mockToastInfo } }))

vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderPage(ui: ReactElement) {
  return render(
    <MemoryRouter>
      <PageTitleProvider>{ui}</PageTitleProvider>
    </MemoryRouter>,
  )
}

describe("AiUpgradePage", () => {
  beforeEach(() => {
    mockToastInfo.mockClear()
    mockNavigate.mockClear()
    Object.defineProperty(Element.prototype, "scrollIntoView", { configurable: true, value: vi.fn() })
  })

  it("hiển thị hero, 3 nút CTA gói và badge Phổ biến", () => {
    renderPage(<AiUpgradePage />)
    expect(screen.getByRole("heading", { name: "Trợ lý AI cho cửa hàng của bạn" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Gói hiện tại" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Nâng cấp Pro" })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Nâng cấp Pro+" })).toBeInTheDocument()
    expect(screen.getByText("Phổ biến")).toBeInTheDocument()
  })

  it("disable CTA của gói hiện tại (Free)", () => {
    renderPage(<AiUpgradePage />)
    expect(screen.getByRole("button", { name: "Gói hiện tại" })).toBeDisabled()
  })

  it("bấm nâng cấp gói trả phí thì hiện toast", () => {
    renderPage(<AiUpgradePage />)
    fireEvent.click(screen.getByRole("button", { name: "Nâng cấp Pro" }))
    expect(mockToastInfo).toHaveBeenCalledTimes(1)
  })

  it("bấm Dùng thử miễn phí thì điều hướng tới /ai/chat", () => {
    renderPage(<AiUpgradePage />)
    fireEvent.click(screen.getByRole("button", { name: "Dùng thử miễn phí" }))
    expect(mockNavigate).toHaveBeenCalledWith("/ai/chat")
  })

  it("hiển thị dòng so sánh và câu hỏi FAQ", () => {
    renderPage(<AiUpgradePage />)
    expect(screen.getByText("Giao diện Custom Build")).toBeInTheDocument()
    expect(screen.getByText("Câu hỏi mỗi ngày được tính thế nào?")).toBeInTheDocument()
  })
})
