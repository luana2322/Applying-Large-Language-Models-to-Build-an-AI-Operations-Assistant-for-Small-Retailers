import { apiJson } from "@/lib/api/http"

export function patchResource(
  resourceUrl: string,
  pkValue: string | number,
  fields: Record<string, unknown>,
) {
  return apiJson<Record<string, unknown>>(`${resourceUrl}/${pkValue}`, {
    method: "PATCH",
    auth: true,
    body: JSON.stringify(fields),
  })
}
