/* Structure — the waiting vocabulary.
 *
 * Picking the right one matters more than any of the implementations. See the
 * table at the top of css/loaders.css: under 300ms show nothing at all, and a
 * wait over five seconds needs a number and something to read.
 * structure-definitions — defines the vocabulary; view budgets do not apply.
 */
import * as React from "react"
import { cx } from "./layout"

/* ---------------------------------------------------------------- spinner */

export function Spinner({ size = "base", tone, label = "Loading" }: {
  size?: "sm" | "base" | "lg"
  /** No "invert": inside .st-invert the tokens are already re-scoped. */
  tone?: "accent"
  label?: string
}) {
  return (
    <span className="st-inline-loader">
      <span className={cx("st-spinner", size !== "base" && `st-spinner--${size}`, tone && `st-spinner--${tone}`)} aria-hidden="true" />
      <span className="st-sr-only">{label}</span>
    </span>
  )
}

/**
 * Suppresses any indicator for the first `after` ms.
 *
 * A spinner that flashes for 80ms is worse than no spinner: it reads as a
 * glitch, and it makes a fast app feel broken. Most requests resolve inside
 * the delay and the user simply sees the result appear.
 */
export function Delayed({ after = 300, children }: { after?: number; children: React.ReactNode }) {
  const [show, setShow] = React.useState(false)
  React.useEffect(() => {
    const t = setTimeout(() => setShow(true), after)
    return () => clearTimeout(t)
  }, [after])
  return show ? <>{children}</> : null
}

/* --------------------------------------------------------------- skeleton */

export function Skeleton({ variant, width, height, className, style, ...rest }: React.ComponentPropsWithoutRef<"div"> & {
  variant?: "text" | "title" | "circle" | "pill" | "block"
  width?: string | number
  height?: string | number
}) {
  return (
    <div
      className={cx("st-skeleton", variant && `st-skeleton--${variant}`, className)}
      style={{ width, height, ...style }}
      aria-hidden="true"
      {...rest}
    />
  )
}

/** A paragraph silhouette. The last line is short, like real prose. */
export const SkeletonText = ({ lines = 3, className }: { lines?: number; className?: string }) => (
  <div className={cx("st-skeleton-text", className)} aria-hidden="true">
    {Array.from({ length: lines }, (_, i) => <span key={i} />)}
  </div>
)

export const SkeletonCard = ({ className }: { className?: string }) => (
  <div className={cx("st-card", className)} aria-hidden="true">
    <Skeleton variant="title" />
    <div style={{ marginTop: "var(--st-space-s)" }}><SkeletonText lines={2} /></div>
  </div>
)

/**
 * A table silhouette that matches the real table's column count, so the
 * layout does not jump when data lands. That jump is the main thing skeletons
 * exist to prevent, and a generic grey block does not prevent it.
 */
export const SkeletonTable = ({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) => (
  <div className="st-table-wrap" aria-hidden="true">
    <table className="st-table">
      <thead>
        <tr>{Array.from({ length: cols }, (_, i) => <th key={i}><Skeleton variant="text" width="60%" /></th>)}</tr>
      </thead>
      <tbody>
        {Array.from({ length: rows }, (_, r) => (
          <tr key={r}>
            {Array.from({ length: cols }, (_, c) => (
              <td key={c}><Skeleton variant="text" width={c === 0 ? "80%" : "50%"} /></td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)

/* ------------------------------------------------------------ loading bar */

/** Indeterminate, page-top, never blocking. For route changes and refetches. */
export const LoadingBar = ({ inline, label = "Loading" }: { inline?: boolean; label?: string }) => (
  <div className={cx("st-loading-bar", inline && "st-loading-bar--inline")} role="progressbar" aria-label={label} aria-busy="true" />
)

/* ------------------------------------------------------------ page loader */

/** First paint only. After the shell exists, use skeletons instead. */
export const PageLoader = ({ mark = "kwapso", label = "Loading" }: { mark?: string; label?: string }) => (
  <div className="st-page-loader" role="status" aria-live="polite">
    <span className="st-page-loader__mark" aria-hidden="true">{mark}</span>
    <span className="st-sr-only">{label}</span>
  </div>
)

export const InlineLoader = ({ children = "Loading…" }: { children?: React.ReactNode }) => (
  <span className="st-inline-loader" role="status">
    <span className="st-spinner st-spinner--sm" aria-hidden="true" />
    {children}
  </span>
)

/**
 * Wraps a region that is refreshing. Content stays readable and dims, rather
 * than being replaced by a spinner — throwing away data the user is already
 * reading is a downgrade, not a loading state.
 */
export function Busy({ busy, children, className }: { busy: boolean; children: React.ReactNode; className?: string }) {
  return (
    <div className={cx(busy && "st-busy", className)} aria-busy={busy}>
      {children}
    </div>
  )
}

/* ----------------------------------------------------------- progress ring */

export function ProgressRing({ value, max = 100, size = 48, label, showValue = true }: {
  value: number; max?: number; size?: number; label: string; showValue?: boolean
}) {
  const pct = Math.max(0, Math.min(1, value / max))
  const stroke = 4
  const r = (size - stroke) / 2
  const circ = 2 * Math.PI * r
  return (
    <span className="st-ring" role="progressbar" aria-valuenow={value} aria-valuemin={0} aria-valuemax={max} aria-label={label}>
      <svg width={size} height={size}>
        <circle className="st-ring__track" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke} />
        <circle
          className="st-ring__bar" cx={size / 2} cy={size / 2} r={r} fill="none" strokeWidth={stroke}
          strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)}
        />
      </svg>
      {showValue && <span className="st-ring__label">{Math.round(pct * 100)}%</span>}
    </span>
  )
}

/* ------------------------------------------------------------ step loader */

export type LoadStep = { label: string; state: "todo" | "active" | "done" | "error" }

/**
 * For long jobs — imports, migrations, deploys. Naming the stage is the point:
 * "Validating 1,204 rows" is information, an indeterminate bar is not.
 */
export function StepLoader({ steps }: { steps: LoadStep[] }) {
  const mark = { todo: "", active: "", done: "✓", error: "!" }
  return (
    <ol className="st-step-loader" role="status" aria-live="polite" style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {steps.map((s) => (
        <li className="st-step-loader__item" data-state={s.state} key={s.label}>
          <span className="st-step-loader__mark" aria-hidden="true">
            {s.state === "active" ? <span className="st-spinner st-spinner--sm" /> : mark[s.state]}
          </span>
          <span>{s.label}</span>
          <span className="st-sr-only">
            {s.state === "done" ? " completed" : s.state === "active" ? " in progress" : s.state === "error" ? " failed" : " pending"}
          </span>
        </li>
      ))}
    </ol>
  )
}

/* ------------------------------------------------------------- optimistic */

/**
 * A row that exists locally but is not confirmed by the server. On failure it
 * returns to full opacity with a danger rule — a failed write must never be
 * quieter than a pending one.
 */
export function OptimisticRow({ pending, failed, onRetry, children, className }: {
  pending?: boolean; failed?: boolean; onRetry?: () => void
  children: React.ReactNode; className?: string
}) {
  return (
    <div className={cx(pending && !failed && "st-optimistic", className)} data-failed={failed ? "true" : undefined}>
      {children}
      {failed && (
        <span className="st-cluster" style={{ gap: "var(--st-space-s)", marginTop: "var(--st-space-xs)" }}>
          <span className="st-caption" style={{ color: "var(--st-danger)" }}>Not saved.</span>
          {onRetry && <button type="button" className="st-btn st-btn--ghost st-btn--sm" onClick={onRetry}>Retry</button>}
        </span>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ lazy image */

/** Reserves its box before the image arrives, so nothing below it jumps. */
export function LazyImage({ src, alt, ratio = "16 / 9", className }: {
  src: string; alt: string; ratio?: string; className?: string
}) {
  const [loaded, setLoaded] = React.useState(false)
  return (
    <div className={cx("st-lazy-img", className)} style={{ aspectRatio: ratio }} data-loaded={loaded ? "true" : undefined}>
      <img src={src} alt={alt} loading="lazy" decoding="async" data-loaded={loaded ? "true" : undefined} onLoad={() => setLoaded(true)} />
    </div>
  )
}

export const RefreshControl = ({ label = "Pull to refresh" }: { label?: string }) => (
  <div className="st-refresh" role="status">{label}</div>
)
