import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import type { Components } from 'react-markdown'
import type { PluggableList } from 'unified'

type MarkdownCodeProps = React.HTMLAttributes<HTMLElement> & {
  inline?: boolean
  className?: string
  children?: React.ReactNode
}

const sanitizeCellValue = (value: string) =>
  value
    .replace(/\|/g, '\\|')
    .replace(/\r?\n|\r/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()

const buildMarkdownTable = (rows: string[][]) => {
  if (!rows.length || !rows[0].length) {
    return null
  }

  const header = rows[0]
  const columnCount = header.length
  const normalizedRows = rows.map((row) => {
    if (row.length === columnCount) {
      return row
    }

    if (row.length < columnCount) {
      return [...row, ...Array(columnCount - row.length).fill('')]
    }

    return row.slice(0, columnCount)
  })

  const headerLine = `| ${header.map((cell) => sanitizeCellValue(cell)).join(' | ')} |`
  const separatorLine = `| ${Array(columnCount)
    .fill('---')
    .join(' | ')} |`

  const bodyLines = normalizedRows
    .slice(1)
    .map((cells) => `| ${cells.map((cell) => sanitizeCellValue(cell)).join(' | ')} |`)

  return [headerLine, separatorLine, ...bodyLines].join('\n').trim()
}

export const defaultMarkdownComponents: Components = {
  h1: (props) => <h1 className="text-3xl font-bold text-foreground mt-8 mb-4" {...props} />,
  h2: (props) => <h2 className="text-2xl font-semibold text-foreground mt-6 mb-3" {...props} />,
  h3: (props) => <h3 className="text-xl font-semibold text-foreground mt-5 mb-2" {...props} />,
  p: (props) => <p className="leading-relaxed text-foreground mb-4" {...props} />,
  a: (props) => (
    <a className="text-primary underline decoration-2 underline-offset-4 hover:text-primary/80" {...props} />
  ),
  ul: (props) => <ul className="list-disc list-outside pl-6 space-y-2 mb-4" {...props} />,
  ol: (props) => <ol className="list-decimal list-outside pl-6 space-y-2 mb-4" {...props} />,
  blockquote: (props) => (
    <blockquote className="border-l-4 border-primary/60 pl-4 italic text-foreground/90 my-6" {...props} />
  ),
  code: ({ inline, className, children, ...props }: MarkdownCodeProps) => {
    if (inline) {
      return (
        <code className="px-1.5 py-0.5 rounded bg-muted text-sm font-mono" {...props}>
          {children}
        </code>
      )
    }

    return (
      <pre className="overflow-x-auto rounded-lg border border-border bg-muted/60 p-4 text-sm">
        <code className={className} {...props}>
          {children}
        </code>
      </pre>
    )
  },
  table: (props) => (
    <div className="overflow-x-auto my-6 rounded-lg border border-border/60 bg-card">
      <table className="w-full border-collapse text-sm [&_th]:text-left" {...props} />
    </div>
  ),
  thead: (props) => <thead className="bg-muted/60 text-foreground" {...props} />,
  tbody: (props) => <tbody className="divide-y divide-border/60" {...props} />,
  tr: (props) => <tr className="odd:bg-transparent even:bg-muted/30" {...props} />,
  th: (props) => <th className="border border-border px-3 py-2 font-semibold" {...props} />,
  td: (props) => <td className="border border-border px-3 py-2 align-top" {...props} />,
}

export const htmlTablesToMarkdown = (html: string): string | null => {
  const parser: DOMParser | null =
    typeof window !== 'undefined' && typeof window.DOMParser !== 'undefined'
      ? new window.DOMParser()
      : typeof DOMParser !== 'undefined'
      ? new DOMParser()
      : null

  if (!parser) {
    return null
  }

  const doc = parser.parseFromString(html, 'text/html')
  const tables = Array.from(doc.querySelectorAll('table'))

  if (!tables.length) {
    return null
  }

  const markdownTables = tables
    .map((table) => {
      const rows = Array.from(table.querySelectorAll('tr')).map((row) =>
        Array.from(row.querySelectorAll('th,td')).map((cell) => cell.textContent ?? '')
      )

      if (!rows.length) {
        return null
      }

      const normalizedRows = rows.filter((row) => row.some((cell) => cell.trim().length > 0))

      return buildMarkdownTable(normalizedRows)
    })
    .filter((table): table is string => Boolean(table))

  if (!markdownTables.length) {
    return null
  }

  return markdownTables.join('\n\n')
}

export const tabularTextToMarkdown = (text: string): string | null => {
  if (!text.includes('\t')) {
    return null
  }

  const rows = text
    .split(/\r?\n/)
    .map((line) => line.split('\t'))
    .filter((cells) => cells.some((cell) => cell.trim().length > 0))

  if (!rows.length) {
    return null
  }

  return buildMarkdownTable(rows)
}

export interface MarkdownRendererProps {
  content: string
  className?: string
  components?: Components
  remarkPlugins?: PluggableList
}

export function MarkdownRenderer({
  content,
  className,
  components = defaultMarkdownComponents,
  remarkPlugins = [remarkGfm],
}: MarkdownRendererProps) {
  return (
    <div className={className}>
      <ReactMarkdown remarkPlugins={remarkPlugins} components={components}>
        {content}
      </ReactMarkdown>
    </div>
  )
}
