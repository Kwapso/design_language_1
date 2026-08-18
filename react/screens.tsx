/* Structure — screens.
 *
 * Whole-page scaffolds. Components alone do not let you build software: every
 * product re-invents the same dozen layouts, slightly differently each time,
 * and that is where a design system actually leaks.
 *
 * Each shell owns the page: viewport height, and — the part that is always
 * got wrong — WHICH SINGLE ELEMENT SCROLLS. Nested scrollbars happen because
 * nobody decided. Here it is decided.
 * structure-definitions — defines the vocabulary; view budgets do not apply.
 */
import * as React from "react"
import { cx } from "./layout"

/* ------------------------------------------------------------- app shell */

export function AppShell({ rail, head, children, className }: {
  rail?: React.ReactNode
  head?: React.ReactNode
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cx("st-shell", className)}>
      {rail && <aside className="st-shell__rail">{rail}</aside>}
      {head && <header className="st-shell__head">{head}</header>}
      {/* The one scrolling region in the app. Focusable so keyboard users can
          scroll it without first tabbing to something inside it. */}
      <main className="st-shell__main" id="main" tabIndex={-1}>{children}</main>
    </div>
  )
}

export const MarketingShell = ({ children, className }: { children: React.ReactNode; className?: string }) => (
  <div className={cx("st-shell st-shell--marketing", className)}>{children}</div>
)

/** Master/detail. On a phone one pane shows at a time via `pane`. */
export function SplitShell({ list, detail, pane = "list", className }: {
  list: React.ReactNode
  detail: React.ReactNode
  pane?: "list" | "detail"
  className?: string
}) {
  return (
    <div className={cx("st-split-shell", className)} data-pane={pane}>
      <div>{list}</div>
      <div>{detail}</div>
    </div>
  )
}

/** One task, no navigation. Removing the exits is the point. */
export function FocusShell({ head, foot, children, className }: {
  head?: React.ReactNode; foot?: React.ReactNode; children: React.ReactNode; className?: string
}) {
  return (
    <div className={cx("st-focus-shell", className)}>
      <div>{head}</div>
      <div className="st-focus-shell__body">
        <div className="st-focus-shell__inner">{children}</div>
      </div>
      <div>{foot}</div>
    </div>
  )
}

/* ----------------------------------------------------------------- auth */

export function AuthScreen({ title, children, aside, footer }: {
  title: string
  children: React.ReactNode
  aside?: React.ReactNode
  footer?: React.ReactNode
}) {
  return (
    <div className="st-auth">
      <div className="st-auth__panel">
        <div className="st-auth__form">
          <h1 className="st-display st-display--xs" style={{ fontSize: "var(--st-text-xl)" }}>{title}</h1>
          <div style={{ marginTop: "var(--st-space-m)" }}>{children}</div>
          {footer && <div style={{ marginTop: "var(--st-space-m)" }} className="st-caption">{footer}</div>}
        </div>
      </div>
      {/* Decorative half — hidden on small screens. The form is never the
          half that disappears. */}
      <aside className="st-auth__aside st-invert" aria-hidden="true">{aside}</aside>
    </div>
  )
}

/* ------------------------------------------------------------ page parts */

export function PageHeader({ title, meta, actions, breadcrumb }: {
  title: React.ReactNode
  meta?: React.ReactNode
  actions?: React.ReactNode
  breadcrumb?: React.ReactNode
}) {
  return (
    <div className="st-page-header">
      <div style={{ minWidth: 0 }}>
        {breadcrumb}
        <h1 className="st-page-header__title">{title}</h1>
        {meta && <p className="st-page-header__meta">{meta}</p>}
      </div>
      {actions && <div className="st-cluster">{actions}</div>}
    </div>
  )
}

export const Toolbar = ({ sticky, className, ...rest }: React.ComponentPropsWithoutRef<"div"> & { sticky?: boolean }) => (
  <div className={cx("st-toolbar", sticky && "st-toolbar--sticky", className)} {...rest} />
)

export const DashboardScreen = ({ header, children }: { header?: React.ReactNode; children: React.ReactNode }) => (
  <>{header}{children}</>
)

export const DetailScreen = ({ main, aside, header }: {
  main: React.ReactNode; aside?: React.ReactNode; header?: React.ReactNode
}) => (
  <>
    {header}
    <div className="st-detail">
      <div>{main}</div>
      {aside && <aside>{aside}</aside>}
    </div>
  </>
)

export const ProfileScreen = DetailScreen

/* ------------------------------------------------------------- settings */

export function SettingsScreen({ nav, children }: { nav?: React.ReactNode; children: React.ReactNode }) {
  return (
    <div className="st-settings">
      {nav && <nav aria-label="Settings">{nav}</nav>}
      <div>{children}</div>
    </div>
  )
}

export const SettingsGroup = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginBottom: "var(--st-space-l)" }}>
    <h2 className="st-eyebrow" style={{ marginBottom: "var(--st-space-s)" }}>{title}</h2>
    <div className="st-settings__group">{children}</div>
  </section>
)

export const SettingsRow = ({ title, description, control }: {
  title: React.ReactNode; description?: React.ReactNode; control: React.ReactNode
}) => (
  <div className="st-settings__row">
    <div>
      <div className="st-settings__row-title">{title}</div>
      {description && <div className="st-settings__row-desc">{description}</div>}
    </div>
    <div>{control}</div>
  </div>
)

/** Destructive settings are quarantined so they can never sit next to a rename. */
export const DangerZone = ({ children }: { children: React.ReactNode }) => (
  <section className="st-danger-zone">
    <h2 className="st-eyebrow" style={{ color: "var(--st-danger)" }}>Danger zone</h2>
    <div style={{ marginTop: "var(--st-space-s)" }}>{children}</div>
  </section>
)

/* --------------------------------------------------------------- wizard */

export function WizardScreen({ steps, current, onBack, onNext, nextLabel = "Next", backLabel = "Back", title, children, canAdvance = true }: {
  steps: string[]
  current: number
  onBack?: () => void
  onNext?: () => void
  nextLabel?: string
  backLabel?: string
  title?: React.ReactNode
  children: React.ReactNode
  canAdvance?: boolean
}) {
  const pct = Math.round(((current + 1) / steps.length) * 100)
  return (
    <div className="st-wizard">
      <div className="st-wizard__head">
        <div className="st-cluster st-cluster--between">
          <span className="st-caption">Step {current + 1} of {steps.length}</span>
          <span className="st-caption">{steps[current]}</span>
        </div>
        <div className="st-progress" role="progressbar" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}
             aria-label="Progress" style={{ marginTop: "var(--st-space-s)" }}>
          <div className="st-progress__bar" style={{ width: `${pct}%` }} />
        </div>
      </div>

      <div className="st-wizard__body">
        <div className="st-wizard__inner">
          {title && <h1 className="st-display st-display--xs" style={{ fontSize: "var(--st-text-xl)", marginBottom: "var(--st-space-m)" }}>{title}</h1>}
          {children}
        </div>
      </div>

      <div className="st-wizard__foot">
        <button type="button" className="st-btn st-btn--ghost" onClick={onBack} disabled={current === 0}>{backLabel}</button>
        <button type="button" className="st-btn st-btn--accent" onClick={onNext} disabled={!canAdvance}>{nextLabel}</button>
      </div>
    </div>
  )
}

export const Onboarding = WizardScreen
export const ImportWizard = WizardScreen

/* ------------------------------------------------------------- checkout */

export function CheckoutScreen({ children, summary }: { children: React.ReactNode; summary: React.ReactNode }) {
  return (
    <div className="st-checkout">
      <div>{children}</div>
      <aside className="st-checkout__summary">{summary}</aside>
    </div>
  )
}

/* ---------------------------------------------------------------- chat */

export const ChatScreen = ({ header, children, composer }: {
  header?: React.ReactNode; children: React.ReactNode; composer: React.ReactNode
}) => (
  <div className="st-chat" style={{ height: "100%" }}>
    {header}
    {children}
    <div style={{ padding: "var(--st-space-base)", paddingTop: 0 }}>{composer}</div>
  </div>
)

export const InboxScreen = SplitShell

/* -------------------------------------------------------- bottom nav */

export function BottomNav({ items }: {
  items: Array<{ label: string; href?: string; icon?: React.ReactNode; current?: boolean; onClick?: () => void }>
}) {
  return (
    <nav className="st-bottom-nav" aria-label="Primary">
      {items.map((i) =>
        i.href ? (
          <a key={i.label} className="st-bottom-nav__item" href={i.href} aria-current={i.current ? "page" : undefined}>
            {i.icon}{i.label}
          </a>
        ) : (
          <button key={i.label} type="button" className="st-bottom-nav__item" aria-current={i.current ? "page" : undefined} onClick={i.onClick}>
            {i.icon}{i.label}
          </button>
        )
      )}
    </nav>
  )
}
