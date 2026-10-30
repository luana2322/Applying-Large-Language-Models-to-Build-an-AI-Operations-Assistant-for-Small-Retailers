import { render, screen } from "@testing-library/react"
import { MemoryRouter, Outlet } from "react-router-dom"
import { describe, expect, it, vi } from "vitest"

import App from "./App"

vi.mock("sonner", () => ({
  Toaster: () => <div />,
}))

vi.mock("@/features/auth/store/useAuthStore", () => ({
  useAuthStore: (selector: (state: { hydrateFromSession: () => void }) => unknown) =>
    selector({ hydrateFromSession: vi.fn() }),
}))

vi.mock("@/features/auth/lib/clientSessionResume", () => ({
  hasResumeSessionInSessionStorage: () => true,
}))

vi.mock("./components/shared/layout/MainLayout", () => ({
  MainLayout: () => <Outlet />,
}))

vi.mock("./features/analytics/pages/ForecastPage", () => ({
  ForecastPage: () => <div>Forecast route registered</div>,
}))

describe("App analytics routes", () => {
  it("registers /analytics/forecast", () => {
    render(
      <MemoryRouter initialEntries={["/analytics/forecast"]}>
        <App />
      </MemoryRouter>,
    )

    expect(screen.getByText("Forecast route registered")).toBeInTheDocument()
  })
})
