import { apiJson } from "@/lib/api/http"
import { buildClientSessionHeaders } from "@/features/auth/lib/clientSessionId"

export type LoginUserDto = {
  id: number
  username: string
  fullName: string
  email: string
  role: string
}

export type LoginResponseData = {
  accessToken: string
  refreshToken: string
  user: LoginUserDto
}

export type RefreshResponseData = {
  accessToken: string
  refreshToken: string
}

export type StaffPasswordResetRequestDto = {
  id: number
  userId: number
  username: string
  fullName: string
  email: string
  message: string | null
  status: string
  processedBy: number | null
  createdAt: string
  processedAt: string | null
}

export type StaffPasswordResetApproveDto = {
  id: number
  userId: number
  email: string
  status: string
  processedAt: string
}

/** Task001 — public */
export function postLogin(body: { email: string; password: string }) {
  return apiJson<LoginResponseData>("/api/v1/auth/login", {
    method: "POST",
    headers: buildClientSessionHeaders(),
    body: JSON.stringify(body),
  })
}

/** Task004 §1 — public */
export function postPasswordResetRequest(body: { username: string; message?: string }) {
  return apiJson<Record<string, unknown>>("/api/v1/auth/password-reset-requests", {
    method: "POST",
    body: JSON.stringify(body),
  })
}

export function getPasswordResetRequest(id: number) {
  return apiJson<StaffPasswordResetRequestDto>(`/api/v1/auth/password-reset-requests/${id}`, {
    method: "GET",
    auth: true,
  })
}

export function postPasswordResetApprove(id: number) {
  return apiJson<StaffPasswordResetApproveDto>(`/api/v1/auth/password-reset-requests/${id}/approve`, {
    method: "POST",
    auth: true,
  })
}

/** Task003 — public, no Bearer */
export function postRefresh(body: { refreshToken: string }) {
  return apiJson<RefreshResponseData>("/api/v1/auth/refresh", {
    method: "POST",
    headers: buildClientSessionHeaders(),
    body: JSON.stringify(body),
  })
}

/** Task002 — Bearer required */
export function postLogout(body: { refreshToken: string }) {
  return apiJson<Record<string, unknown>>("/api/v1/auth/logout", {
    method: "POST",
    body: JSON.stringify(body),
    auth: true,
  })
}

/** Đổi mật khẩu tài khoản người dùng hiện tại */
export function postChangePassword(body: { currentPassword: string; newPassword: string }) {
  return apiJson<Record<string, unknown>>("/api/v1/auth/change-password", {
    method: "POST",
    body: JSON.stringify(body),
    auth: true,
  })
}

/** Chủ cửa hàng đặt lại mật khẩu cho nhân viên */
export function postResetUserPassword(userId: number, newPassword?: string) {
  return apiJson<Record<string, unknown>>(`/api/v1/auth/users/${userId}/reset-password`, {
    method: "POST",
    body: JSON.stringify(newPassword ? { newPassword } : {}),
    auth: true,
  })
}
