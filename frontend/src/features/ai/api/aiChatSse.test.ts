import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"
import { startAiChatPostStream } from "./aiChatSse"

describe("startAiChatPostStream", () => {
  beforeEach(() => {
    window.sessionStorage.setItem("accessToken", "token")
  })

  afterEach(() => {
    vi.restoreAllMocks()
    window.sessionStorage.clear()
  })

  it("sends clarification resume under options.clarification", async () => {
    let body: Record<string, unknown> | null = null
    vi.stubGlobal("fetch", vi.fn(async (_url: string, init: RequestInit) => {
      body = JSON.parse(String(init.body))
      return {
        ok: true,
        body: new ReadableStream({
          start(controller) {
            controller.close()
          },
        }),
      } as Response
    }))

    startAiChatPostStream({
      query: "combo-dual-axis",
      conversationId: "conv-1",
      clarifyContinuation: {
        clarifyId: "t-chart",
        clarifyKind: "agentic",
        continuationContext: { chart_plan_result: { status: "requires_clarification" } },
        suggestedRewrite: "Doanh thu cot + tang truong duong",
        selectedOptionId: "combo-dual-axis",
        resolvedPlanPatch: { charts: [{ series: [{ dataKey: "revenue", renderAs: "bar", axis: "left" }] }] },
      },
      onDelta: vi.fn(),
      onDone: vi.fn(),
      onError: vi.fn(),
    })

    await vi.waitFor(() => {
      expect(body).not.toBeNull()
    })
    expect(body?.options).toEqual({
      clarification: {
        clarify_id: "t-chart",
        clarify_kind: "agentic",
        continuation_context: { chart_plan_result: { status: "requires_clarification" } },
        suggested_rewrite: "Doanh thu cot + tang truong duong",
        selected_option_id: "combo-dual-axis",
        resolved_plan_patch: { charts: [{ series: [{ dataKey: "revenue", renderAs: "bar", axis: "left" }] }] },
      },
    })
  })
})
