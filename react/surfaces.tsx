/* Structure — surfaces, data display, and feedback. * structure-definitions — defines the vocabulary; view budgets do not apply.
 */
import * as React from "react"
import { cx } from "./layout"
import { EmptyState } from "./states"

/* ------------------------------------------------------------------ card */

export function Card({ variant, interactive, flush, className, ...rest }: React.ComponentPropsWithoutRef<"div"> & {
  variant?: "outline" | "accent"
  interactive?: boolean
  flush?: boolean
}) {
  return (
    <div
      className={cx(
        "st-card",
        variant && `st-card--${variant}`,
        interactive && "st-card--interactive",
        flush && "st-card--flush",
        className
      )}
      {...rest}
    />
  )
}

export const CardHeader = ({ className, ...rest }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cx("st-card__header", className)} {...rest} />
)
export const CardTitle = ({ className, ...rest }: React.ComponentPropsWithoutRef<"h3">) => (
  <h3 className={cx("st-card__title", className)} {...rest} />
)
export const CardFooter = ({ className, ...rest }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cx("st-card__footer", className)} {...rest} />
)

export const Row = ({ plain, className, ...rest }: React.ComponentPropsWithoutRef<"div"> & { plain?: boolean }) => (
  <div className={cx("st-row", plain && "st-row--plain", className)} {...rest} />
)

/* ------------------------------------------------------------------ stat */

export function Stat({ value, label, delta, direction }: {
  value: React.ReactNode
  label: string
  delta?: string
  direction?: "up" | "down"
}) {
  return (
    <div className="st-stat">
      <span className="st-stat__value">{value}</span>
      <span className="st-stat__label">{label}</span>
      {delta && (
        <span className="st-stat__delta" data-dir={direction}>
          {/* The arrow carries the direction for anyone who cannot see the
              colour; the colour is reinforcement, never the only signal. */}
          {direction === "up" ? "↑" : direction === "down" ? "↓" : ""} {delta}
        </span>
      )}
    </div>
  )
}

/* --------------------------------------------------------------- progress */

export function Progress({ value, max = 100, label }: { value: number; max?: number; label: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div
      className="st-progress"
      role="progressbar"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
    >
      <div className="st-progress__bar" style={{ width: `${pct}%` }} />
    </div>
  )
}

export function Meter({ label, value, max = 100, display }: {
  label: string; value: number; max?: number; display?: string
}) {
  return (
    <div className="st-meter">
      <div className="st-meter__head">
        <span>{label}</span>
        <span className="st-numeric">{display ?? `${value}/${max}`}</span>
      </div>
      <Progress value={value} max={max} label={label} />
    </div>
  )
}

/* Skeleton and Spinner live in ./loaders — the whole waiting vocabulary is
 * one file, so choosing between its members is a single decision. */

/* ----------------------------------------------------------------- alert */

export function Alert({ tone = "info", title, children, className, ...rest }: React.ComponentPropsWithoutRef<"div"> & {
  tone?: "info" | "success" | "warning" | "danger"
  title?: string
}) {
  return (
    <div
      className={cx("st-alert", `st-alert--${tone}`, className)}
      // Errors interrupt; everything else waits for a natural pause.
      role={tone === "danger" ? "alert" : "status"}
      {...rest}
    >
      <div>
        {title && <strong style={{ display: "block" }}>{title}</strong>}
        {children}
      </div>
    </div>
  )
}

/* ----------------------------------------------------------------- table */

export interface Column<T> {
  key: string
  header: string
  numeric?: boolean
  render?: (row: T) => React.ReactNode
}

export function Table<T extends Record<string, unknown>>({ columns, rows, caption, empty = "Nothing here yet." }: {
  columns: Column<T>[]
  rows: T[]
  caption?: string
  empty?: React.ReactNode
}) {
  if (!rows.length) return <EmptyState title={typeof empty === "string" ? empty : "Nothing here yet."} />
  return (
    <div className="st-table-wrap st-scroll-x">
      <table className="st-table">
        {caption && <caption>{caption}</caption>}
        <thead>
          <tr>
            {columns.map((c) => (
              <th key={c.key} scope="col" data-numeric={c.numeric ? "" : undefined}>{c.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <tr key={i}>
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

/* EmptyState and the rest of the empty/error family live in ./states. */

export function KeyValue({ items }: { items: Array<{ key: string; value: React.ReactNode }> }) {
  return (
    <dl className="st-kv">
      {items.map((i) => (
        <React.Fragment key={i.key}>
          <dt>{i.key}</dt>
          <dd>{i.value}</dd>
        </React.Fragment>
      ))}
    </dl>
  )
}

export function Timeline({ items }: { items: Array<{ title: React.ReactNode; meta?: string; body?: React.ReactNode }> }) {
  return (
    <ol className="st-timeline" style={{ listStyle: "none", padding: 0 }}>
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
}
