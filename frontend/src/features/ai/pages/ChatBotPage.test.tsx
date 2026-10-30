import type { ReactElement } from "react"
import { render, screen, fireEvent, waitFor } from "@testing-library/react"
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

import { PageTitleProvider } from "@/context/PageTitleContext"
import { ChatBotPage } from "./ChatBotPage"

const {
  mockStartAiChatPostStream,
  mockSpeak,
  mockStop,
  mockClipboardWriteText,
} = vi.hoisted(() => ({
  mockStartAiChatPostStream: vi.fn(),
  mockSpeak: vi.fn(async () => {}),
  mockStop: vi.fn(),
  mockClipboardWriteText: vi.fn(async () => {}),
}))

vi.mock("../api/aiChatSse", () => ({
  startAiChatPostStream: mockStartAiChatPostStream,
  transcribeAudio: vi.fn(),
  TranscribeAudioError: class TranscribeAudioError extends Error {
    code: string
    constructor(code: string, message: string) {
      super(message)
      this.code = code
    }
  },
}))

vi.mock("../hooks/useTextToSpeech", () => ({
  useTextToSpeech: () => ({
    speak: mockSpeak,
    stop: mockStop,
    isSpeaking: false,
    isLoading: false,
    supported: true,
  }),
}))

vi.mock("../components/AiChatChartCard", () => ({
  AiChatChartCard: () => <div data-testid="ai-chart-card" />,
}))

vi.mock("../components/AiChatDraftTableCard", () => ({
  AiChatDraftTableCard: () => <div data-testid="ai-draft-card" />,
}))

vi.mock("../components/AiChatReceiptDraftCard", () => ({
  AiChatReceiptDraftCard: () => <div data-testid="ai-receipt-card" />,
}))

vi.mock("../components/AiChatQueryTableCard", () => ({
  AiChatQueryTableCard: () => <div data-testid="ai-query-card" />,
}))

vi.mock("../components/AiChatClarifyCard", () => ({
  AiChatClarifyCard: ({ onPickChartChoice }: { onPickChartChoice?: (choice: { id: string; label: string; resolvedPlanPatch?: Record<string, unknown> }) => void }) => (
    <button
      data-testid="ai-clarify-card"
      onClick={() => onPickChartChoice?.({
        id: "combo-dual-axis",
        label: "Doanh thu cot + tang truong duong",
        resolvedPlanPatch: { charts: [{ series: [{ dataKey: "revenue" }] }] },
      })}
    >
      clarify
    </button>
  ),
}))

function renderWithProviders(ui: ReactElement) {
  return render(<PageTitleProvider>{ui}</PageTitleProvider>)
}

describe("ChatBotPage", () => {
  beforeEach(() => {
    mockStartAiChatPostStream.mockReset()
    mockStartAiChatPostStream.mockReturnValue({ abort: vi.fn() })
    mockSpeak.mockClear()
    mockStop.mockClear()
    mockClipboardWriteText.mockClear()
    vi.restoreAllMocks()
    window.sessionStorage.clear()
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: vi.fn(),
    })
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: {
        writeText: mockClipboardWriteText,
      },
    })
  })

  afterEach(() => {
    Object.defineProperty(Element.prototype, "scrollIntoView", {
      configurable: true,
      value: undefined,
    })
    Object.defineProperty(window.navigator, "clipboard", {
      configurable: true,
      value: undefined,
    })
    vi.unstubAllGlobals()
  })

  it("renders the welcome card and hides legacy upload actions", () => {
    renderWithProviders(<ChatBotPage />)

    expect(screen.getByText("Xin chào! 👋")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cuộc hội thoại mới" })).toBeInTheDocument()
    expect(screen.queryByLabelText("Sao chép tin nhắn")).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /image/i })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: /paperclip/i })).not.toBeInTheDocument()
  })

  it("streams an assistant reply and copies the completed content", async () => {
    renderWithProviders(<ChatBotPage />)

    fireEvent.change(screen.getByPlaceholderText(/Hỏi trợ lý bằng chữ/i), {
      target: { value: "Cho tôi biết doanh thu hôm nay" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Gửi tin nhắn" }))

    const streamArgs = mockStartAiChatPostStream.mock.calls[0]?.[0]
    expect(streamArgs?.conversationId).toBeTruthy()
    streamArgs.onDeltaFull("Doanh thu hôm nay là 12 triệu.")
    streamArgs.onDone()

    expect(await screen.findByText("Doanh thu hôm nay là 12 triệu.")).toBeInTheDocument()

    const copyButton = await screen.findByRole("button", { name: "Sao chép tin nhắn" })
    fireEvent.click(copyButton)

    await waitFor(() => {
      expect(mockClipboardWriteText).toHaveBeenCalledWith("Doanh thu hôm nay là 12 triệu.")
    })
    expect(screen.getByRole("button", { name: "Đã sao chép" })).toBeInTheDocument()
  })

  it("clears the chat and regenerates the conversation id", async () => {
    window.sessionStorage.setItem("ai_chat_conversation_id", "conv-old")
    const randomSpy = vi
      .spyOn(globalThis.crypto, "randomUUID")
      .mockReturnValue("conv-new-0000-0000-0000-000000000000")
    const confirmSpy = vi.spyOn(window, "confirm").mockReturnValue(true)

    renderWithProviders(<ChatBotPage />)

    fireEvent.change(screen.getByPlaceholderText(/Hỏi trợ lý bằng chữ/i), {
      target: { value: "Tạo cuộc hội thoại thử" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Gửi tin nhắn" }))

    const streamArgs = mockStartAiChatPostStream.mock.calls[0]?.[0]
    streamArgs.onDeltaFull("Đây là phản hồi tạm.")
    streamArgs.onDone()

    expect(await screen.findByText("Đây là phản hồi tạm.")).toBeInTheDocument()

    fireEvent.click(screen.getByRole("button", { name: "Cuộc hội thoại mới" }))

    expect(confirmSpy).toHaveBeenCalled()
    expect(window.sessionStorage.getItem("ai_chat_conversation_id")).toBe("conv-new-0000-0000-0000-000000000000")
    expect(randomSpy).toHaveBeenCalledTimes(1)
    expect(screen.getByText("Xin chào! 👋")).toBeInTheDocument()
    expect(screen.queryByText("Đây là phản hồi tạm.")).not.toBeInTheDocument()
  })

  it("does not render an empty text bubble when onArtifactChart fires", async () => {
    renderWithProviders(<ChatBotPage />)

    fireEvent.change(screen.getByPlaceholderText(/Hỏi trợ lý bằng chữ/i), {
      target: { value: "vẽ biểu đồ doanh thu" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Gửi tin nhắn" }))

    const streamArgs = mockStartAiChatPostStream.mock.calls[0]?.[0]

    // Simulate: artifact arrives (no text content), then stream ends
    streamArgs.onArtifactChart({
      chartType: "bar",
      xKey: "month",
      title: "Doanh thu theo tháng",
      data: [{ month: "T4/2026", revenue: 2062000 }],
      series: [{ dataKey: "revenue", name: "Doanh thu" }],
    })
    streamArgs.onDone()

    // Chart card must render
    expect(await screen.findByTestId("ai-chart-card")).toBeInTheDocument()

    // The artifact message has no content → no text bubble with rounded border.
    // Verify every assistant bubble (rounded-tl-none border-l-2) has non-empty text.
    const assistantBubbles = document.querySelectorAll(".rounded-tl-none.border-l-2")
    assistantBubbles.forEach((el) => {
      expect((el as HTMLElement).textContent?.trim()).not.toBe("")
    })
  })

  it("resubmits structured clarify option through stream args", async () => {
    renderWithProviders(<ChatBotPage />)

    fireEvent.change(screen.getByPlaceholderText(/Hỏi trợ lý bằng chữ/i), {
      target: { value: "ve bieu do" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Gửi tin nhắn" }))

    const streamArgs = mockStartAiChatPostStream.mock.calls[0]?.[0]
    streamArgs.onClarify({
      clarifyId: "t-chart",
      clarifyKind: "agentic",
      questions: ["chon"],
      issues: [],
      guideRefs: [],
      requiredChoices: ["combo-dual-axis"],
      continuationContext: { chart_plan_result: { status: "requires_clarification" } },
      chartChoices: [{ id: "combo-dual-axis", label: "Combo", resolvedPlanPatch: {} }],
    })
    streamArgs.onDone()

    fireEvent.click(await screen.findByTestId("ai-clarify-card"))

    const secondCall = mockStartAiChatPostStream.mock.calls[1]?.[0]
    expect(secondCall.query).toBe("combo-dual-axis")
    expect(secondCall.clarifyContinuation).toMatchObject({
      clarifyId: "t-chart",
      clarifyKind: "agentic",
      selectedOptionId: "combo-dual-axis",
    })
    // C1 fix: the resolved plan patch must travel through the resume body
    expect(secondCall.clarifyContinuation.resolvedPlanPatch).toEqual(
      expect.objectContaining({ charts: expect.any(Array) })
    )
  })
})
