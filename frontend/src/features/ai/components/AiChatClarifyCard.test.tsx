import { render, screen, fireEvent } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AiChatClarifyCard } from "./AiChatClarifyCard"
import type { DomainClarifyPayload } from "../api/aiDomainClarifyTypes"

describe("AiChatClarifyCard", () => {
  it("renders structured chart choices and sends full choice via onPickChartChoice", () => {
    const payload: DomainClarifyPayload = {
      clarifyId: "t-chart",
      clarifyKind: "agentic",
      questions: ["Chon cach hien thi"],
      issues: [],
      guideRefs: [],
      requiredChoices: ["combo-dual-axis"],
      chartChoices: [
        {
          id: "combo-dual-axis",
          label: "Doanh thu cot + tang truong duong",
          reason: "Hai don vi khac nhau.",
          resolvedPlanPatch: { charts: [{ series: [{ dataKey: "revenue" }] }] },
        },
      ],
      continuationContext: { chart_plan_result: { status: "requires_clarification" } },
    }
    const onPickChartChoice = vi.fn()
    render(
      <AiChatClarifyCard
        payload={payload}
        onPickSuggestion={vi.fn()}
        onPickChartChoice={onPickChartChoice}
      />
    )
    fireEvent.click(screen.getByRole("button", { name: /Doanh thu cot/ }))
    // C1 fix: the FULL choice (id + resolvedPlanPatch) must travel, not just the id
    expect(onPickChartChoice).toHaveBeenCalledWith(
      expect.objectContaining({
        id: "combo-dual-axis",
        resolvedPlanPatch: { charts: [{ series: [{ dataKey: "revenue" }] }] },
      })
    )
  })
})
