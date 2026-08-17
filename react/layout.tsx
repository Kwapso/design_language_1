/* Structure — layout and typography primitives.
 *
 * Every component here renders the class names defined in css/components.css.
 * There is no styling logic in React: one implementation, two front doors.
 */
import * as React from "react"

const cx = (...parts: Array<string | false | null | undefined>) => parts.filter(Boolean).join(" ")

/** Render as a different element without losing the props type. */
type As<E extends React.ElementType> = { as?: E; className?: string; children?: React.ReactNode }
type PolyProps<E extends React.ElementType> = As<E> & Omit<React.ComponentPropsWithoutRef<E>, keyof As<E>>

/* ------------------------------------------------------------- container */

export function Container<E extends React.ElementType = "div">({
  as, width = "measure", className, ...rest
}: PolyProps<E> & { width?: "measure" | "wide" | "full" }) {
  const C = as || "div"
  return <C className={cx("st-container", width !== "measure" && `st-container--${width}`, className)} {...rest} />
}

export function Section<E extends React.ElementType = "section">({
  as, space = "base", className, ...rest
}: PolyProps<E> & { space?: "tight" | "base" | "loose" }) {
  const C = as || "section"
  return <C className={cx("st-section", space !== "base" && `st-section--${space}`, className)} {...rest} />
}

/* ----------------------------------------------------------------- flow */

export function Stack<E extends React.ElementType = "div">({
  as, gap, className, ...rest
}: PolyProps<E> & { gap?: "xs" | "s" | "base" | "m" | "l" }) {
  const C = as || "div"
  return <C className={cx("st-stack", gap && gap !== "base" && `st-stack--${gap}`, className)} {...rest} />
}

export function Cluster<E extends React.ElementType = "div">({
  as, justify, className, ...rest
}: PolyProps<E> & { justify?: "start" | "between" | "end" | "center" }) {
  const C = as || "div"
  return <C className={cx("st-cluster", justify && justify !== "start" && `st-cluster--${justify}`, className)} {...rest} />
}

export function Grid<E extends React.ElementType = "div">({
  as, cols = "auto", className, ...rest
}: PolyProps<E> & { cols?: "auto" | "wide" | 2 | 3 }) {
  const C = as || "div"
  const mod = cols === "wide" ? "st-grid--2" : typeof cols === "number" ? `st-grid--fixed-${cols}` : null
  return <C className={cx("st-grid", mod, className)} {...rest} />
}

export const Divider = ({ className, ...rest }: React.ComponentPropsWithoutRef<"hr">) => (
  <hr className={cx("st-divider", className)} {...rest} />
)

export const Spacer = () => <div className="st-spacer" aria-hidden="true" />

/** Contained sideways scroll — the only sanctioned horizontal overflow. */
export const ScrollX = ({ className, ...rest }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cx("st-scroll-x", className)} {...rest} />
)

/* ----------------------------------------------------------- typography */

export function Display<E extends React.ElementType = "h1">({
  as, size = "lg", className, ...rest
}: PolyProps<E> & { size?: "lg" | "sm" | "xs" }) {
  const C = as || "h1"
  return <C className={cx("st-display", size !== "lg" && `st-display--${size}`, className)} {...rest} />
}

export const Eyebrow = ({ className, ...rest }: React.ComponentPropsWithoutRef<"p">) => (
  <p className={cx("st-eyebrow", className)} {...rest} />
)

export const Lead = ({ className, ...rest }: React.ComponentPropsWithoutRef<"p">) => (
  <p className={cx("st-lead", className)} {...rest} />
)

export const Caption = ({ className, ...rest }: React.ComponentPropsWithoutRef<"p">) => (
  <p className={cx("st-caption", className)} {...rest} />
)

/** Visible to assistive tech only. Use for the label a sighted user infers. */
export const SrOnly = ({ children }: { children: React.ReactNode }) => (
  <span className="st-sr-only">{children}</span>
)

export const SkipLink = ({ href = "#main", children = "Skip to content" }: { href?: string; children?: React.ReactNode }) => (
  <a href={href} className="st-skip-link">{children}</a>
)

export { cx }
