import { describe, it, expect, vi, beforeEach } from "vitest"
import * as http from "@/lib/api/http"
import { commitPageDraft, type PageDraftPayload } from "./aiPageBuilderApi"

const payload: PageDraftPayload = {
  entityKey: "dai_ly",
  entityLabel: "Quản lý đại lý",
  pageLabel: "Quản lý đại lý",
  fields: [
    { fieldKey: "ten_dai_ly", label: "Tên đại lý", type: "text", required: true },
  ],
  listColumnKeys: ["ten_dai_ly"],
  formSections: [{ title: "Thông tin", fieldKeys: ["ten_dai_ly"] }],
  viewRoles: ["Owner", "Admin"],
  sampleRecords: [{ ten_dai_ly: "Đại lý A" }],
  previewMessage: "x",
}

function mockBundle(etag = "etag-dai_ly-1", entityKey = "dai_ly"): Record<string, unknown> {
  return {
    menuPage: { id: 1, key: entityKey, label: "Trang", icon: null, routePath: `/custom/${entityKey}`,
                entityKey, pageType: "record_list", roles: ["Owner"], parentKey: "root",
                sortOrder: 0, etag, description: null, entityPermission: null, dataPermission: null },
    entityDefinition: { key: entityKey, label: "QL đại lý", description: "", status: "Active", version: 1 },
    fields: [],
    views: { listColumns: [], filterFields: [], defaultSort: null,
             formSections: [], previewMode: "desktop" },
    permissions: { view: [], create: [], update: [], delete: [] },
    workflow: { enabled: false, states: [], transitions: [] },
    logicConnector: { enabled: false, rules: [] },
    validationSummary: { valid: true, errors: [] },
    etag,
  }
}

describe("commitPageDraft", () => {
  beforeEach(() => vi.restoreAllMocks())

  function mockApiJson(calls: { path: string; body?: unknown }[], getBundleEtag = "etag-dai_ly-1") {
    vi.spyOn(http, "apiJson").mockImplementation(async (path: string, opts?: { body?: string }) => {
      const body = opts?.body ? JSON.parse(opts.body) : undefined
      calls.push({ path, body })
      if (path.includes("/bundle") && opts?.method === "GET") {
        return mockBundle(getBundleEtag) as never
      }
      if (path.includes("/bundle") && opts?.method === "PATCH") {
        const reqBody = opts?.body ? JSON.parse(opts.body) : {}
        const savedEtag = reqBody?.etag ? `saved-${reqBody.etag}` : "saved-etag-2"
        return mockBundle(savedEtag) as never
      }
      if (path.includes("/publish")) {
        return mockBundle("published-etag") as never
      }
      return { folders: [{ children: [{ key: "page-1", etag: "tree-etag" }] }] } as never
    })
  }

  function mockApiJsonForAll(
    calls: { path: string; body?: unknown; method: string }[],
    getEtag = "etag-dai_ly-1",
  ) {
    vi.spyOn(http, "apiJson").mockImplementation(async (path: string, opts?: { method?: string; body?: string }) => {
      const method = opts?.method ?? "POST"
      const body = opts?.body ? JSON.parse(opts.body) : undefined
      calls.push({ path, body, method })
      if (path.includes("/publish")) return mockBundle("published-etag") as never
      if (path.includes("/bundle")) {
        if (method === "PATCH") {
          return mockBundle(`saved-${body?.etag ?? "unknown"}`) as never
        }
        return mockBundle(getEtag) as never
      }
      return { folders: [] } as never
    })
  }

  it("gọi createPage → bundle → publish theo thứ tự", async () => {
    const calls: { path: string; body?: unknown; method: string }[] = []
    mockApiJsonForAll(calls)
    await commitPageDraft(payload)
    const pageIdx = calls.findIndex((c) => c.path.includes("/menu-pages"))
    const bundleGetIdx = calls.findIndex((c) => c.path.includes("/bundle") && c.method === "GET")
    const bundlePatchIdx = calls.findIndex((c) => c.path.includes("/bundle") && c.method === "PATCH")
    const publishIdx = calls.findIndex((c) => c.path.includes("/publish"))
    expect(pageIdx).toBeGreaterThanOrEqual(0)
    expect(bundleGetIdx).toBeGreaterThan(pageIdx)
    expect(bundlePatchIdx).toBeGreaterThan(bundleGetIdx)
    expect(publishIdx).toBeGreaterThan(bundlePatchIdx)
  })

  it("bundle body có menuPage + fields key 'type' + formSections (oracle)", async () => {
    const calls: { path: string; body?: unknown }[] = []
    mockApiJson(calls)
    await commitPageDraft(payload)
    const bundle = calls.find((c) => c.path.includes("/bundle") && c.body?.fields)!.body as any
    expect(bundle.menuPage).toBeTruthy()
    expect(bundle.menuPage.key).toBe("dai_ly")
    expect(bundle.menuPage.entityKey).toBe("dai_ly")
    expect(bundle.fields[0].type).toBe("text")        // KEY DUNG: 'type'
    expect(bundle.views.formSections).toBeTruthy()    // oracle doi formSections
    expect(bundle.permissions.view).toContain("Owner")
  })

  it("loads bundle etag after create page, saves with it, then publishes saved etag", async () => {
    const calls: { path: string; body?: unknown }[] = []
    mockApiJson(calls, "page-dai_ly-draft-1")
    await commitPageDraft(payload)
    const save = calls.find((c) => c.path.includes("/bundle") && c.body?.fields)
    const publish = calls.find((c) => c.path.includes("/publish"))
    expect(save?.body?.etag).toBe("page-dai_ly-draft-1")
    expect(publish?.body?.etag).toBe("saved-page-dai_ly-draft-1")
  })
})
