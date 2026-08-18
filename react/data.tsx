/* Structure — data collections.
 *
 * The layer with the leverage. A product is mostly the same six views of
 * different records: a table, a list, a board, a calendar, a detail page and
 * a chart. Shipping those properly is worth more than another button variant.
 * structure-definitions — defines the vocabulary; view budgets do not apply.
 */
import * as React from "react"
import { cx } from "./layout"
import { EmptyState } from "./states"
import { SkeletonTable } from "./loaders"

/* ------------------------------------------------------------ data table */

export interface DataColumn<T> {
  key: string
  header: string
  numeric?: boolean
  sortable?: boolean
  width?: string
  render?: (row: T) => React.ReactNode
  /** Value used for sorting when the cell renders something non-primitive. */
  sortValue?: (row: T) => string | number
}

export function DataTable<T extends Record<string, any>>({
  columns, rows, caption, loading, emptyTitle = "Nothing here yet", onRowClick, getRowId,
}: {
  columns: DataColumn<T>[]
  rows: T[]
  caption?: string
  loading?: boolean
  emptyTitle?: string
  onRowClick?: (row: T) => void
  getRowId?: (row: T, i: number) => string
}) {
  const [sort, setSort] = React.useState<{ key: string; dir: "asc" | "desc" } | null>(null)

  const sorted = React.useMemo(() => {
    if (!sort) return rows
    const col = columns.find((c) => c.key === sort.key)
    if (!col) return rows
    const val = (r: T) => col.sortValue?.(r) ?? r[col.key]
    // Copy before sorting: mutating the caller's array is a real bug when the
    // same array is held in state upstream.
    return [...rows].sort((a, b) => {
      const [x, y] = [val(a), val(b)]
      const c = x == null ? -1 : y == null ? 1 : x < y ? -1 : x > y ? 1 : 0
      return sort.dir === "asc" ? c : -c
    })
  }, [rows, sort, columns])

  if (loading) return <SkeletonTable cols={columns.length} />
  if (!rows.length) return <EmptyState title={emptyTitle} />

  const toggle = (key: string) =>
    setSort((s) => (s?.key === key ? { key, dir: s.dir === "asc" ? "desc" : "asc" } : { key, dir: "asc" }))

  return (
    <div className="st-table-wrap st-scroll-x">
      <table className="st-table">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th
                key={c.key} scope="col" style={{ width: c.width }}
                data-numeric={c.numeric ? "" : undefined}
                // aria-sort belongs on the header cell, not the button, or a
                // screen reader announces the column as unsorted.
                aria-sort={sort?.key === c.key ? (sort.dir === "asc" ? "ascending" : "descending") : undefined}
              >
                {c.sortable ? (
                  <button type="button" className="st-toggle" onClick={() => toggle(c.key)}
                          style={{ font: "inherit", letterSpacing: "inherit" }}>
                    {c.header}
                    <span aria-hidden="true">{sort?.key === c.key ? (sort.dir === "asc" ? "↑" : "↓") : "↕"}</span>
                  </button>
                ) : c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {sorted.map((row, i) => (
            <tr
              key={getRowId?.(row, i) ?? i}
              onClick={onRowClick ? () => onRowClick(row) : undefined}
              style={onRowClick ? { cursor: "pointer" } : undefined}
            >
              {columns.map((c) => (
                <td key={c.key} data-numeric={c.numeric ? "" : undefined}>
                  {c.render ? c.render(row) : String(row[c.key] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

/* ------------------------------------------------------------------ list */

export function List<T>({ items, renderItem, empty = "Nothing here yet", className }: {
  items: T[]
  renderItem: (item: T, i: number) => React.ReactNode
  empty?: string
  className?: string
}) {
  if (!items.length) return <EmptyState title={empty} />
  return <div className={cx("st-list", className)}>{items.map((it, i) => <div key={i}>{renderItem(it, i)}</div>)}</div>
}

export function CardGrid<T>({ items, renderItem, empty = "Nothing here yet" }: {
  items: T[]; renderItem: (item: T, i: number) => React.ReactNode; empty?: string
}) {
  if (!items.length) return <EmptyState title={empty} />
  return <div className="st-grid">{items.map((it, i) => <div key={i}>{renderItem(it, i)}</div>)}</div>
}

/* ---------------------------------------------------------------- kanban */

export function Kanban<T>({ columns, renderCard, onMove }: {
  columns: Array<{ id: string; title: string; items: T[] }>
  renderCard: (item: T) => React.ReactNode
  onMove?: (itemIndex: number, from: string, to: string) => void
}) {
  const [drag, setDrag] = React.useState<{ col: string; i: number } | null>(null)
  return (
    <div className="st-kanban">
      {columns.map((col) => (
        <section
          className="st-kanban__col" key={col.id}
          aria-label={col.title}
          onDragOver={(e) => { if (drag) e.preventDefault() }}
          onDrop={() => { if (drag && drag.col !== col.id) onMove?.(drag.i, drag.col, col.id); setDrag(null) }}
        >
          <header className="st-kanban__head">
            <span>{col.title}</span>
            <span className="st-badge">{col.items.length}</span>
          </header>
          {col.items.map((it, i) => (
            <article
              className="st-kanban__card" key={i}
              draggable={!!onMove}
              onDragStart={() => setDrag({ col: col.id, i })}
              onDragEnd={() => setDrag(null)}
            >{renderCard(it)}</article>
          ))}
        </section>
      ))}
    </div>
  )
}

/* -------------------------------------------------------- calendar view */

export function CalendarView({ month, events, onSelect }: {
  month: Date
  events: Array<{ date: Date; label: string; tone?: "info" | "success" | "danger" | "warning" }>
  onSelect?: (d: Date) => void
}) {
  const y = month.getFullYear(), m = month.getMonth()
  const lead = (new Date(y, m, 1).getDay() + 6) % 7
  const days = new Date(y, m + 1, 0).getDate()
  const on = (d: number) => events.filter((e) => e.date.getFullYear() === y && e.date.getMonth() === m && e.date.getDate() === d)

  return (
    <div className="st-calendar" style={{ width: "100%" }}>
      <div className="st-calendar__grid">
        {["Mo","Tu","We","Th","Fr","Sa","Su"].map((d) => <div className="st-calendar__dow" key={d}>{d}</div>)}
        {Array.from({ length: lead }, (_, i) => <div key={`l${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = i + 1
          const evs = on(d)
          return (
            <button key={d} type="button" className="st-calendar__day"
                    style={{ minHeight: 72, alignContent: "start", padding: 4 }}
                    onClick={() => onSelect?.(new Date(y, m, d))}
                    aria-label={`${d} ${month.toLocaleString(undefined, { month: "long" })}, ${evs.length} events`}>
              <span>{d}</span>
              <span className="st-cluster" style={{ gap: 2 }}>
                {evs.slice(0, 3).map((e, j) => <span key={j} className={`st-dot st-dot--${e.tone ?? "info"}`} />)}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}

/* ------------------------------------------------------------ detail view */

export const DetailView = ({ main, aside }: { main: React.ReactNode; aside?: React.ReactNode }) => (
  <div className="st-detail">
    <div>{main}</div>
    {aside && <aside>{aside}</aside>}
  </div>
)

export const StatGrid = ({ children }: { children: React.ReactNode }) => (
  <div className="st-grid">{children}</div>
)

/* -------------------------------------------------------------- checklist */

export function Checklist({ items, onToggle }: {
  items: Array<{ id: string; label: React.ReactNode; done: boolean }>
  onToggle?: (id: string) => void
}) {
  return (
    <div className="st-checklist">
      {items.map((it) => (
        <label className="st-checklist__item" data-done={it.done ? "true" : undefined} key={it.id}>
          <span className="st-checkbox">
            <input type="checkbox" checked={it.done} onChange={() => onToggle?.(it.id)} />
            <span className="st-checkbox__box" aria-hidden="true" />
          </span>
          <span>{it.label}</span>
        </label>
      ))}
    </div>
  )
}

/* --------------------------------------------------------------- comments */

export function Comments({ items }: {
  items: Array<{ author: string; when: string; body: React.ReactNode; avatar?: string }>
}) {
  return (
    <div className="st-comments">
      {items.map((c, i) => (
        <article className="st-comment" key={i}>
          <span className="st-avatar">{c.avatar ? <img src={c.avatar} alt="" /> : c.author.slice(0, 2).toUpperCase()}</span>
          <div>
            <div className="st-comment__meta">{c.author} · {c.when}</div>
            <div className="st-comment__body">{c.body}</div>
          </div>
        </article>
      ))}
    </div>
  )
}

export const TicketThread = Comments
export const ActivityFeed = ({ items }: { items: Array<{ title: React.ReactNode; meta?: string; body?: React.ReactNode }> }) => (
  <ol className="st-timeline" style={{ listStyle: "none", padding: 0, margin: 0 }}>
    {items.map((it, i) => (
      <li className="st-timeline__item" key={i}>
        <span className="st-timeline__marker" aria-hidden="true" />
        <div>
          <div>{it.title}</div>
          {it.meta && <div className="st-caption">{it.meta}</div>}
          {it.body}
        </div>
      </li>
    ))}
  </ol>
)

/* -------------------------------------------------------------------- tree */

export type TreeNode = { id: string; label: string; children?: TreeNode[] }

export function Tree({ nodes, selected, onSelect }: {
  nodes: TreeNode[]; selected?: string; onSelect?: (id: string) => void
}) {
  const Branch = ({ items }: { items: TreeNode[] }) => (
    <ul role="group">
      {items.map((n) => (
        <li key={n.id} role="treeitem" aria-selected={selected === n.id} aria-expanded={n.children ? true : undefined}>
          <div className="st-tree__item" aria-selected={selected === n.id} onClick={() => onSelect?.(n.id)}>
            {n.children ? <span aria-hidden="true">▾</span> : <span style={{ width: "1em" }} />}
            {n.label}
          </div>
          {n.children && <Branch items={n.children} />}
        </li>
      ))}
    </ul>
  )
  return <div className="st-tree" role="tree">{<Branch items={nodes} />}</div>
}

/* --------------------------------------------------------------- filters */

export function FilterBar({ children, onClear, count }: {
  children: React.ReactNode; onClear?: () => void; count?: number
}) {
  return (
    <div className="st-filter-bar">
      {children}
      {!!count && (
        <>
          <span className="st-badge">{count} active</span>
          {onClear && <button type="button" className="st-btn st-btn--ghost st-btn--sm" onClick={onClear}>Clear</button>}
        </>
      )}
    </div>
  )
}

/* ---------------------------------------------------------------- charts */

/**
 * Charts are inline SVG with no dependency. THE STROKE RULE applies: every
 * fill carries a 1px outline, because mango at 1.43:1 and sky at 1.99:1 on
 * paper are not identifiable as bare fills.
 */
export function Chart({ data, type = "bar", height = 200, label }: {
  data: Array<{ label: string; value: number }>
  type?: "bar" | "line" | "area"
  height?: number
  label: string
}) {
  const max = Math.max(...data.map((d) => d.value), 1)
  const w = 100, pad = 4
  const x = (i: number) => pad + (i / Math.max(data.length - 1, 1)) * (w - pad * 2)
  const y = (v: number) => height - pad - (v / max) * (height - pad * 2)

  return (
    <figure className="st-chart" style={{ margin: 0 }}>
      <svg viewBox={`0 0 ${w} ${height}`} preserveAspectRatio="none" role="img" aria-label={label}>
        {[0, 0.5, 1].map((t) => (
          <line key={t} className="st-chart__grid" x1={0} x2={w} y1={pad + t * (height - pad * 2)} y2={pad + t * (height - pad * 2)} />
        ))}
        {type === "bar" && data.map((d, i) => {
          const bw = (w - pad * 2) / data.length * 0.62
          return (
            <rect
              key={i} className="st-chart-mark st-chart-1" vectorEffect="non-scaling-stroke"
              x={x(i) - bw / 2} y={y(d.value)} width={bw} height={height - pad - y(d.value)} rx="1"
            />
          )
        })}
        {type !== "bar" && (
          <>
            {type === "area" && (
              <polygon className="st-chart-mark st-chart-1" vectorEffect="non-scaling-stroke"
                       points={`${pad},${height - pad} ${data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ")} ${w - pad},${height - pad}`} />
            )}
            <polyline
              fill="none" stroke="var(--st-chart-1)" strokeWidth="2" vectorEffect="non-scaling-stroke"
              points={data.map((d, i) => `${x(i)},${y(d.value)}`).join(" ")}
            />
          </>
        )}
      </svg>
      {/* The table is the accessible version of the chart, not an extra. */}
      <figcaption className="st-sr-only">
        {label}. {data.map((d) => `${d.label}: ${d.value}`).join(", ")}
      </figcaption>
    </figure>
  )
}

export function Sparkline({ data, width = 120, height = 28, label }: {
  data: number[]; width?: number; height?: number; label: string
}) {
  const max = Math.max(...data, 1), min = Math.min(...data, 0)
  const pts = data.map((v, i) => {
    const x = (i / Math.max(data.length - 1, 1)) * width
    const y = height - ((v - min) / Math.max(max - min, 1)) * height
    return `${x},${y}`
  }).join(" ")
  return (
    <svg className="st-chart" width={width} height={height} role="img" aria-label={label} style={{ display: "inline-block" }}>
      <polyline fill="none" stroke="var(--st-chart-1)" strokeWidth="1.5" points={pts} />
    </svg>
  )
}

export function Heatmap({ values, label, max }: { values: number[]; label: string; max?: number }) {
  const top = max ?? Math.max(...values, 1)
  return (
    <div className="st-heatmap" role="img" aria-label={label}>
      {values.map((v, i) => (
        // Opacity rather than a colour ramp: one hue, and it stays in palette.
        <span className="st-heatmap__cell" key={i}
              style={{ background: "var(--st-chart-1)", opacity: 0.15 + (v / top) * 0.85 }} />
      ))}
    </div>
  )
}

export function Gauge({ value, max = 100, label, size = 140 }: {
  value: number; max?: number; label: string; size?: number
}) {
  const pct = Math.max(0, Math.min(1, value / max))
  const r = (size - 12) / 2
  const circ = Math.PI * r  // half circle
  return (
    <span className="st-gauge" role="img" aria-label={`${label}: ${value} of ${max}`}>
      <svg width={size} height={size / 2 + 10} viewBox={`0 0 ${size} ${size / 2 + 10}`}>
        <path d={`M6 ${size / 2} A ${r} ${r} 0 0 1 ${size - 6} ${size / 2}`} fill="none" stroke="var(--st-border)" strokeWidth="8" />
        <path d={`M6 ${size / 2} A ${r} ${r} 0 0 1 ${size - 6} ${size / 2}`} fill="none" stroke="var(--st-accent)"
              strokeWidth="8" strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} />
      </svg>
      <span className="st-gauge__value">{value}</span>
    </span>
  )
}

/* ------------------------------------------------------ permission matrix */

export function PermissionMatrix({ roles, permissions, value, onChange }: {
  roles: string[]
  permissions: string[]
  value: Record<string, Record<string, boolean>>
  onChange?: (perm: string, role: string, on: boolean) => void
}) {
  return (
    <div className="st-table-wrap st-scroll-x">
      <table className="st-table">
        <thead>
          <tr>
            <th scope="col">Permission</th>
            {roles.map((r) => <th key={r} scope="col">{r}</th>)}
          </tr>
        </thead>
        <tbody>
          {permissions.map((p) => (
            <tr key={p}>
              <th scope="row" style={{ fontWeight: "var(--st-weight-light)" }}>{p}</th>
              {roles.map((r) => (
                <td key={r}>
                  <label className="st-checkbox">
                    <input type="checkbox" checked={!!value[p]?.[r]}
                           aria-label={`${p} for ${r}`}
                           onChange={(e) => onChange?.(p, r, e.target.checked)} />
                    <span className="st-checkbox__box" aria-hidden="true" />
                  </label>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export const ArticleBody = ({ className, ...rest }: React.ComponentPropsWithoutRef<"article">) => (
  <article className={cx("st-prose", className)} {...rest} />
)

/* ------------------------------------------------------------- run steps */

export const RunSteps = ({ steps }: { steps: Array<{ label: string; state: "todo" | "active" | "done" | "error" }> }) => (
  <ol className="st-run-steps" style={{ listStyle: "none", padding: 0, margin: 0 }}>
    {steps.map((s) => (
      <li className="st-run-steps__item" key={s.label}>
        <span className={`st-dot st-dot--${s.state === "done" ? "success" : s.state === "error" ? "danger" : s.state === "active" ? "warning" : "muted"}`} />
        <span>{s.label}</span>
      </li>
    ))}
  </ol>
)

