/* Structure — the states nobody designs and everybody sees.
 *
 * Empty, missing, forbidden, broken, offline. These are shipped as real
 * components because otherwise every screen invents its own, badly, at the
 * end of the sprint.
 *
 * The rule they all follow: SAY WHAT HAPPENED, THEN OFFER THE WAY OUT. A dead
 * end with an apology is not a state, it is a trap. Every component here has
 * a place for an action, and the ones that can suggest a default do.
 * structure-definitions — defines the vocabulary; view budgets do not apply.
 */
import * as React from "react"
import { cx } from "./layout"

/* ------------------------------------------------------------ empty family */

export function EmptyState({ title, children, action, icon, className }: {
  title: string
  children?: React.ReactNode
  action?: React.ReactNode
  icon?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cx("st-empty", className)}>
      {icon}
      <p className="st-empty__title">{title}</p>
      {children && <p>{children}</p>}
      {action}
    </div>
  )
}

/**
 * Nothing exists YET — distinct from "your filter matched nothing". First-run
 * is an invitation and should carry the primary action; no-results is a
 * correction and should carry a way to widen the search.
 */
export const FirstRun = ({ thing, action, children }: {
  thing: string; action?: React.ReactNode; children?: React.ReactNode
}) => (
  <EmptyState title={`No ${thing} yet`} action={action}>
    {children ?? `When you add your first ${thing}, it will show up here.`}
  </EmptyState>
)

/** A search or filter returned nothing. Always echo the query back. */
export const NoResults = ({ query, onClear }: { query?: string; onClear?: () => void }) => (
  <EmptyState
    title={query ? `Nothing matches “${query}”` : "Nothing matches those filters"}
    action={onClear && <button type="button" className="st-btn st-btn--outline" onClick={onClear}>Clear filters</button>}
  >
    Try a shorter search, or remove a filter.
  </EmptyState>
)

export const SuccessState = ({ title, children, action }: {
  title: string; children?: React.ReactNode; action?: React.ReactNode
}) => (
  <EmptyState title={title} action={action} icon={<span className="st-dot st-dot--success" aria-hidden="true" />}>
    {children}
  </EmptyState>
)

/** An inline failure inside an otherwise working screen. */
export const ErrorState = ({ title = "That didn't work", children, onRetry }: {
  title?: string; children?: React.ReactNode; onRetry?: () => void
}) => (
  <EmptyState
    title={title}
    action={onRetry && <button type="button" className="st-btn st-btn--outline" onClick={onRetry}>Try again</button>}
  >
    {children ?? "Something went wrong on our side. Trying again usually fixes it."}
  </EmptyState>
)

/* ----------------------------------------------------------- status pages */

export function StatusPage({ code, title, children, actions }: {
  code?: string
  title: string
  children?: React.ReactNode
  actions?: React.ReactNode
}) {
  return (
    <main className="st-status-page">
      <div className="st-status-page__inner">
        {code && <p className="st-status-page__code" aria-hidden="true">{code}</p>}
        <h1 className="st-status-page__title">{title}</h1>
        <div className="st-status-page__body">{children}</div>
        {actions && <div className="st-status-page__actions">{actions}</div>}
      </div>
    </main>
  )
}

const HomeLink = () => <a className="st-btn st-btn--accent" href="/">Back to safety</a>

export const NotFound = ({ children }: { children?: React.ReactNode }) => (
  <StatusPage code="404" title="That page doesn't exist" actions={<HomeLink />}>
    {children ?? "The link may be out of date, or the page may have moved."}
  </StatusPage>
)

export const ServerError = ({ reference, children }: { reference?: string; children?: React.ReactNode }) => (
  <StatusPage
    code="500"
    title="Something broke on our side"
    actions={
      <>
        <button type="button" className="st-btn st-btn--accent" onClick={() => location.reload()}>Reload</button>
        <HomeLink />
      </>
    }
  >
    {children ?? "This is not your fault. We have been notified."}
    {/* A reference the user can quote turns "it's broken" into a findable
        incident, which is the difference between a support ticket that can be
        resolved and one that cannot. */}
    {reference && <><br /><code className="st-code">{reference}</code></>}
  </StatusPage>
)

export const Forbidden = ({ children }: { children?: React.ReactNode }) => (
  <StatusPage code="403" title="You don't have access to this" actions={<HomeLink />}>
    {children ?? "Ask an administrator on your team to grant you access."}
  </StatusPage>
)

export const Maintenance = ({ until, children }: { until?: string; children?: React.ReactNode }) => (
  <StatusPage title="Back shortly">
    {children ?? "We're making a scheduled change."}
    {until && <> Expected back by <strong>{until}</strong>.</>}
  </StatusPage>
)

/* ---------------------------------------------------------------- offline */

/**
 * Watches the connection and announces itself. Rendered permanently rather
 * than conditionally mounted, because a live region inserted at the same
 * moment as its text is frequently never announced.
 */
export function OfflineBanner({ message = "You're offline. Changes will sync when the connection returns." }: { message?: string }) {
  const [offline, setOffline] = React.useState(false)

  React.useEffect(() => {
    // navigator.onLine is only read after mount: on the server it does not
    // exist, and reading it during render would break hydration.
    setOffline(!navigator.onLine)
    const on = () => setOffline(false)
    const off = () => setOffline(true)
    window.addEventListener("online", on)
    window.addEventListener("offline", off)
    return () => { window.removeEventListener("online", on); window.removeEventListener("offline", off) }
  }, [])

  return (
    <div role="status" aria-live="polite">
      {offline && <div className="st-banner st-banner--danger">{message}</div>}
    </div>
  )
}

export const Banner = ({ tone, children, className, ...rest }: React.ComponentPropsWithoutRef<"div"> & {
  tone?: "accent" | "danger"
}) => (
  <div className={cx("st-banner", tone && `st-banner--${tone}`, className)} {...rest}>{children}</div>
)

/* --------------------------------------------------------- error boundary */

/**
 * The last line of defence. A blank white screen is the worst possible
 * failure mode because it gives the user nothing to do and nothing to report.
 */
export class ErrorBoundary extends React.Component<
  { children: React.ReactNode; fallback?: (error: Error, reset: () => void) => React.ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null }

  static getDerivedStateFromError(error: Error) { return { error } }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // Left as a console call on purpose: wiring this to a specific reporting
    // service would make the design system depend on one, so apps override it.
    console.error("[Structure] Uncaught error in subtree:", error, info.componentStack)
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children
    const reset = () => this.setState({ error: null })
    if (this.props.fallback) return this.props.fallback(error, reset)
    return (
      <StatusPage
        title="This part of the page stopped working"
        actions={<button type="button" className="st-btn st-btn--accent" onClick={reset}>Try again</button>}
      >
        The rest of the app is still fine. If this keeps happening, reload the page.
      </StatusPage>
    )
  }
}
