/* Structure — page patterns, overlays and the remaining primitives.
 *
 * Compositions rather than atoms: the marketing sections, page furniture and
 * interaction pieces a product needs but which are too opinionated to be
 * called primitives.
 * structure-definitions — defines the vocabulary; view budgets do not apply.
 */
import * as React from "react"
import { createPortal } from "react-dom"
import { cx } from "./layout"

/* ======================================================================
 * PRIMITIVE ODDS AND ENDS
 * ==================================================================== */

export const Box = ({ className, ...rest }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cx("st-box", className)} {...rest} />
)
export const Center = ({ className, ...rest }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cx("st-center", className)} {...rest} />
)
export const Split = ({ className, ...rest }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cx("st-split", className)} {...rest} />
)
export const Separator = ({ className, ...rest }: React.ComponentPropsWithoutRef<"hr">) => (
  <hr className={cx("st-divider", className)} {...rest} />
)
export const AspectRatio = ({ ratio = "16 / 9", className, style, ...rest }: React.ComponentPropsWithoutRef<"div"> & { ratio?: string }) => (
  <div className={cx("st-aspect", className)} style={{ aspectRatio: ratio, ...style }} {...rest} />
)
export const Panel = ({ className, ...rest }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cx("st-panel", className)} {...rest} />
)
export const Well = ({ className, ...rest }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cx("st-well", className)} {...rest} />
)
export const Invert = ({ className, ...rest }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cx("st-invert", className)} {...rest} />
)
export const Heading = ({ level = 2, className, ...rest }: React.ComponentPropsWithoutRef<"h2"> & { level?: 1 | 2 | 3 | 4 | 5 | 6 }) => {
  const Tag = `h${level}` as const
  return <Tag className={cx("st-heading", className)} {...rest} />
}
export const Text = ({ className, ...rest }: React.ComponentPropsWithoutRef<"p">) => (
  <p className={cx("st-text", className)} {...rest} />
)
export const Prose = ({ className, ...rest }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cx("st-prose", className)} {...rest} />
)
export const Quote = ({ className, ...rest }: React.ComponentPropsWithoutRef<"blockquote">) => (
  <blockquote className={cx("st-quote", className)} {...rest} />
)
export const Code = ({ className, ...rest }: React.ComponentPropsWithoutRef<"code">) => (
  <code className={cx("st-code", className)} {...rest} />
)
export const Kbd = ({ className, ...rest }: React.ComponentPropsWithoutRef<"kbd">) => (
  <kbd className={cx("st-kbd", className)} {...rest} />
)
export const Link = ({ className, ...rest }: React.ComponentPropsWithoutRef<"a">) => (
  <a className={cx("st-link", className)} {...rest} />
)
export const Clamp = ({ lines = 2, className, ...rest }: React.ComponentPropsWithoutRef<"div"> & { lines?: 2 | 3 }) => (
  <div className={cx(`st-clamp-${lines}`, className)} {...rest} />
)
export const Tag = ({ className, ...rest }: React.ComponentPropsWithoutRef<"span">) => (
  <span className={cx("st-badge", className)} {...rest} />
)
export const Icon = ({ className, ...rest }: React.ComponentPropsWithoutRef<"svg">) => (
  <svg className={cx("st-icon", className)} aria-hidden="true" {...rest} />
)
export const Frame = ({ url, className, children }: { url?: string; className?: string; children: React.ReactNode }) => (
  <div className={cx("st-frame", className)}>
    <div className="st-frame__bar">
      <span className="st-frame__dot" /><span className="st-frame__dot" /><span className="st-frame__dot" />
      {url && <span className="st-caption" style={{ marginLeft: "var(--st-space-s)" }}>{url}</span>}
    </div>
    <div className="st-frame__body">{children}</div>
  </div>
)

/** Show or hide by breakpoint without a media query in the app. */
export const Visibility = ({ on, children }: { on: "mobile" | "desktop"; children: React.ReactNode }) => (
  <div className={on === "mobile" ? "st-hide-desktop" : "st-hide-mobile"}>{children}</div>
)

/** Renders into document.body, after mount so SSR stays clean. */
export function Portal({ children }: { children: React.ReactNode }) {
  const [host, setHost] = React.useState<HTMLElement | null>(null)
  React.useEffect(() => { setHost(document.body) }, [])
  // Rendered only after mount, so the server never sees a portal and
  // hydration stays clean.
  if (!host) return null
  return createPortal(children, host)
}

export function Resizable({ start, end, initial = 50 }: { start: React.ReactNode; end: React.ReactNode; initial?: number }) {
  const [pct, setPct] = React.useState(initial)
  const ref = React.useRef<HTMLDivElement>(null)
  const onDown = () => {
    const move = (e: MouseEvent) => {
      const r = ref.current!.getBoundingClientRect()
      setPct(Math.max(15, Math.min(85, ((e.clientX - r.left) / r.width) * 100)))
    }
    const up = () => { document.removeEventListener("mousemove", move); document.removeEventListener("mouseup", up) }
    document.addEventListener("mousemove", move); document.addEventListener("mouseup", up)
  }
  return (
    <div className="st-resizable" ref={ref} style={{ gridTemplateColumns: `${pct}% auto ${100 - pct}%` }}>
      <div style={{ minWidth: 0 }}>{start}</div>
      <div className="st-resizable__handle" role="separator" aria-orientation="vertical" onMouseDown={onDown} />
      <div style={{ minWidth: 0 }}>{end}</div>
    </div>
  )
}

/* ======================================================================
 * ACTIONS
 * ==================================================================== */

export function SplitButton({ label, onClick, menu }: {
  label: string; onClick: () => void; menu: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  return (
    <span className="st-split-btn" style={{ position: "relative" }}>
      <button type="button" className="st-btn st-btn--accent" onClick={onClick}>{label}</button>
      <button type="button" className="st-btn st-btn--accent" aria-label="More actions" aria-expanded={open}
              onClick={() => setOpen((o) => !o)}>▾</button>
      {open && <div className="st-popover" style={{ position: "absolute", top: "calc(100% + 6px)", right: 0 }}>{menu}</div>}
    </span>
  )
}

/** Confirms in place. A toast for "Copied" is more chrome than the act needs. */
export function CopyButton({ value, label = "Copy" }: { value: string; label?: string }) {
  const [done, setDone] = React.useState(false)
  return (
    <button
      type="button" className="st-btn st-btn--ghost st-btn--sm"
      onClick={async () => {
        try { await navigator.clipboard.writeText(value); setDone(true); setTimeout(() => setDone(false), 1600) }
        catch { /* Denied clipboard permission — leave the label unchanged. */ }
      }}
    >
      {done ? "Copied" : label}
    </button>
  )
}

export const Toggle = ({ pressed, className, ...rest }: React.ComponentPropsWithoutRef<"button"> & { pressed?: boolean }) => (
  <button type="button" className={cx("st-toggle", className)} aria-pressed={pressed} {...rest} />
)

export function ToggleGroup({ options, value, onChange, label }: {
  options: Array<{ value: string; label: React.ReactNode }>
  value: string; onChange: (v: string) => void; label: string
}) {
  return (
    <div className="st-toggle-group" role="group" aria-label={label}>
      {options.map((o) => (
        <Toggle key={o.value} pressed={value === o.value} onClick={() => onChange(o.value)}>{o.label}</Toggle>
      ))}
    </div>
  )
}

/* ======================================================================
 * OVERLAYS — the remainder
 * ==================================================================== */

export function ConfirmDialog({ open, onClose, onConfirm, title, children, confirmLabel = "Confirm", destructive }: {
  open: boolean; onClose: () => void; onConfirm: () => void
  title: string; children?: React.ReactNode; confirmLabel?: string; destructive?: boolean
}) {
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <>
      <div className="st-overlay" onClick={onClose} aria-hidden="true" />
      <div className="st-modal" role="alertdialog" aria-modal="true" aria-label={title}>
        <h2 className="st-modal__title">{title}</h2>
        {children}
        <div className="st-modal__actions">
          <button type="button" className="st-btn st-btn--ghost" onClick={onClose}>Cancel</button>
          <button type="button" className={cx("st-btn", destructive ? "st-btn--danger" : "st-btn--accent")} onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </>
  )
}

/* Sheet lives in ./refined — the detented version supersedes this one, since a
 * half-height sheet keeps the screen behind it visible and in place. */

export function ContextMenu({ items, children }: {
  items: Array<{ label: string; onSelect: () => void; danger?: boolean }>
  children: React.ReactNode
}) {
  const [at, setAt] = React.useState<{ x: number; y: number } | null>(null)
  React.useEffect(() => {
    if (!at) return
    const close = () => setAt(null)
    document.addEventListener("click", close)
    document.addEventListener("scroll", close, true)
    return () => { document.removeEventListener("click", close); document.removeEventListener("scroll", close, true) }
  }, [at])
  return (
    <>
      <div onContextMenu={(e) => { e.preventDefault(); setAt({ x: e.clientX, y: e.clientY }) }}>{children}</div>
      {at && (
        <div className="st-popover" role="menu" style={{ position: "fixed", left: at.x, top: at.y }}>
          <div className="st-menu">
            {items.map((i) => (
              <button key={i.label} type="button" role="menuitem" className="st-menu__item"
                      data-danger={i.danger ? "" : undefined} onClick={i.onSelect}>{i.label}</button>
            ))}
          </div>
        </div>
      )}
    </>
  )
}

/** Hover-only affordances are unreachable on touch, so this opens on tap too. */
export function HoverCard({ trigger, children }: { trigger: React.ReactNode; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <span style={{ position: "relative", display: "inline-block" }}
          onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      <button type="button" className="st-link" style={{ background: "none", border: 0, padding: 0, minHeight: 0, minWidth: 0 }}
              onClick={() => setOpen((o) => !o)}>{trigger}</button>
      {open && <span className="st-popover" style={{ position: "absolute", top: "calc(100% + 6px)", left: 0 }}>{children}</span>}
    </span>
  )
}

export function Tooltip({ label, children }: { label: string; children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  return (
    <span style={{ position: "relative", display: "inline-flex" }}
          onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}
          onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}>
      {children}
      {open && <span className="st-tooltip" role="tooltip" style={{ position: "absolute", bottom: "calc(100% + 6px)", left: 0, whiteSpace: "nowrap" }}>{label}</span>}
    </span>
  )
}

export function Lightbox({ src, alt, onClose }: { src: string; alt: string; onClose: () => void }) {
  React.useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose() }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [onClose])
  return (
    <div className="st-lightbox" role="dialog" aria-modal="true" aria-label={alt} onClick={onClose}>
      <img src={src} alt={alt} />
    </div>
  )
}

/* ======================================================================
 * NAVIGATION — the remainder
 * ==================================================================== */

export function CommandPalette({ open, onClose, groups }: {
  open: boolean
  onClose: () => void
  groups: Array<{ label: string; items: Array<{ label: string; onSelect: () => void; hint?: string }> }>
}) {
  const [q, setQ] = React.useState("")
  const [active, setActive] = React.useState(0)

  const flat = React.useMemo(
    () => groups.flatMap((g) => g.items.filter((i) => i.label.toLowerCase().includes(q.toLowerCase())).map((i) => ({ ...i, group: g.label }))),
    [groups, q]
  )

  React.useEffect(() => { setActive(0) }, [q])
  React.useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose()
      else if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => Math.min(a + 1, flat.length - 1)) }
      else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
      else if (e.key === "Enter" && flat[active]) { e.preventDefault(); flat[active].onSelect(); onClose() }
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [open, flat, active, onClose])

  if (!open) return null
  let lastGroup = ""
  return (
    <>
      <div className="st-overlay" onClick={onClose} aria-hidden="true" />
      <div style={{ position: "fixed", zIndex: "var(--st-z-modal)", top: "12svh", left: "50%", transform: "translateX(-50%)" }}>
        <div className="st-command" role="dialog" aria-modal="true" aria-label="Command palette">
          <input className="st-input st-command__input" autoFocus placeholder="Type a command…" aria-label="Command"
                 value={q} onChange={(e) => setQ(e.target.value)} />
          <div className="st-command__list" role="listbox">
            {flat.length === 0 && <p className="st-caption" style={{ padding: "var(--st-space-base)" }}>No commands match.</p>}
            {flat.map((i, n) => {
              const head = i.group !== lastGroup ? ((lastGroup = i.group), i.group) : null
              return (
                <React.Fragment key={`${i.group}-${i.label}`}>
                  {head && <div className="st-command__group-label">{head}</div>}
                  <button type="button" role="option" aria-selected={n === active} className="st-command__item"
                          onMouseEnter={() => setActive(n)} onClick={() => { i.onSelect(); onClose() }}>
                    <span>{i.label}</span>
                    {i.hint && <><span className="st-spacer" /><kbd className="st-kbd">{i.hint}</kbd></>}
                  </button>
                </React.Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}

export const Menubar = ({ items }: { items: Array<{ label: string; onSelect?: () => void }> }) => (
  <div className="st-menubar" role="menubar">
    {items.map((i) => (
      <button key={i.label} type="button" role="menuitem" className="st-menubar__item" onClick={i.onSelect}>{i.label}</button>
    ))}
  </div>
)

export function AnchorNav({ items }: { items: Array<{ href: string; label: string; current?: boolean }> }) {
  return (
    <nav className="st-anchor-nav" aria-label="On this page">
      {items.map((i) => <a key={i.href} href={i.href} aria-current={i.current ? "true" : undefined}>{i.label}</a>)}
    </nav>
  )
}

export function Pagination({ page, pages, onChange }: { page: number; pages: number; onChange: (p: number) => void }) {
  return (
    <nav className="st-pagination" aria-label="Pagination">
      <button type="button" className="st-btn st-btn--ghost st-btn--sm" disabled={page <= 1} onClick={() => onChange(page - 1)}>Previous</button>
      <span className="st-caption st-numeric" aria-current="page">Page {page} of {pages}</span>
      <button type="button" className="st-btn st-btn--ghost st-btn--sm" disabled={page >= pages} onClick={() => onChange(page + 1)}>Next</button>
    </nav>
  )
}

export function Carousel({ children, label }: { children: React.ReactNode[]; label: string }) {
  const track = React.useRef<HTMLDivElement>(null)
  const [i, setI] = React.useState(0)
  return (
    <div className="st-carousel" role="group" aria-roledescription="carousel" aria-label={label}>
      <div className="st-carousel__track st-no-scrollbar" ref={track}
           onScroll={(e) => {
             const el = e.currentTarget
             setI(Math.round((el.scrollLeft / el.scrollWidth) * children.length))
           }}>
        {children.map((c, n) => <div className="st-carousel__slide" key={n}>{c}</div>)}
      </div>
      <div className="st-carousel__dots">
        {children.map((_, n) => (
          <button key={n} type="button" className="st-carousel__dot" aria-current={n === i ? "true" : undefined}
                  aria-label={`Go to slide ${n + 1}`}
                  onClick={() => {
                    const el = track.current!
                    el.scrollTo({ left: (el.scrollWidth / children.length) * n, behavior: "smooth" })
                  }} />
        ))}
      </div>
    </div>
  )
}

/* ======================================================================
 * MARKETING PATTERNS
 * ==================================================================== */

export const Hero = ({ eyebrow, title, children, actions, center }: {
  eyebrow?: string; title: React.ReactNode; children?: React.ReactNode; actions?: React.ReactNode; center?: boolean
}) => (
  <section className={cx("st-hero", center && "st-hero--center")}>
    {eyebrow && <p className="st-eyebrow">{eyebrow}</p>}
    <h1 className="st-display">{title}</h1>
    {children && <p className="st-lead">{children}</p>}
    {actions && <div className="st-cluster">{actions}</div>}
  </section>
)

export const SectionHeader = ({ eyebrow, title, children, center }: {
  eyebrow?: string; title: React.ReactNode; children?: React.ReactNode; center?: boolean
}) => (
  <header className={cx("st-section-header", center && "st-section-header--center")}>
    {eyebrow && <p className="st-eyebrow">{eyebrow}</p>}
    <h2 className="st-display st-display--xs">{title}</h2>
    {children && <p className="st-lead">{children}</p>}
  </header>
)

export const FeatureRow = ({ media, children, flip }: { media: React.ReactNode; children: React.ReactNode; flip?: boolean }) => (
  <div className={cx("st-feature-row", flip && "st-feature-row--flip")}>
    <div>{media}</div>
    <div>{children}</div>
  </div>
)

export const LogoWall = ({ children }: { children: React.ReactNode }) => (
  <div className="st-logo-wall">{children}</div>
)

export const Testimonial = ({ quote, author, role }: { quote: React.ReactNode; author: string; role?: string }) => (
  <figure className="st-quote" style={{ margin: 0 }}>
    <blockquote style={{ margin: 0, border: 0, padding: 0 }}>{quote}</blockquote>
    <figcaption className="st-caption" style={{ marginTop: "var(--st-space-s)" }}>
      {author}{role && ` · ${role}`}
    </figcaption>
  </figure>
)

export const PricingTable = ({ plans }: {
  plans: Array<{ name: string; price: string; period?: string; features: string[]; featured?: boolean; action?: React.ReactNode }>
}) => (
  <div className="st-grid">
    {plans.map((p) => (
      <div className="st-price" data-featured={p.featured ? "true" : undefined} key={p.name}>
        <div>
          <p className="st-eyebrow">{p.name}</p>
          <p className="st-price__amount">{p.price}</p>
          {p.period && <p className="st-caption">{p.period}</p>}
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0 }} className="st-stack st-stack--xs">
          {p.features.map((f) => <li key={f}>{f}</li>)}
        </ul>
        {p.action}
      </div>
    ))}
  </div>
)

export const PricingScreen = PricingTable

export const Faq = ({ items }: { items: Array<{ q: React.ReactNode; a: React.ReactNode }> }) => (
  <div className="st-accordion">
    {items.map((it, i) => (
      <details key={i}><summary>{it.q}</summary><div>{it.a}</div></details>
    ))}
  </div>
)

export const CtaBand = ({ title, children, actions }: { title: React.ReactNode; children?: React.ReactNode; actions?: React.ReactNode }) => (
  <section className="st-cta-band">
    <h2 className="st-display st-display--xs">{title}</h2>
    {children && <p className="st-lead" style={{ textAlign: "center" }}>{children}</p>}
    {actions && <div className="st-cluster">{actions}</div>}
  </section>
)

export const Footer = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <footer className={cx("st-footer", className)}>{children}</footer>
)

export const BlogCard = ({ title, excerpt, meta, href, image }: {
  title: string; excerpt?: string; meta?: string; href: string; image?: React.ReactNode
}) => (
  <a className="st-card st-card--interactive" href={href} style={{ textDecoration: "none", display: "block" }}>
    {image}
    <h3 className="st-card__title" style={{ marginTop: image ? "var(--st-space-s)" : 0 }}>{title}</h3>
    {excerpt && <p className="st-clamp-2" style={{ marginTop: "var(--st-space-xs)" }}>{excerpt}</p>}
    {meta && <p className="st-caption" style={{ marginTop: "var(--st-space-s)" }}>{meta}</p>}
  </a>
)

export const Newsletter = ({ onSubmit, label = "Get the monthly note", cta = "Subscribe" }: {
  onSubmit?: (email: string) => void; label?: string; cta?: string
}) => (
  <form className="st-form" onSubmit={(e) => {
    e.preventDefault()
    onSubmit?.(new FormData(e.currentTarget).get("email") as string)
  }}>
    <div className="st-field">
      <label className="st-field__label" htmlFor="st-news">{label}</label>
      <div className="st-cluster" style={{ flexWrap: "nowrap" }}>
        <input className="st-input" id="st-news" name="email" type="email" required placeholder="you@company.com" />
        <button className="st-btn st-btn--accent" type="submit">{cta}</button>
      </div>
    </div>
  </form>
)

/* ------------------------------------------------------- copilot overlay */

export function CopilotOverlay({ open, onClose, title = "Assistant", children }: {
  open: boolean; onClose: () => void; title?: string; children: React.ReactNode
}) {
  if (!open) return null
  return (
    <aside className="st-copilot" role="dialog" aria-label={title}>
      <div className="st-cluster st-cluster--between" style={{ padding: "var(--st-space-s) var(--st-space-base)", borderBottom: "1px solid var(--st-divider)" }}>
        <strong style={{ fontSize: "var(--st-text-sm)" }}>{title}</strong>
        <button type="button" className="st-btn st-btn--ghost st-btn--sm st-btn--icon" aria-label="Close" onClick={onClose}>&times;</button>
      </div>
      {children}
    </aside>
  )
}
