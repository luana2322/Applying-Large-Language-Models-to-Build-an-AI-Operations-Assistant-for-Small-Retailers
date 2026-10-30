export type ArtifactTableColumn = {
  key: string
  label: string
  editable: boolean
  pk: boolean
}

export type ArtifactTablePayload = {
  columns: ArtifactTableColumn[]
  rows: Record<string, unknown>[]
  resourceUrl: string
  pkField: string
}
