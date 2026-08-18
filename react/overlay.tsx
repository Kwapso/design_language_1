/* Structure — overlays. The only surfaces permitted a shadow. * structure-definitions — defines the vocabulary; view budgets do not apply.
 */
import * as React from "react"
import { cx } from "./layout"
import { Button } from "./controls"

/** Trap Tab inside a container and restore focus to the opener on close. */
function useFocusTrap(active: boolean) {
  const ref = React.useRef<HTMLDivElement>(null)

  React.useEffect(() => {
    if (!active) return
    const node = ref.current
    if (!node) return
    const opener = document.activeElement as HTMLElement | null

    const focusable = () =>
      Array.from(
        node.querySelectorAll<HTMLElement>(
          'a[href],button:not([disabled]),textarea,input,select,[tabindex]:not([tabindex="-1"])'
        )
      ).filter((el) => el.offsetParent !== null)

    focusable()[0]?.focus() ?? node.focus()

    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Tab") return
      const items = focusable()
      if (!items.length) return
      const first = items[0]
      const last = items[items.length - 1]
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
    }

    document.addEventListener("keydown", onKey)
    // The page behind a modal must not scroll — otherwise dismissing feels
    // like the content moved rather than the overlay closed.
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"

    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = prev
      opener?.focus()
    }
  }, [active])

  return ref
}

function useEscape(active: boolean, onClose: () => void) {
  React.useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [active, onClose])
}

/* ----------------------------------------------------------------- modal */

export function Modal({ open, onClose, title, children, actions }: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
  actions?: React.ReactNode
}) {
  const ref = useFocusTrap(open)
  useEscape(open, onClose)
  const titleId = React.useId()

  if (!open) return null
  return (
    <>
      <div className="st-overlay" onClick={onClose} aria-hidden="true" />
      <div className="st-modal" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref} tabIndex={-1}>
        <h2 className="st-modal__title" id={titleId}>{title}</h2>
        {children}
        <div className="st-modal__actions">
          {actions ?? <Button variant="ghost" onClick={onClose}>Close</Button>}
        </div>
      </div>
    </>
  )
}

export function Drawer({ open, onClose, title, children }: {
  open: boolean
  onClose: () => void
  title: string
  children: React.ReactNode
}) {
  const ref = useFocusTrap(open)
  useEscape(open, onClose)
  const titleId = React.useId()

  if (!open) return null
  return (
    <>
      <div className="st-overlay" onClick={onClose} aria-hidden="true" />
      <aside className="st-drawer" role="dialog" aria-modal="true" aria-labelledby={titleId} ref={ref} tabIndex={-1}>
        <div className="st-cluster st-cluster--between">
          <h2 className="st-card__title" id={titleId}>{title}</h2>
          <Button variant="ghost" size="sm" icon onClick={onClose} aria-label="Close">&times;</Button>
        </div>
        {children}
      </aside>
    </>
  )
}

/* --------------------------------------------------------------- popover */

export function Popover({ trigger, children, label }: {
  trigger: (props: { onClick: () => void; "aria-expanded": boolean; "aria-haspopup": "dialog" }) => React.ReactNode
  children: React.ReactNode
  label: string
}) {
  const [open, setOpen] = React.useState(false)
  const wrap = React.useRef<HTMLDivElement>(null)
  useEscape(open, () => setOpen(false))

  // Close on any click outside — a popover that only closes via its trigger
  // strands the user the moment they look elsewhere.
  React.useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => {
      if (!wrap.current?.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  return (
    <div ref={wrap} style={{ position: "relative", display: "inline-block" }}>
      {trigger({ onClick: () => setOpen((o) => !o), "aria-expanded": open, "aria-haspopup": "dialog" })}
      {open && (
        <div className="st-popover" role="dialog" aria-label={label} style={{ position: "absolute", top: "calc(100% + 8px)", left: 0 }}>
          {children}
        </div>
      )}
    </div>
  )
}

export function Menu({ items, className }: {
  items: Array<{ label: string; onSelect: () => void; danger?: boolean }>
  className?: string
}) {
  return (
    <div className={cx("st-menu", className)} role="menu">
      {items.map((i) => (
        <button
          key={i.label}
          type="button"
          role="menuitem"
          className="st-menu__item"
          data-danger={i.danger ? "" : undefined}
          onClick={i.onSelect}
        >
          {i.label}
        </button>
      ))}
    </div>
  )
}

/* ---------------------------------------------------------------- toasts */

type Toast = { id: number; message: string; tone?: "info" | "success" | "danger" }
const ToastCtx = React.createContext<((message: string, tone?: Toast["tone"]) => void) | null>(null)

export const useToast = () => {
  const ctx = React.useContext(ToastCtx)
  if (!ctx) throw new Error("useToast must be used inside <ToastProvider>")
  return ctx
}

export function ToastProvider({ children, duration = 5000 }: { children: React.ReactNode; duration?: number }) {
  const [toasts, setToasts] = React.useState<Toast[]>([])
  const seq = React.useRef(0)

  const push = React.useCallback((message: string, tone: Toast["tone"] = "info") => {
    const id = ++seq.current
    setToasts((t) => [...t, { id, message, tone }])
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), duration)
  }, [duration])

  return (
    <ToastCtx.Provider value={push}>
      {children}
      {/* aria-live on a permanently-mounted region: a region added at the same
          time as its content is frequently not announced at all. */}
      <div className="st-toast-region" role="status" aria-live="polite">
        {toasts.map((t) => (
          <div className="st-toast" key={t.id}>{t.message}</div>
        ))}
      </div>
    </ToastCtx.Provider>
  )
}
