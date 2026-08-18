/* Structure — refinement.
 * structure-definitions — defines the vocabulary; view budgets do not apply.
 *
 * Deference, clarity, depth. See the header of css/refined.css for the why.
 */
import * as React from "react"
import { cx } from "./layout"
import { useReducedMotion } from "./motion"

/* ======================================================================
 * INSET GROUPED LIST
 *
 * The highest-value pattern here. Fifteen equal rows is fifteen decisions;
 * the same fifteen in four labelled groups is four decisions and a scan.
 * ==================================================================== */

export function InsetGroup({ title, note, iconic, children, className }: {
  title?: string
  /** The explanation. Putting it here is what lets each row stay one line. */
  note?: React.ReactNode
  iconic?: boolean
  children: React.ReactNode
  className?: string
}) {
  return (
    <section className={cx("st-inset-group", className)}>
      {title && <h3 className="st-inset-group__title">{title}</h3>}
      <div className={cx("st-inset", iconic && "st-inset--iconic")}>{children}</div>
      {note && <p className="st-inset-group__note">{note}</p>}
    </section>
  )
}

export interface InsetRowProps {
  label: React.ReactNode
  /** The current setting, shown on the right. Keep it to a couple of words. */
  value?: React.ReactNode
  icon?: React.ReactNode
  /** A control replaces the value — a switch, a segmented control. */
  control?: React.ReactNode
  href?: string
  onSelect?: () => void
  danger?: boolean
}

export function InsetRow({ label, value, icon, control, href, onSelect, danger }: InsetRowProps) {
  const inner = (
    <>
      {icon}
      <span className="st-inset__label" style={danger ? { color: "var(--st-danger)" } : undefined}>{label}</span>
      {value != null && <span className="st-inset__value">{value}</span>}
      {control}
      {/* The chevron appears only when the row actually navigates. An arrow on
          a row that does nothing is a promise the interface does not keep. */}
      {(href || onSelect) && !control && (
        <svg className="st-inset__chevron" width="14" height="14" viewBox="0 0 14 14" aria-hidden="true">
          <path d="M5 3l4 4-4 4" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      )}
    </>
  )

  if (href) return <a className="st-inset__row" href={href}>{inner}</a>
  if (onSelect) return <button type="button" className="st-inset__row" onClick={onSelect}>{inner}</button>
  return <div className="st-inset__row">{inner}</div>
}

/* ======================================================================
 * LARGE TITLE
 *
 * Large on arrival, small once you are reading. Uses a scroll timeline where
 * the browser supports it — that runs on the compositor and costs nothing —
 * and falls back to a scroll listener elsewhere.
 * ==================================================================== */

export function LargeTitle({ children, scroller, className }: {
  children: React.ReactNode
  /** The element that scrolls. Defaults to the window. */
  scroller?: React.RefObject<HTMLElement | null>
  className?: string
}) {
  const reduced = useReducedMotion()
  const [collapsed, setCollapsed] = React.useState(false)
  // Feature-detected once: when the browser can do this in CSS, the JS
  // listener is redundant and we skip attaching it at all.
  const native = React.useMemo(
    () => typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: scroll()"),
    []
  )

  React.useEffect(() => {
    if (native || reduced) return
    const host: HTMLElement | Window = scroller?.current ?? window
    const read = () =>
      setCollapsed((host === window ? window.scrollY : (host as HTMLElement).scrollTop) > 60)
    read()
    host.addEventListener("scroll", read, { passive: true })
    return () => host.removeEventListener("scroll", read)
  }, [native, reduced, scroller])

  return (
    <h1
      className={cx("st-large-title", className)}
      data-collapse={native && !reduced ? "" : undefined}
      data-collapsed={!native && collapsed ? "true" : undefined}
    >
      {children}
    </h1>
  )
}

/** A hairline that appears under a bar only once content has scrolled beneath it. */
export function useBarSettle<T extends HTMLElement = HTMLElement>() {
  const ref = React.useRef<T>(null)
  const [settled, setSettled] = React.useState(false)
  React.useEffect(() => {
    const read = () => setSettled(window.scrollY > 8)
    read()
    window.addEventListener("scroll", read, { passive: true })
    return () => window.removeEventListener("scroll", read)
  }, [])
  return [ref, settled] as const
}

/* ======================================================================
 * SCROLL PROGRESS
 * ==================================================================== */

export function ScrollProgress({ label = "Reading progress" }: { label?: string }) {
  const reduced = useReducedMotion()
  const [pct, setPct] = React.useState(0)
  const native = React.useMemo(
    () => typeof CSS !== "undefined" && CSS.supports?.("animation-timeline: scroll()"),
    []
  )

  React.useEffect(() => {
    if (native || reduced) return
    const read = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight
      setPct(max > 0 ? window.scrollY / max : 0)
    }
    read()
    window.addEventListener("scroll", read, { passive: true })
    return () => window.removeEventListener("scroll", read)
  }, [native, reduced])

  return (
    <div
      className="st-scroll-progress"
      role="progressbar"
      aria-label={label}
      aria-valuenow={Math.round(pct * 100)}
      aria-valuemin={0}
      aria-valuemax={100}
      style={native ? undefined : { transform: `scaleX(${reduced ? 1 : pct})` }}
    />
  )
}

/* ======================================================================
 * SHEET WITH DETENTS
 *
 * Half height by default, so the screen behind stays visible and the user
 * never loses their place. Dragging the grabber moves between detents.
 * ==================================================================== */

export type Detent = "auto" | "half" | "large"

export function Sheet({ open, onClose, title, detent = "half", detents = ["half", "large"], children }: {
  open: boolean
  onClose: () => void
  title: string
  detent?: Detent
  detents?: Detent[]
  children: React.ReactNode
}) {
  const [at, setAt] = React.useState<Detent>(detent)
  const startY = React.useRef(0)

  React.useEffect(() => { if (open) setAt(detent) }, [open, detent])

  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    return () => { document.removeEventListener("keydown", onKey); document.body.style.overflow = prev }
  }, [open, onClose])

  if (!open) return null

  const move = (dir: 1 | -1) => {
    const i = detents.indexOf(at)
    const next = detents[Math.min(detents.length - 1, Math.max(0, i + dir))]
    // Dragging down from the smallest detent dismisses, which is the gesture
    // people already expect from every sheet they have ever used.
    if (dir === -1 && i === 0) onClose()
    else setAt(next)
  }

  return (
    <>
      <div className="st-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="st-sheet" data-detent={at} role="dialog" aria-modal="true" aria-label={title}>
        <button
          className="st-sheet__grabber"
          aria-label={`Resize ${title}`}
          style={{ border: 0, padding: 0, cursor: "grab" }}
          onPointerDown={(e) => { startY.current = e.clientY; e.currentTarget.setPointerCapture(e.pointerId) }}
          onPointerUp={(e) => {
            const dy = e.clientY - startY.current
            if (Math.abs(dy) > 40) move(dy < 0 ? 1 : -1)
          }}
          // The gesture must have a keyboard equivalent, or the sheet is only
          // resizable by people who can drag.
          onKeyDown={(e) => {
            if (e.key === "ArrowUp") { e.preventDefault(); move(1) }
            if (e.key === "ArrowDown") { e.preventDefault(); move(-1) }
          }}
        />
        <div className="st-sheet__body">{children}</div>
      </aside>
    </>
  )
}

/* ======================================================================
 * RECESSED — a surface that sits below the page, not above it
 * ==================================================================== */

export const Recessed = ({ className, ...rest }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cx("st-recessed", className)} {...rest} />
)
