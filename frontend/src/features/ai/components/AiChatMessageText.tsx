import { Fragment, memo, useMemo } from "react"

type InlineToken =
  | { type: "text"; value: string }
  | { type: "strong"; value: string }
  | { type: "code"; value: string }

type Block =
  | { type: "paragraph"; text: string }
  | { type: "bullet_list"; items: string[] }
  | { type: "ordered_list"; startNumber: number; items: string[] }
  | { type: "code_block"; code: string; lang: string | null }
  | { type: "table"; headers: string[]; rows: string[][] }

function normalizeText(raw: string): string {
  const unified = raw.replace(/\r\n/g, "\n")
  const trimmedLines = unified.split("\n").map((line) => line.replace(/[ \t]+$/g, ""))
  return trimmedLines.join("\n").trim()
}

function parseInline(text: string): InlineToken[] {
  const tokens: InlineToken[] = []
  let i = 0
  while (i < text.length) {
    const strongStart = text.indexOf("**", i)
    const codeStart = text.indexOf("`", i)
    let next = -1
    let kind: "strong" | "code" | null = null
    if (strongStart !== -1 && (codeStart === -1 || strongStart < codeStart)) {
      next = strongStart
      kind = "strong"
    } else if (codeStart !== -1) {
      next = codeStart
      kind = "code"
    }
    if (next === -1 || kind === null) {
      tokens.push({ type: "text", value: text.slice(i) })
      break
    }
    if (next > i) {
      tokens.push({ type: "text", value: text.slice(i, next) })
    }
    if (kind === "strong") {
      const end = text.indexOf("**", next + 2)
      if (end === -1) {
        const remaining = text.slice(next + 2).trim()
        if (remaining) {
          tokens.push({ type: "strong", value: remaining })
        }
        break
      }
      tokens.push({ type: "strong", value: text.slice(next + 2, end) })
      i = end + 2
      continue
    }
    const end = text.indexOf("`", next + 1)
    if (end === -1) {
      tokens.push({ type: "text", value: text.slice(next) })
      break
    }
    tokens.push({ type: "code", value: text.slice(next + 1, end) })
    i = end + 1
  }
  return tokens
}

function parseBlocks(text: string): Block[] {
  const lines = text.split("\n")
  const blocks: Block[] = []
  let i = 0

  const pushParagraph = (rows: string[]) => {
    const body = rows.join("\n").trim()
    if (body) blocks.push({ type: "paragraph", text: body })
  }

  while (i < lines.length) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed) {
      i += 1
      continue
    }

    if (trimmed.startsWith("```")) {
      const langRaw = trimmed.slice(3).trim()
      const lang = langRaw.length > 0 ? langRaw : null
      i += 1
      const codeRows: string[] = []
      while (i < lines.length && !lines[i].trim().startsWith("```")) {
        codeRows.push(lines[i])
        i += 1
      }
      if (i < lines.length && lines[i].trim().startsWith("```")) i += 1
      blocks.push({ type: "code_block", code: codeRows.join("\n"), lang })
      continue
    }

    const bulletItems: string[] = []
    while (i < lines.length) {
      const bullet = lines[i].trim().match(/^[-*•]\s+(.+)$/)
      if (!bullet) break
      bulletItems.push(bullet[1].trim())
      i += 1
    }
    if (bulletItems.length > 0) {
      blocks.push({ type: "bullet_list", items: bulletItems })
      continue
    }

    const firstOrdered = lines[i].trim().match(/^(\d+)\.\s+(.+)$/)
    if (firstOrdered) {
      const startNumber = parseInt(firstOrdered[1], 10) || 1
      const orderedItems: string[] = []
      while (i < lines.length) {
        const ordered = lines[i].trim().match(/^\d+\.\s+(.+)$/)
        if (!ordered) break
        orderedItems.push(ordered[1].trim())
        i += 1
      }
      if (orderedItems.length > 0) {
        blocks.push({ type: "ordered_list", startNumber, items: orderedItems })
        continue
      }
    }

    // Markdown Table Detection
    if (trimmed.startsWith("|") && trimmed.endsWith("|")) {
      const tableLines: string[] = []
      while (i < lines.length) {
        const tLine = lines[i].trim()
        if (!tLine.startsWith("|") || !tLine.endsWith("|")) break
        tableLines.push(tLine)
        i += 1
      }
      if (tableLines.length >= 2) {
        const splitRow = (row: string) =>
          row
            .slice(1, -1)
            .split("|")
            .map((c) => c.trim())
        const headers = splitRow(tableLines[0])
        const dataRows = tableLines.slice(1).filter((r) => !/^[|\s-:]+$/.test(r))
        const rows = dataRows.map(splitRow)
        blocks.push({ type: "table", headers, rows })
        continue
      }
    }

    const paragraphRows: string[] = []
    while (i < lines.length) {
      const currentRaw = lines[i]
      const current = currentRaw.trim()
      if (!current) break
      if (current.startsWith("```")) break
      if (/^[-*•]\s+/.test(current)) break
      if (/^\d+\.\s+/.test(current)) break
      if (current.startsWith("|") && current.endsWith("|")) break
      paragraphRows.push(currentRaw)
      i += 1
    }
    pushParagraph(paragraphRows)
  }
  return blocks
}

function InlineText({ text }: { text: string }) {
  const tokens = parseInline(text)
  return (
    <>
      {tokens.map((token, idx) => {
        if (token.type === "text") return <Fragment key={idx}>{token.value}</Fragment>
        if (token.type === "strong") {
          return (
            <strong key={idx} className="font-semibold text-slate-900">
              {token.value}
            </strong>
          )
        }
        return (
          <code
            key={idx}
            className="rounded bg-slate-100 px-1 py-0.5 font-mono text-[13px] text-slate-800"
          >
            {token.value}
          </code>
        )
      })}
    </>
  )
}

export const AiChatMessageText = memo(function AiChatMessageText({ text }: { text: string }) {
  const normalized = useMemo(() => normalizeText(text || ""), [text])
  const blocks = useMemo(() => parseBlocks(normalized), [normalized])
  if (!normalized) return null
  return (
    <div className="flex-1 space-y-3 text-[15px] leading-7 text-slate-700 break-words">
      {blocks.map((block, idx) => {
        if (block.type === "paragraph") {
          return (
            <p key={idx} className="whitespace-pre-wrap">
              <InlineText text={block.text} />
            </p>
          )
        }
        if (block.type === "bullet_list") {
          return (
            <ul key={idx} className="list-disc space-y-1.5 pl-5">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <InlineText text={item} />
                </li>
              ))}
            </ul>
          )
        }
        if (block.type === "ordered_list") {
          return (
            <ol key={idx} start={block.startNumber} className="list-decimal space-y-1.5 pl-5">
              {block.items.map((item, itemIdx) => (
                <li key={itemIdx}>
                  <InlineText text={item} />
                </li>
              ))}
            </ol>
          )
        }
        if (block.type === "table") {
          return (
            <div key={idx} className="my-3 overflow-hidden rounded-xl border border-slate-200/90 shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-slate-100/80 border-b border-slate-200 text-slate-700 font-semibold">
                      {block.headers.map((h, hIdx) => (
                        <th key={hIdx} className="px-3.5 py-2.5 whitespace-nowrap">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 bg-white">
                    {block.rows.map((row, rIdx) => (
                      <tr key={rIdx} className="hover:bg-slate-50/70 transition-colors">
                        {row.map((cell, cIdx) => (
                          <td key={cIdx} className="px-3.5 py-2 text-slate-600">
                            <InlineText text={cell} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        }
        return (
          <div key={idx} className="space-y-1">
            {block.lang ? (
              <div className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                {block.lang}
              </div>
            ) : null}
            <pre className="overflow-x-auto rounded-md bg-slate-950 p-3 text-sm leading-6 text-slate-50">
              <code>{block.code}</code>
            </pre>
          </div>
        )
      })}
    </div>
  )
})
