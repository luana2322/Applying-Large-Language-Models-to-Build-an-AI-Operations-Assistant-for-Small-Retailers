import { expect, test, type Page } from "@playwright/test"

const pageKey = "phieu_kiem_hang_hong"
const entityKey = "damaged_stock_report"

type CapturedRequest = {
  method: string
  url: string
  body: unknown
}

function envelope(data: unknown) {
  return {
    success: true,
    data,
  }
}

function fakeAccessToken() {
  const payload = {
    sub: "7",
    role: "Owner",
    mp: {
      can_manage_custom_builder: true,
      can_use_custom_entities: true,
      can_manage_inventory: true,
    },
  }
  return `e30.${Buffer.from(JSON.stringify(payload)).toString("base64url")}.sig`
}

function bundle(label = "Phiếu kiểm hàng hỏng", status = "NeedsConfig") {
  return {
    menuPage: {
      nodeType: "page",
      id: "1",
      key: pageKey,
      label,
      icon: "clipboard-check",
      parentKey: "kiem_hang",
      routePath: `/custom/${pageKey}`,
      entityKey,
      pageType: "table_detail",
      status,
      sortOrder: 0,
      description: "Ghi nhận sản phẩm hỏng trong kho.",
      roles: ["Owner", "Admin"],
      entityPermission: "can_use_custom_entities",
      dataPermission: null,
      version: 2,
      draftVersion: 2,
      publishedVersion: status === "Published" ? 2 : 1,
      hasDraft: status !== "Published",
      publishedAt: status === "Published" ? "2026-06-13T00:00:00Z" : null,
      publishedByName: null,
      updatedAt: "2026-06-13T00:00:00Z",
      updatedByName: null,
      etag: `page-${pageKey}-${status.toLowerCase()}-2`,
      validationSummary: { valid: true, errors: [], warnings: [] },
    },
    entityDefinition: {
      key: entityKey,
      label,
      description: "Entity custom cho kiểm hàng.",
      status,
      draftVersion: 2,
      version: 2,
      publishedVersion: status === "Published" ? 2 : 1,
      etag: `entity-${entityKey}-${status.toLowerCase()}-2`,
    },
    fields: [
      {
        id: "field-report-code",
        label: "Mã phiếu",
        fieldKey: "report_code",
        type: "text",
        required: true,
        filterable: true,
        sortable: true,
        searchable: true,
        order: 0,
        helperText: null,
        options: [],
        reference: {},
        validation: {},
        defaultValue: null,
        readOnly: false,
        hidden: false,
        status: "Active",
      },
    ],
    views: {
      listColumns: [{ fieldKey: "report_code", label: "Mã phiếu", width: 180, align: "left", format: "text" }],
      filterFields: ["report_code"],
      defaultSort: "report_code asc",
      formSections: [{ id: "section-main", title: "Thông tin", fieldKeys: ["report_code"] }],
      previewMode: "desktop",
    },
    permissions: {
      view: ["Owner", "Admin"],
      create: ["Owner"],
      update: ["Owner"],
      delete: ["Owner"],
    },
    validationSummary: { valid: true, errors: [], warnings: [] },
    etag: `bundle-${pageKey}-${status.toLowerCase()}-2`,
  }
}

function menuTree(label = "Phiếu kiểm hàng hỏng") {
  return {
    treeEtag: "tree-e2e",
    folders: [
      {
        nodeType: "folder",
        id: "2",
        key: "kiem_hang",
        label: "Kiểm hàng",
        icon: "folder-tree",
        description: null,
        status: "Published",
        sortOrder: 0,
        roles: ["Owner", "Admin"],
        version: 1,
        draftVersion: 1,
        publishedVersion: 1,
        hasDraft: false,
        publishedAt: "2026-06-13T00:00:00Z",
        publishedByName: null,
        updatedAt: "2026-06-13T00:00:00Z",
        updatedByName: null,
        etag: "folder-kiem_hang-published-1",
        validationSummary: { valid: true, errors: [], warnings: [] },
        children: [bundle(label, "Published").menuPage],
      },
    ],
  }
}

async function seedSession(page: Page) {
  await page.addInitScript((token) => {
    localStorage.clear()
    sessionStorage.clear()
    sessionStorage.setItem("accessToken", token)
    sessionStorage.setItem(
      "user",
      JSON.stringify({
        id: 7,
        fullName: "Owner E2E",
        email: "owner@example.test",
        role: "Owner",
      }),
    )
  }, fakeAccessToken())
}

async function mockCustomBuilderApi(page: Page, captured: CapturedRequest[]) {
  let currentLabel = "Phiếu kiểm hàng hỏng"
  let published = false
  let records = [
    {
      id: 1,
      entityKey,
      publishedVersion: 1,
      values: { report_code: "KH-2026-0001" },
      state: "Active",
      createdAt: "2026-06-13T00:00:00Z",
      updatedAt: "2026-06-13T00:00:00Z",
    },
  ]

  await page.route("**/api/v1/notifications**", async (route) => {
    await route.fulfill({ json: envelope({ items: [], page: 1, limit: 50, total: 0 }) })
  })

  await page.route("**/api/v1/custom/**", async (route) => {
    const request = route.request()
    const url = new URL(request.url())
    const body = request.postDataJSON?.() ?? null
    captured.push({ method: request.method(), url: url.pathname + url.search, body })

    if (url.pathname === "/api/v1/custom/menu-tree" || url.pathname === "/api/v1/custom/runtime-menu") {
      await route.fulfill({ json: envelope(menuTree(currentLabel)) })
      return
    }

    if (url.pathname === `/api/v1/custom/builder/pages/${pageKey}/bundle` && request.method() === "GET") {
      await route.fulfill({ json: envelope(bundle(currentLabel, published ? "Published" : "NeedsConfig")) })
      return
    }

    if (url.pathname === `/api/v1/custom/builder/pages/${pageKey}/bundle` && request.method() === "PATCH") {
      const requestBody = body as { menuPage?: { label?: string } } | null
      currentLabel = requestBody?.menuPage?.label ?? currentLabel
      await route.fulfill({ json: envelope(bundle(currentLabel, "NeedsConfig")) })
      return
    }

    if (url.pathname === `/api/v1/custom/builder/pages/${pageKey}/publish` && request.method() === "POST") {
      published = true
      await route.fulfill({ json: envelope(bundle(currentLabel, "Published")) })
      return
    }

    if (url.pathname === `/api/v1/custom/pages/${pageKey}/runtime` && request.method() === "GET") {
      await route.fulfill({ json: envelope(bundle(currentLabel, "Published")) })
      return
    }

    if (url.pathname === `/api/v1/custom/pages/${pageKey}/records` && request.method() === "GET") {
      await route.fulfill({ json: envelope({ items: records, page: 1, size: 50, total: records.length }) })
      return
    }

    if (url.pathname === `/api/v1/custom/pages/${pageKey}/records` && request.method() === "POST") {
      const requestBody = body as { values?: Record<string, unknown> } | null
      const created = {
        id: 2,
        entityKey,
        publishedVersion: 2,
        values: requestBody?.values ?? {},
        state: "Active",
        createdAt: "2026-06-13T00:00:00Z",
        updatedAt: "2026-06-13T00:00:00Z",
      }
      records = [created, ...records]
      await route.fulfill({ json: envelope(created) })
      return
    }

    await route.fulfill({ status: 404, json: { success: false, error: "NOT_FOUND", message: url.pathname } })
  })
}

test.describe("custom builder API contract with intercepted backend", () => {
  test("publishes builder metadata and creates a runtime record through backend API contracts", async ({ page }) => {
    const captured: CapturedRequest[] = []
    await seedSession(page)
    await mockCustomBuilderApi(page, captured)

    await page.goto("/settings/custom-builder")
    await expect(page.getByRole("heading", { name: "Trình thiết kế giao diện" })).toBeVisible()

    await page.getByRole("button", { name: "Sửa" }).first().click()
    await expect(page.getByRole("button", { name: "Lưu nháp" })).toBeDisabled()

    await page.locator("label").filter({ hasText: "Tên giao diện" }).locator("xpath=following-sibling::input[1]").fill("Phiếu kiểm hàng hỏng E2E")
    await page.getByRole("button", { name: "Lưu nháp" }).click()
    await expect(page.getByRole("button", { name: "Lưu nháp" })).toBeDisabled()

    await page.getByRole("button", { name: "Publish" }).click()
    await expect(page.getByText("Đã publish cấu hình giao diện")).toBeVisible()

    await page.goto(`/custom/${pageKey}`)
    await expect(page.getByRole("heading", { name: "Phiếu kiểm hàng hỏng E2E" })).toBeVisible()
    await expect(page.getByText("KH-2026-0001")).toBeVisible()

    await page.getByRole("button", { name: "Tạo bản ghi" }).click()
    await page.locator('input[placeholder="report_code"]').fill("KH-2026-0099")
    await page.getByRole("button", { name: "Lưu bản nháp" }).click()
    await expect(page.getByText("KH-2026-0099")).toBeVisible()

    expect(captured).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ method: "GET", url: "/api/v1/custom/menu-tree" }),
        expect.objectContaining({ method: "GET", url: `/api/v1/custom/builder/pages/${pageKey}/bundle` }),
        expect.objectContaining({ method: "PATCH", url: `/api/v1/custom/builder/pages/${pageKey}/bundle` }),
        expect.objectContaining({ method: "POST", url: `/api/v1/custom/builder/pages/${pageKey}/publish` }),
        expect.objectContaining({ method: "GET", url: `/api/v1/custom/pages/${pageKey}/runtime` }),
        expect.objectContaining({ method: "GET", url: `/api/v1/custom/pages/${pageKey}/records?page=1&size=50` }),
        expect.objectContaining({ method: "POST", url: `/api/v1/custom/pages/${pageKey}/records` }),
      ]),
    )
    expect(captured.find((item) => item.method === "PATCH")?.body).toMatchObject({
      menuPage: { key: pageKey, label: "Phiếu kiểm hàng hỏng E2E", icon: "clipboard-check" },
      entityKey,
      fields: [expect.objectContaining({ fieldKey: "report_code" })],
    })
    expect(captured.find((item) => item.method === "POST" && item.url.endsWith("/records"))?.body).toEqual({
      values: { report_code: "KH-2026-0099" },
    })
  })
})
