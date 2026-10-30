import { expect, test, type Page } from "@playwright/test"

const ownerEmail = "admin@smartinventory.vn"
const ownerPassword = "Admin@123"

async function login(page: Page) {
  await page.goto("/login")
  await page.getByLabel(/email/i).fill(ownerEmail)
  await page.getByLabel(/password/i).fill(ownerPassword)
  await page.getByRole("button", { name: /dang nhap|login|đăng nhập/i }).click()
  await expect(page).toHaveURL(/\/(dashboard|inventory|settings)/)
}

test("custom builder persists workflow, logic, runtime record, transition, and audit through real backend", async ({ page }) => {
  const key = `e2e_custom_${Date.now()}`
  const entityKey = `${key}_entity`

  await login(page)

  await page.goto("/settings/custom-builder")
  await expect(page.getByRole("heading", { name: /trinh thiet ke giao dien|trình thiết kế giao diện/i })).toBeVisible()

  await page.getByRole("button", { name: /tao giao dien|tạo giao diện/i }).click()
  await page.getByLabel(/ten giao dien|tên giao diện/i).fill(`E2E ${key}`)
  await page.getByLabel(/ma giao dien|mã giao diện/i).fill(key)
  await page.getByLabel(/entity key/i).fill(entityKey)
  await page.getByLabel(/route/i).fill(`/custom/${key}`)
  await page.getByRole("button", { name: /tao|luu|lưu/i }).click()

  await page.getByRole("button", { name: /nang cao|nâng cao/i }).click()
  await page.getByLabel(/bat workflow|bật workflow/i).check()
  await page.getByRole("button", { name: /them transition|thêm transition/i }).click()
  await page.getByLabel(/bat logic|bật logic/i).check()
  await page.getByRole("button", { name: /luu nhap|lưu nháp/i }).click()
  await page.getByRole("button", { name: /publish/i }).click()
  await expect(page.getByText(/da publish|đã publish/i)).toBeVisible()

  await page.goto(`/custom/${key}`)
  await expect(page.getByRole("heading", { name: `E2E ${key}` })).toBeVisible()

  await page.getByRole("button", { name: /tao ban ghi|tạo bản ghi/i }).click()
  await page.locator('input[placeholder="report_code"]').fill(`REC-${key}`)
  await page.getByRole("button", { name: /luu ban nhap|lưu bản nháp|luu/i }).click()

  await expect(page.getByText(`REC-${key}`)).toBeVisible()
  await expect(page.getByText(/pending/i)).toBeVisible()

  await page.getByRole("button", { name: /approve/i }).click()
  await expect(page.getByText(/approved/i)).toBeVisible()
  await expect(page.getByText(/workflow_transition/i)).toBeVisible()

  await page.reload()
  await expect(page.getByText(`REC-${key}`)).toBeVisible()
  await expect(page.getByText(/approved/i)).toBeVisible()
})
