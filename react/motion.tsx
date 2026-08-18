/* Structure — motion.
 * structure-definitions — defines the vocabulary; view budgets do not apply.
 *
 * Life comes from arrival, stagger, response and continuity — never from
 * gradients, glow or bounce. See the header of css/motion.css for the why.
 *
 * Everything here checks prefers-reduced-motion at runtime, not just in CSS,
 * because a count-up or a scroll trigger is JavaScript deciding to move: a
 * media query in a stylesheet cannot switch it off.
 */
import * as React from "react"
import { cx } from "./layout"

/** The user's motion preference, kept live — it can change mid-session. */
export function useReducedMotion(): boolean {
  // Default true on the server: render the settled state, so a reduced-motion
  // user never gets a flash of animation before hydration corrects it.
  const [reduced, setReduced] = React.useState(true)
  React.useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)")
    setReduced(mq.matches)
    const on = () => setReduced(mq.matches)
    mq.addEventListener("change", on)
    return () => mq.removeEventListener("change", on)
  }, [])
  return reduced
}

/**
 * True once the element has been on screen. Fires once and disconnects — a
 * card that re-animates every time it scrolls past is a distraction, not life.
 */
export function useInView<T extends HTMLElement = HTMLDivElement>(
  { margin = "0px 0px -10% 0px", once = true }: { margin?: string; once?: boolean } = {}
) {
  const ref = React.useRef<T>(null)
  const [inView, setInView] = React.useState(false)

  React.useEffect(() => {
    const el = ref.current
    if (!el) return
    // No IntersectionObserver (or a test environment): show the content.
    if (typeof IntersectionObserver === "undefined") { setInView(true); return }

    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setInView(true); if (once) io.disconnect() }
      else if (!once) setInView(false)
    }, { rootMargin: margin })

    io.observe(el)
    return () => io.disconnect()
  }, [margin, once])

  return [ref, inView] as const
}

/* --------------------------------------------------------------- enter */

export type EnterVariant = "rise" | "fade" | "scale" | "right" | "left" | "up"

/**
 * Animates in when scrolled into view. Renders its final state immediately if
 * motion is reduced, or if `whenVisible` is off.
 */
export function Enter({
  variant = "rise", whenVisible = true, delay, as: Tag = "div", className, children, style, ...rest
}: {
  variant?: EnterVariant
  whenVisible?: boolean
  delay?: number
  as?: React.ElementType
  className?: string
  children?: React.ReactNode
  style?: React.CSSProperties
} & Omit<React.ComponentPropsWithoutRef<"div">, "style" | "className" | "children">) {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView()
  const animate = !reduced && (!whenVisible || inView)

  return (
    <Tag
      ref={whenVisible ? ref : undefined}
      className={cx(animate && "st-enter", animate && variant !== "rise" && `st-enter--${variant}`, className)}
      style={{ animationDelay: animate && delay ? `${delay}ms` : undefined, ...style }}
      {...rest}
    >
      {children}
    </Tag>
  )
}

/**
 * Staggers its children in. The single highest-value effect in the system:
 * a list that arrives in sequence reads as considered, and it costs one class.
 */
export function Stagger({
  whenVisible = true, as: Tag = "div", className, children, ...rest
}: {
  whenVisible?: boolean
  as?: React.ElementType
  className?: string
  children?: React.ReactNode
} & Omit<React.ComponentPropsWithoutRef<"div">, "className" | "children">) {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView()
  const animate = !reduced && (!whenVisible || inView)
  return (
    <Tag ref={whenVisible ? ref : undefined} className={cx(animate && "st-stagger", className)} {...rest}>
      {children}
    </Tag>
  )
}

/* ------------------------------------------------------------- count up */

/**
 * Counts a number to its value. The eye follows a changing figure; a figure
 * that simply swaps has to be re-read to notice it changed at all.
 *
 * Driven by requestAnimationFrame rather than a CSS transition because there
 * is no interpolatable CSS property for text content.
 */
export function CountUp({
  value, duration = 400, decimals = 0, prefix = "", suffix = "", className,
}: {
  value: number
  duration?: number
  decimals?: number
  prefix?: string
  suffix?: string
  className?: string
}) {
  const reduced = useReducedMotion()
  const [ref, inView] = useInView<HTMLSpanElement>()
  const [shown, setShown] = React.useState(value)
  const from = React.useRef(0)

  React.useEffect(() => {
    if (reduced || !inView) { setShown(value); return }
    // requestAnimationFrame is paused entirely while the document is hidden.
    // Animating here would leave 0 — the WRONG NUMBER — on screen for as long
    // as the tab stays in the background. A missing animation is cosmetic; a
    // wrong figure is a defect, so correctness wins and we jump to the value.
    if (typeof document !== "undefined" && document.hidden) {
      setShown(value); from.current = value; return
    }
    const start = performance.now()
    // Count from zero on the first pass, then between values afterwards.
    const origin = from.current
    let raf = 0
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      // Matches --st-motion-ease-entrance closely enough that a counting
      // number and a growing bar beside it settle together.
      const eased = 1 - Math.pow(1 - t, 3)
      setShown(origin + (value - origin) * eased)
      if (t < 1) raf = requestAnimationFrame(tick)
      else from.current = value
    }
    raf = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(raf)
  }, [value, duration, reduced, inView])

  return (
    <span ref={ref} className={cx("st-count", className)}>
      {prefix}{shown.toFixed(decimals)}{suffix}
    </span>
  )
}

/* -------------------------------------------------- sliding indicators */

/**
 * Measures the selected child and moves a thumb to it. Re-measures on resize,
 * because a segmented control that reflows leaves its thumb behind otherwise.
 */
function useIndicator(selector: string, activeAttr: string, dep: unknown) {
  const ref = React.useRef<HTMLDivElement>(null)
  const [box, setBox] = React.useState<{ x: number; w: number } | null>(null)

  React.useLayoutEffect(() => {
    const host = ref.current
    if (!host) return
    const measure = () => {
      const active = host.querySelector<HTMLElement>(`${selector}[${activeAttr}="true"]`)
      if (!active) return setBox(null)
      setBox({ x: active.offsetLeft - host.clientLeft, w: active.offsetWidth })
    }
    measure()
    const ro = new ResizeObserver(measure)
    ro.observe(host)
    return () => ro.disconnect()
  }, [selector, activeAttr, dep])

  return [ref, box] as const
}

export function SegmentedAnimated({ options, value, onChange, label }: {
  options: Array<{ value: string; label: React.ReactNode }>
  value: string
  onChange: (v: string) => void
  label: string
}) {
  const [ref, box] = useIndicator(".st-segmented__item", "aria-pressed", value)
  return (
    <div className="st-segmented" role="group" aria-label={label} ref={ref}>
      {box && (
        <span
          className="st-segmented__thumb"
          aria-hidden="true"
          style={{ width: box.w, transform: `translateX(${box.x}px)` }}
        />
      )}
      {options.map((o) => (
        <button key={o.value} type="button" className="st-segmented__item"
                aria-pressed={o.value === value} onClick={() => onChange(o.value)}>
          {o.label}
        </button>
      ))}
    </div>
  )
}

export function TabsAnimated({ tabs, value, onChange, label = "Sections" }: {
  tabs: Array<{ value: string; label: string }>
  value: string
  onChange: (v: string) => void
  label?: string
}) {
  const [ref, box] = useIndicator(".st-tabs__tab", "aria-selected", value)

  const onKeyDown = (e: React.KeyboardEvent) => {
    const i = tabs.findIndex((t) => t.value === value)
    let n = i
    if (e.key === "ArrowRight") n = (i + 1) % tabs.length
    else if (e.key === "ArrowLeft") n = (i - 1 + tabs.length) % tabs.length
    else if (e.key === "Home") n = 0
    else if (e.key === "End") n = tabs.length - 1
    else return
    e.preventDefault()
    onChange(tabs[n].value)
    ref.current?.querySelectorAll<HTMLButtonElement>("[role=tab]")[n]?.focus()
  }

  return (
    <div className="st-tabs" role="tablist" aria-label={label} ref={ref} onKeyDown={onKeyDown}>
      {box && <span className="st-tabs__ink" aria-hidden="true" style={{ width: box.w, transform: `translateX(${box.x}px)` }} />}
      {tabs.map((t) => (
        <button key={t.value} role="tab" type="button" className="st-tabs__tab"
                aria-selected={t.value === value} tabIndex={t.value === value ? 0 : -1}
                onClick={() => onChange(t.value)}>
          {t.label}
        </button>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------ collapse */

/** Animates open and closed. Grid-rows, so it works without a measured height. */
export function Collapse({ open, children, className }: {
  open: boolean; children: React.ReactNode; className?: string
}) {
  return (
    <div className={cx("st-collapse", className)} data-open={open ? "true" : "false"} aria-hidden={!open}>
      <div>{children}</div>
    </div>
  )
}

/* ------------------------------------------------------- settled content */

/**
 * Fades content in as it replaces a skeleton, so the swap reads as one object
 * resolving rather than the screen flinching.
 */
export function Settled({ loading, skeleton, children }: {
  loading: boolean; skeleton: React.ReactNode; children: React.ReactNode
}) {
  const reduced = useReducedMotion()
  if (loading) return <>{skeleton}</>
  return <div className={reduced ? undefined : "st-settled"}>{children}</div>
}

/* ------------------------------------------------------- floating tabbar */

/**
 * The detached pill from the reference image, with one circular accent action.
 * It earns its shadow: it is genuinely detached from the page, which is the
 * single case the elevation escape hatch exists for.
 */
export function TabBar({ items, action }: {
  items: Array<{ label: string; icon: React.ReactNode; current?: boolean; onSelect?: () => void }>
  action?: { label: string; icon: React.ReactNode; onSelect?: () => void }
}) {
  return (
    <nav className="st-tabbar" aria-label="Primary">
      {items.map((i) => (
        <button key={i.label} type="button" className="st-tabbar__item"
                aria-current={i.current ? "page" : undefined} aria-label={i.label} onClick={i.onSelect}>
          {i.icon}
        </button>
      ))}
      {action && (
        <button type="button" className="st-tabbar__item st-tabbar__action"
                aria-label={action.label} onClick={action.onSelect}>
          {action.icon}
        </button>
      )}
    </nav>
  )
}
