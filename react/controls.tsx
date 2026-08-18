/* Structure — buttons, form controls, and marks. * structure-definitions — defines the vocabulary; view budgets do not apply.
 */
import * as React from "react"
import { cx } from "./layout"

/* ---------------------------------------------------------------- button */

export type ButtonVariant = "accent" | "outline" | "ghost" | "solid" | "danger"

export interface ButtonProps extends Omit<React.ComponentPropsWithoutRef<"button">, "disabled"> {
  variant?: ButtonVariant
  size?: "sm" | "base" | "lg"
  block?: boolean
  loading?: boolean
  disabled?: boolean
  /** Icon-only. `aria-label` becomes required — an unlabelled icon is a guess. */
  icon?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "accent", size = "base", block, loading, icon, disabled, className, children, type = "button", ...rest },
  ref
) {
  return (
    <button
      ref={ref}
      type={type}
      className={cx(
        "st-btn",
        `st-btn--${variant}`,
        size !== "base" && `st-btn--${size}`,
        block && "st-btn--block",
        icon && "st-btn--icon",
        className
      )}
      // A loading button stays focusable and announces itself, rather than
      // vanishing from the tab order mid-interaction.
      data-loading={loading || undefined}
      aria-busy={loading || undefined}
      disabled={disabled || loading}
      {...rest}
    >
      {children}
    </button>
  )
})

export const ButtonGroup = ({ className, ...rest }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cx("st-btn-group", className)} {...rest} />
)

export const Fab = React.forwardRef<HTMLButtonElement, ButtonProps>(function Fab(
  { className, ...rest }, ref
) {
  return <button ref={ref} type="button" className={cx("st-fab", className)} {...rest} />
})

/* ----------------------------------------------------------------- field */

let uid = 0
const useId = (given?: string) => {
  const [id] = React.useState(() => given ?? `st-${++uid}`)
  return given ?? id
}

export interface FieldProps {
  label: string
  hint?: string
  error?: string
  required?: boolean
  children: (props: {
    id: string
    "aria-describedby"?: string
    "aria-invalid"?: true
    "aria-required"?: true
  }) => React.ReactNode
  className?: string
}

/**
 * Wires label, hint and error to the control for assistive tech. The control
 * is a render prop so this works with any input — including one from another
 * library — rather than only the ones defined here.
 */
export function Field({ label, hint, error, required, children, className }: FieldProps) {
  const id = useId()
  const hintId = hint ? `${id}-hint` : undefined
  const errId = error ? `${id}-err` : undefined
  const describedBy = [hintId, errId].filter(Boolean).join(" ") || undefined

  return (
    <div className={cx("st-field", className)} data-invalid={error ? "true" : undefined}>
      <label className="st-field__label" htmlFor={id} data-required={required ? "" : undefined}>
        {label}
        {/* The asterisk is decorative; the real signal is aria-required. */}
        {required && <span className="st-sr-only"> (required)</span>}
      </label>
      {children({
        id,
        "aria-describedby": describedBy,
        "aria-invalid": error ? true : undefined,
        "aria-required": required ? true : undefined,
      })}
      {hint && !error && <p className="st-field__hint" id={hintId}>{hint}</p>}
      {/* role="alert" so a validation failure is announced when it appears. */}
      {error && <p className="st-field__error" id={errId} role="alert">{error}</p>}
    </div>
  )
}

export const Input = React.forwardRef<HTMLInputElement, React.ComponentPropsWithoutRef<"input">>(
  function Input({ className, ...rest }, ref) {
    return <input ref={ref} className={cx("st-input", className)} {...rest} />
  }
)

export const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentPropsWithoutRef<"textarea">>(
  function Textarea({ className, ...rest }, ref) {
    return <textarea ref={ref} className={cx("st-input", className)} {...rest} />
  }
)

export const Select = React.forwardRef<HTMLSelectElement, React.ComponentPropsWithoutRef<"select">>(
  function Select({ className, ...rest }, ref) {
    return <select ref={ref} className={cx("st-input", className)} {...rest} />
  }
)

export function SearchInput({ className, ...rest }: React.ComponentPropsWithoutRef<"input">) {
  return (
    <div className={cx("st-search", className)}>
      <svg className="st-search__icon" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
        <circle cx="7" cy="7" r="4.5" strokeWidth="1.5" />
        <path d="M10.5 10.5 14 14" strokeWidth="1.5" strokeLinecap="round" />
      </svg>
      <input type="search" className="st-input" {...rest} />
    </div>
  )
}

/* ---------------------------------------------------------------- switch */

export interface SwitchProps extends Omit<React.ComponentPropsWithoutRef<"input">, "type"> {
  label: React.ReactNode
}

export const Switch = React.forwardRef<HTMLInputElement, SwitchProps>(function Switch(
  { label, className, ...rest }, ref
) {
  return (
    <label className={cx("st-switch", className)}>
      <input ref={ref} type="checkbox" role="switch" {...rest} />
      <span className="st-switch__control" aria-hidden="true" />
      <span>{label}</span>
    </label>
  )
})

/* --------------------------------------------------------------- choice */

/* `title` is overridden deliberately: on a <label> the DOM `title` attribute is
 * a string tooltip, but a choice card's title is real content and may be a
 * node. Omitting the DOM one avoids a silently-wrong tooltip. */
export interface ChoiceProps extends Omit<React.ComponentPropsWithoutRef<"label">, "onChange" | "title"> {
  name: string
  value: string
  title: React.ReactNode
  description?: React.ReactNode
  type?: "radio" | "checkbox"
  checked?: boolean
  onChange?: (value: string, checked: boolean) => void
}

/** A whole-surface radio. The target is the statement, not a 16px dot. */
export function Choice({ name, value, title, description, type = "radio", checked, onChange, className, ...rest }: ChoiceProps) {
  return (
    <label className={cx("st-choice", className)} data-selected={checked ? "true" : undefined} {...rest}>
      <input
        type={type}
        name={name}
        value={value}
        checked={checked}
        onChange={(e) => onChange?.(value, e.currentTarget.checked)}
      />
      <span>
        <span className="st-choice__title">{title}</span>
        {description && <span className="st-choice__desc" style={{ display: "block" }}>{description}</span>}
      </span>
    </label>
  )
}

/** Likert / rating row — the scorecard's core interaction. */
export function Scale({
  options, value, onChange, label,
}: {
  options: Array<{ value: string; label: string }>
  value?: string
  onChange?: (v: string) => void
  label: string
}) {
  return (
    <div className="st-scale" role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          role="radio"
          aria-checked={value === o.value}
          className="st-scale__item"
          data-selected={value === o.value ? "true" : undefined}
          onClick={() => onChange?.(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

/* ----------------------------------------------------------------- marks */

export const Badge = ({ tone, className, ...rest }: React.ComponentPropsWithoutRef<"span"> & {
  tone?: "accent" | "info" | "success" | "danger" | "outline"
}) => <span className={cx("st-badge", tone && `st-badge--${tone}`, className)} {...rest} />

/**
 * A status dot. `label` is mandatory and always rendered — colour alone never
 * carries meaning, so there is deliberately no way to render a bare dot.
 */
export function StatusDot({ tone, label }: {
  tone: "info" | "success" | "danger" | "warning" | "muted"
  label: string
}) {
  return (
    <span className="st-cluster" style={{ gap: "var(--st-space-xs)" }}>
      <span className={`st-dot st-dot--${tone}`} aria-hidden="true" />
      <span>{label}</span>
    </span>
  )
}

export function Chip({ children, onRemove, className, ...rest }: React.ComponentPropsWithoutRef<"span"> & {
  onRemove?: () => void
}) {
  return (
    <span className={cx("st-chip", className)} {...rest}>
      {children}
      {onRemove && (
        <button type="button" className="st-chip__remove" onClick={onRemove} aria-label={`Remove ${typeof children === "string" ? children : "item"}`}>
          &times;
        </button>
      )}
    </span>
  )
}

export function Avatar({ src, name, size = "base", className }: {
  src?: string
  name: string
  size?: "base" | "lg"
  className?: string
}) {
  const initials = name.split(/\s+/).slice(0, 2).map((p) => p[0]).join("").toUpperCase()
  return (
    <span className={cx("st-avatar", size === "lg" && "st-avatar--lg", className)} title={name}>
      {src ? <img src={src} alt="" /> : <span aria-hidden="true">{initials}</span>}
      <span className="st-sr-only">{name}</span>
    </span>
  )
}

export const AvatarGroup = ({ className, ...rest }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cx("st-avatar-group", className)} {...rest} />
)
