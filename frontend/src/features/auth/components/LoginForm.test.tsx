import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { LoginForm } from "./LoginForm"
import { postLogin } from "@/features/auth/api/authApi"
import { ApiRequestError } from "@/lib/api/http"

// Mock the auth API
vi.mock("@/features/auth/api/authApi", () => ({
  postLogin: vi.fn(),
  postPasswordResetRequest: vi.fn(),
}))

// Mock the auth store
vi.mock("@/features/auth/store/useAuthStore", () => ({
  useAuthStore: {
    getState: () => ({
      login: vi.fn(),
    }),
  },
}))

// Mock the navigate
const mockNavigate = vi.fn()
vi.mock("react-router-dom", async (importOriginal) => {
  const actual = await importOriginal<typeof import("react-router-dom")>()
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

function renderLoginForm() {
  return render(
    <MemoryRouter>
      <LoginForm />
    </MemoryRouter>
  )
}

describe("LoginForm visual refresh", () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
  })

  afterEach(() => {
    localStorage.clear()
  })

  it("renders with brand title and description", () => {
    renderLoginForm()
    expect(screen.getByText("Chào mừng trở lại")).toBeInTheDocument()
    expect(screen.getByText("Nhập thông tin tài khoản để đăng nhập")).toBeInTheDocument()
  })

  it("renders email and password fields", () => {
    renderLoginForm()
    expect(screen.getByLabelText("Email")).toBeInTheDocument()
    expect(screen.getByLabelText("Mật khẩu")).toBeInTheDocument()
  })

  it("renders remember me checkbox", () => {
    renderLoginForm()
    expect(screen.getByLabelText("Ghi nhớ đăng nhập")).toBeInTheDocument()
  })

  it("renders forgot password link", () => {
    renderLoginForm()
    expect(screen.getByText("Quên mật khẩu?")).toBeInTheDocument()
  })

  it("renders submit button with correct text", () => {
    renderLoginForm()
    expect(screen.getByRole("button", { name: "Đăng nhập" })).toBeInTheDocument()
  })

  it("pre-fills email from localStorage rememberEmail", () => {
    localStorage.setItem("rememberEmail", "test@example.com")
    renderLoginForm()
    const emailInput = screen.getByLabelText("Email") as HTMLInputElement
    expect(emailInput.value).toBe("test@example.com")
  })

  it("does not recolor typed email and password text after submit validation", async () => {
    const user = userEvent.setup()
    renderLoginForm()
    const emailInput = screen.getByLabelText("Email") as HTMLInputElement
    const passwordInput = screen.getByLabelText("Mật khẩu") as HTMLInputElement

    vi.mocked(postLogin).mockRejectedValueOnce(
      new ApiRequestError(400, {
        success: false,
        error: "BAD_REQUEST",
        message: "Dữ liệu không hợp lệ",
        details: {
          email: "Email không đúng",
          password: "Mật khẩu không đúng",
        },
      }),
    )

    await user.type(emailInput, "user@example.com")
    await user.type(passwordInput, "123456")
    await user.click(screen.getByRole("button", { name: "Đăng nhập" }))

    await waitFor(() => expect(emailInput).toHaveClass("bg-alert-light"))
    expect(passwordInput).not.toHaveClass("text-alert")
    expect(emailInput).not.toHaveClass("text-alert")
  })

  it("shows password reset dialog when clicking Quên mật khẩu?", async () => {
    const user = userEvent.setup()
    renderLoginForm()
    await user.click(screen.getByText("Quên mật khẩu?"))
    expect(screen.getByText("Yêu cầu mật khẩu")).toBeInTheDocument()
    expect(screen.getByLabelText("Email / tên đăng nhập")).toBeInTheDocument()
  })
})
