import { describe, expect, it, vi, beforeEach, afterEach } from "vitest"

vi.mock("@/features/auth/lib/syncMenuPermissionsFromSessionStorage", () => ({
  syncMenuPermissionsFromSessionStorage: vi.fn(),
}))

import { tryRefreshAccessToken } from "./refreshAccessToken"

const SESSION_REFRESH = "session-refresh-token"

function mockFetchResponse(body: unknown, status = 200): Response {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  })
}

function mockFetchResponseWithDelay(
  body: unknown,
  status: number,
  delayMs: number,
): { promise: Promise<Response> } {
  let resolve!: (value: Response) => void
  const promise = new Promise<Response>((res) => {
    resolve = res
  })
  setTimeout(() => resolve(mockFetchResponse(body, status)), delayMs)
  return { promise }
}

describe("tryRefreshAccessToken", () => {
  beforeEach(() => {
    sessionStorage.clear()
    sessionStorage.setItem("refreshToken", SESSION_REFRESH)
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("returns false and skips fetch when no refresh token in sessionStorage", async () => {
    sessionStorage.removeItem("refreshToken")
    const fetchMock = vi.fn()
    vi.stubGlobal("fetch", fetchMock)

    const result = await tryRefreshAccessToken()

    expect(result).toBe(false)
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it("returns true and stores new tokens on successful refresh", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockFetchResponse({
        success: true,
        data: { accessToken: "new-access", refreshToken: "new-refresh" },
      }),
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await tryRefreshAccessToken()

    expect(result).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(sessionStorage.getItem("accessToken")).toBe("new-access")
    expect(sessionStorage.getItem("refreshToken")).toBe("new-refresh")
  })

  it("returns false when backend responds with non-2xx", async () => {
    const fetchMock = vi.fn().mockResolvedValue(
      mockFetchResponse(
        { success: false, error: "TOO_MANY_REQUESTS", message: "Vui lòng đợi 5 phút" },
        429,
      ),
    )
    vi.stubGlobal("fetch", fetchMock)

    const result = await tryRefreshAccessToken()

    expect(result).toBe(false)
    expect(sessionStorage.getItem("accessToken")).toBeNull()
  })

  it("shares a single fetch call when invoked concurrently (single-flight)", async () => {
    const { promise } = mockFetchResponseWithDelay(
      {
        success: true,
        data: { accessToken: "new-access", refreshToken: "new-refresh" },
      },
      200,
      20,
    )
    const fetchMock = vi.fn().mockReturnValue(promise)
    vi.stubGlobal("fetch", fetchMock)

    const p1 = tryRefreshAccessToken()
    const p2 = tryRefreshAccessToken()
    const p3 = tryRefreshAccessToken()

    const [r1, r2, r3] = await Promise.all([p1, p2, p3])

    expect(r1).toBe(true)
    expect(r2).toBe(true)
    expect(r3).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it("releases the single-flight lock after settling so a later call triggers a new fetch", async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce(
        mockFetchResponse({
          success: true,
          data: { accessToken: "first-access", refreshToken: "first-refresh" },
        }),
      )
      .mockResolvedValueOnce(
        mockFetchResponse({
          success: true,
          data: { accessToken: "second-access", refreshToken: "second-refresh" },
        }),
      )
    vi.stubGlobal("fetch", fetchMock)

    const r1 = await tryRefreshAccessToken()
    const r2 = await tryRefreshAccessToken()

    expect(r1).toBe(true)
    expect(r2).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(sessionStorage.getItem("accessToken")).toBe("second-access")
  })

  it("releases the single-flight lock when the fetch rejects so later calls can retry", async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new Error("network down"))
      .mockResolvedValueOnce(
        mockFetchResponse({
          success: true,
          data: { accessToken: "recovered-access", refreshToken: "recovered-refresh" },
        }),
      )
    vi.stubGlobal("fetch", fetchMock)

    const r1 = await tryRefreshAccessToken()
    const r2 = await tryRefreshAccessToken()

    expect(r1).toBe(false)
    expect(r2).toBe(true)
    expect(fetchMock).toHaveBeenCalledTimes(2)
    expect(sessionStorage.getItem("accessToken")).toBe("recovered-access")
  })
})
