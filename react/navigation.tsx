/* Structure — navigation and disclosure. */
import * as React from "react"
import { cx } from "./layout"

export function Navbar({ brand, links, actions, className }: {
  brand: React.ReactNode
  links?: Array<{ href: string; label: string; current?: boolean }>
  actions?: React.ReactNode
  className?: string
}) {
  // The 7±2 guard runs in development only — it is a design smell, not a
  // runtime error, and it must never cost anything in production.
  if (process.env.NODE_ENV !== "production" && links && links.length > 7) {
    console.warn(
      `[Structure] Navbar has ${links.length} links. Past about seven, a nav stops being scanned and starts being searched. Group them, or promote a level.`
    )
  }
  return (
    <header className={cx("st-navbar", className)}>
      <div>{brand}</div>
      {links && (
        <nav className="st-navbar__links" aria-label="Main">
          {links.map((l) => (
            <a key={l.href} href={l.href} className="st-navbar__link" aria-current={l.current ? "page" : undefined}>
              {l.label}
            </a>
          ))}
        </nav>
      )}
      {actions && <div className="st-cluster">{actions}</div>}
    </header>
  )
}

/* ------------------------------------------------------------------ tabs */

export function Tabs({ tabs, value, onChange, label = "Sections" }: {
  tabs: Array<{ value: string; label: string }>
  value: string
  onChange: (v: string) => void
  label?: string
}) {
  const ref = React.useRef<HTMLDivElement>(null)

  // Arrow-key roving focus is required by the tabs pattern; without it a
  // keyboard user has to tab through every panel to reach the next one.
  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.value === value)
    let next = i
    if (e.key === "ArrowRight") next = (i + 1) % tabs.length
    else if (e.key === "ArrowLeft") next = (i - 1 + tabs.length) % tabs.length
    else if (e.key === "Home") next = 0
    else if (e.key === "End") next = tabs.length - 1
    else return
    e.preventDefault()
    onChange(tabs[next].value)
    ref.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[next]?.focus()
  }

  return (
    <div className="st-tabs" role="tablist" aria-label={label} onKeyDown={onKeyDown} ref={ref}>
      {tabs.map((t) => (
        <button
          key={t.value}
          role="tab"
          type="button"
          className="st-tabs__tab"
          aria-selected={t.value === value}
          // Only the active tab is in the tab order; arrows move between them.
          tabIndex={t.value === value ? 0 : -1}
          onClick={() => onChange(t.value)}
        >
          {t.label}
        </button>
      ))}
    </div>
  )
}

export function Segmented({ options, value, onChange, label }: {
  options: Array<{ value: string; label: string }>
  value: string
  onChange: (v: string) => void
  label: string
}) {
  return (
    <div className="st-segmented" role="group" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          className="st-segmented__item"
          aria-pressed={o.value === value}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function Breadcrumb({ items }: { items: Array<{ href?: string; label: string }> }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="st-breadcrumb" style={{ listStyle: "none", padding: 0, margin: 0 }}>
        {items.map((it, i) => (
          <li key={i} className="st-cluster" style={{ gap: "var(--st-space-xs)" }}>
            {it.href ? <a href={it.href}>{it.label}</a> : <span aria-current="page">{it.label}</span>}
            {i < items.length - 1 && <span className="st-breadcrumb__sep" aria-hidden="true">/</span>}
          </li>
        ))}
      </ol>
    </nav>
  )
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="st-stepper" style={{ listStyle: "none", padding: 0, margin: 0 }}>
      {steps.map((s, i) => {
        const state = i < current ? "done" : i === current ? "current" : "todo"
        return (
          <React.Fragment key={s}>
            <li className="st-stepper__step" data-state={state} aria-current={state === "current" ? "step" : undefined}>
              <span className="st-stepper__dot" aria-hidden="true">{state === "done" ? "✓" : i + 1}</span>
              <span>{s}</span>
              <span className="st-sr-only">
                {state === "done" ? "completed" : state === "current" ? "current step" : "not started"}
              </span>
            </li>
            {i < steps.length - 1 && <li className="st-stepper__line" aria-hidden="true" />}
          </React.Fragment>
        )
      })}
    </ol>
  )
}

export function Sidebar({ items, label = "Sections", className }: {
  items: Array<{ href: string; label: string; current?: boolean; icon?: React.ReactNode }>
  label?: string
  className?: string
}) {
  return (
    <nav className={cx("st-sidebar", className)} aria-label={label}>
      {items.map((i) => (
        <a key={i.href} href={i.href} className="st-sidebar__link" aria-current={i.current ? "page" : undefined}>
          {i.icon}
          {i.label}
        </a>
      ))}
    </nav>
  )
}

/* ------------------------------------------------------------- disclosure */

/**
 * Progressive disclosure, collapsed by default. Built on <details> so it
 * works without JavaScript and is findable by in-page browser search.
 */
export function Reveal({ summary, children, open, className }: {
  summary: React.ReactNode
  children: React.ReactNode
  open?: boolean
  className?: string
}) {
  return (
    <details className={className} open={open}>
      <summary>{summary}</summary>
      <div>{children}</div>
    </details>
  )
}

export function Accordion({ items }: { items: Array<{ summary: React.ReactNode; content: React.ReactNode }> }) {
  return (
    <div>
      {items.map((it, i) => (
        <Reveal key={i} summary={it.summary}>{it.content}</Reveal>
      ))}
    </div>
  )
}
