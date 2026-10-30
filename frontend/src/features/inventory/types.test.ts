/** @vitest-environment jsdom */
import { describe, it, expect } from "vitest"
import {
  isLockedReceiptStatus,
  isLockedDispatchStatus,
  isManualDispatch,
} from "./types"

describe("isLockedReceiptStatus", () => {
  it("returns true cho Done và Rejected", () => {
    expect(isLockedReceiptStatus("Done")).toBe(true)
    expect(isLockedReceiptStatus("Rejected")).toBe(true)
  })

  it("returns false cho các status còn lại", () => {
    expect(isLockedReceiptStatus("Draft")).toBe(false)
    expect(isLockedReceiptStatus("Pending")).toBe(false)
    expect(isLockedReceiptStatus("Approved")).toBe(false)
    expect(isLockedReceiptStatus("Received")).toBe(false)
  })
})

describe("isLockedDispatchStatus", () => {
  it("returns true cho Done, Full, Cancelled", () => {
    expect(isLockedDispatchStatus("Done")).toBe(true)
    expect(isLockedDispatchStatus("Full")).toBe(true)
    expect(isLockedDispatchStatus("Cancelled")).toBe(true)
  })

  it("returns false cho các status còn lại", () => {
    expect(isLockedDispatchStatus("Pending")).toBe(false)
    expect(isLockedDispatchStatus("Approved")).toBe(false)
    expect(isLockedDispatchStatus("Preparing")).toBe(false)
    expect(isLockedDispatchStatus("Dispatched")).toBe(false)
    expect(isLockedDispatchStatus("Delivered")).toBe(false)
    expect(isLockedDispatchStatus("WaitingDispatch")).toBe(false)
    expect(isLockedDispatchStatus("Delivering")).toBe(false)
    expect(isLockedDispatchStatus("Partial")).toBe(false)
    expect(isLockedDispatchStatus("Draft")).toBe(false)
  })
})

describe("isManualDispatch", () => {
  it("returns true khi manualDispatch=true", () => {
    expect(isManualDispatch({ manualDispatch: true })).toBe(true)
  })

  it("returns false khi manualDispatch=false hoặc undefined", () => {
    expect(isManualDispatch({ manualDispatch: false })).toBe(false)
    expect(isManualDispatch({})).toBe(false)
    expect(isManualDispatch(null)).toBe(false)
    expect(isManualDispatch(undefined)).toBe(false)
  })
})
