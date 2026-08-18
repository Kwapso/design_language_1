/* Structure — the rest of the form vocabulary.
 *
 * Checkbox and radio are drawn rather than native so they can carry the ink
 * language, but the real <input> stays in the DOM and keeps every bit of its
 * keyboard and screen-reader behaviour. A div with role="checkbox" is how
 * design systems break forms.
 * structure-definitions — defines the vocabulary; view budgets do not apply.
 */
import * as React from "react"
import { cx } from "./layout"

let seq = 0
const useUid = (given?: string) => {
  const [id] = React.useState(() => given ?? `st-i${++seq}`)
  return given ?? id
}

/* -------------------------------------------------------------- label */

export const Label = ({ required, className, children, ...rest }: React.ComponentPropsWithoutRef<"label"> & { required?: boolean }) => (
  <label className={cx("st-field__label", className)} data-required={required ? "" : undefined} {...rest}>
    {children}
    {required && <span className="st-sr-only"> (required)</span>}
  </label>
)

export const Fieldset = ({ legend, className, children, ...rest }: React.ComponentPropsWithoutRef<"fieldset"> & { legend?: string }) => (
  <fieldset className={cx("st-fieldset", className)} {...rest}>
    {legend && <legend>{legend}</legend>}
    {children}
  </fieldset>
)

export const Form = ({ className, ...rest }: React.ComponentPropsWithoutRef<"form">) => (
  <form className={cx("st-form", className)} {...rest} />
)

/* ---------------------------------------------------- checkbox & radio */

export interface CheckboxProps extends Omit<React.ComponentPropsWithoutRef<"input">, "type"> {
  label: React.ReactNode
  /** Renders the mixed state — e.g. a "select all" with a partial selection. */
  indeterminate?: boolean
}

export const Checkbox = React.forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  { label, indeterminate, className, ...rest }, ref
) {
  const inner = React.useRef<HTMLInputElement>(null)
  React.useImperativeHandle(ref, () => inner.current!, [])
  // `indeterminate` is a DOM property with no HTML attribute, so it can only
  // be set imperatively — there is no JSX prop that does this.
  React.useEffect(() => { if (inner.current) inner.current.indeterminate = !!indeterminate }, [indeterminate])

  return (
    <label className={cx("st-checkbox", className)}>
      <input ref={inner} type="checkbox" {...rest} />
      <span className="st-checkbox__box" aria-hidden="true" />
      <span>{label}</span>
    </label>
  )
})

export function RadioGroup({ name, options, value, onChange, label, orientation = "vertical" }: {
  name: string
  options: Array<{ value: string; label: React.ReactNode; description?: React.ReactNode }>
  value?: string
  onChange?: (v: string) => void
  label: string
  orientation?: "vertical" | "horizontal"
}) {
  return (
    <div role="radiogroup" aria-label={label}
         className={orientation === "vertical" ? "st-stack st-stack--s" : "st-cluster"}>
      {options.map((o) => (
        <label className="st-radio" key={o.value}>
          <input
            type="radio" name={name} value={o.value}
            checked={value === o.value}
            onChange={() => onChange?.(o.value)}
          />
          <span className="st-radio__box" aria-hidden="true" />
          <span>
            {o.label}
            {o.description && <span className="st-caption" style={{ display: "block" }}>{o.description}</span>}
          </span>
        </label>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------- slider */

export const Slider = React.forwardRef<HTMLInputElement, Omit<React.ComponentPropsWithoutRef<"input">, "type">>(
  function Slider({ className, ...rest }, ref) {
    return <input ref={ref} type="range" className={cx("st-slider", className)} {...rest} />
  }
)

/**
 * Two thumbs on one track. The handles are clamped against each other so the
 * range can never invert, which is the bug every dual slider ships with.
 */
export function RangeSlider({ min = 0, max = 100, step = 1, value, onChange, label }: {
  min?: number; max?: number; step?: number
  value: [number, number]
  onChange: (v: [number, number]) => void
  label: string
}) {
  const [lo, hi] = value
  return (
    <div className="st-stack st-stack--xs" role="group" aria-label={label}>
      <Slider min={min} max={hi} step={step} value={lo} aria-label={`${label} minimum`}
              onChange={(e) => onChange([Math.min(+e.target.value, hi), hi])} />
      <Slider min={lo} max={max} step={step} value={hi} aria-label={`${label} maximum`}
              onChange={(e) => onChange([lo, Math.max(+e.target.value, lo)])} />
      <div className="st-cluster st-cluster--between">
        <span className="st-caption st-numeric">{lo}</span>
        <span className="st-caption st-numeric">{hi}</span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------- rating */

export function Rating({ value = 0, max = 5, onChange, label, readOnly }: {
  value?: number; max?: number; onChange?: (v: number) => void; label: string; readOnly?: boolean
}) {
  return (
    <span className="st-rating" role={readOnly ? "img" : "radiogroup"} aria-label={`${label}: ${value} of ${max}`}>
      {Array.from({ length: max }, (_, i) => {
        const n = i + 1
        return readOnly ? (
          <span key={n} className="st-rating__star" data-on={n <= value ? "true" : undefined} aria-hidden="true">★</span>
        ) : (
          <button
            key={n} type="button" className="st-rating__star" data-on={n <= value ? "true" : undefined}
            role="radio" aria-checked={n === value} aria-label={`${n} of ${max}`}
            onClick={() => onChange?.(n)}
          >★</button>
        )
      })}
    </span>
  )
}

/** Net promoter score — 0–10, the standard eleven-point row. */
export const NPS = ({ value, onChange, label = "How likely are you to recommend us?" }: {
  value?: number; onChange?: (v: number) => void; label?: string
}) => (
  <div className="st-scale" role="radiogroup" aria-label={label}>
    {Array.from({ length: 11 }, (_, n) => (
      <button key={n} type="button" role="radio" aria-checked={value === n}
              className="st-scale__item" data-selected={value === n ? "true" : undefined}
              onClick={() => onChange?.(n)}>{n}</button>
    ))}
  </div>
)

/* ---------------------------------------------------------- tag input */

export function TagInput({ tags, onChange, placeholder = "Add…", label }: {
  tags: string[]; onChange: (t: string[]) => void; placeholder?: string; label: string
}) {
  const [draft, setDraft] = React.useState("")
  const commit = () => {
    const v = draft.trim()
    if (!v || tags.includes(v)) return setDraft("")
    onChange([...tags, v]); setDraft("")
  }
  // A <label>, so clicking anywhere in the 44px container focuses the field —
  // which is what makes the small inner input acceptable.
  return (
    <label className="st-tag-input">
      {tags.map((t) => (
        <span className="st-chip" key={t}>
          {t}
          <button type="button" className="st-chip__remove" aria-label={`Remove ${t}`}
                  onClick={() => onChange(tags.filter((x) => x !== t))}>&times;</button>
        </span>
      ))}
      <input
        value={draft} placeholder={placeholder} aria-label={label}
        onChange={(e) => setDraft(e.target.value)}
        onBlur={commit}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit() }
          // Backspace on an empty field removes the last tag — the behaviour
          // every user of a tag field already expects.
          else if (e.key === "Backspace" && !draft && tags.length) onChange(tags.slice(0, -1))
        }}
      />
    </label>
  )
}

/* --------------------------------------------------------- otp input */

export function OtpInput({ length = 6, value, onChange, label = "One-time code" }: {
  length?: number; value: string; onChange: (v: string) => void; label?: string
}) {
  const refs = React.useRef<Array<HTMLInputElement | null>>([])
  const chars = value.padEnd(length).slice(0, length).split("")

  const set = (i: number, c: string) => {
    const next = chars.map((x, j) => (j === i ? c : x)).join("").trimEnd()
    onChange(next)
    if (c && i < length - 1) refs.current[i + 1]?.focus()
  }

  return (
    <div className="st-otp" role="group" aria-label={label}>
      {chars.map((c, i) => (
        <input
          key={i}
          ref={(el) => { refs.current[i] = el }}
          value={c.trim()}
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          aria-label={`${label}, digit ${i + 1}`}
          onChange={(e) => set(i, e.target.value.replace(/\D/g, "").slice(-1))}
          onKeyDown={(e) => {
            if (e.key === "Backspace" && !c.trim() && i > 0) refs.current[i - 1]?.focus()
          }}
          onPaste={(e) => {
            // Codes are pasted far more often than typed.
            e.preventDefault()
            onChange(e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length))
          }}
        />
      ))}
    </div>
  )
}

/* ------------------------------------------------------------ combobox */

export function Combobox({ options, value, onChange, placeholder = "Search…", label }: {
  options: Array<{ value: string; label: string }>
  value?: string
  onChange: (v: string) => void
  placeholder?: string
  label: string
}) {
  const [open, setOpen] = React.useState(false)
  const [query, setQuery] = React.useState("")
  const [active, setActive] = React.useState(0)
  const wrap = React.useRef<HTMLDivElement>(null)
  const id = useUid()

  const filtered = React.useMemo(
    () => options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase())),
    [options, query]
  )

  React.useEffect(() => {
    if (!open) return
    const onDown = (e: MouseEvent) => { if (!wrap.current?.contains(e.target as Node)) setOpen(false) }
    document.addEventListener("mousedown", onDown)
    return () => document.removeEventListener("mousedown", onDown)
  }, [open])

  const pick = (v: string) => { onChange(v); setOpen(false); setQuery("") }

  return (
    <div className="st-combobox" ref={wrap}>
      <input
        className="st-input"
        role="combobox"
        aria-expanded={open}
        aria-controls={`${id}-list`}
        aria-autocomplete="list"
        aria-label={label}
        placeholder={placeholder}
        value={open ? query : options.find((o) => o.value === value)?.label ?? ""}
        onFocus={() => setOpen(true)}
        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActive(0) }}
        onKeyDown={(e) => {
          if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive((a) => Math.min(a + 1, filtered.length - 1)) }
          else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => Math.max(a - 1, 0)) }
          else if (e.key === "Enter" && open && filtered[active]) { e.preventDefault(); pick(filtered[active].value) }
          else if (e.key === "Escape") setOpen(false)
        }}
      />
      {open && (
        <ul className="st-combobox__list" id={`${id}-list`} role="listbox" aria-label={label}>
          {filtered.length === 0 && <li className="st-combobox__option st-muted">No matches</li>}
          {filtered.map((o, i) => (
            <li
              key={o.value} role="option" aria-selected={i === active}
              className="st-combobox__option"
              onMouseEnter={() => setActive(i)}
              onMouseDown={(e) => { e.preventDefault(); pick(o.value) }}
            >{o.label}</li>
          ))}
        </ul>
      )}
    </div>
  )
}

/* ------------------------------------------------------------ calendar */

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"]
const DOW = ["Mo","Tu","We","Th","Fr","Sa","Su"]

export function Calendar({ value, onChange, month, onMonthChange, label = "Choose a date" }: {
  value?: Date
  onChange?: (d: Date) => void
  month?: Date
  onMonthChange?: (d: Date) => void
  label?: string
}) {
  const [internal, setInternal] = React.useState(() => month ?? value ?? new Date())
  const view = month ?? internal
  const setView = onMonthChange ?? setInternal

  const y = view.getFullYear(), m = view.getMonth()
  const first = new Date(y, m, 1)
  // Monday-first: JS getDay() is Sunday-first, so shift it.
  const lead = (first.getDay() + 6) % 7
  const days = new Date(y, m + 1, 0).getDate()
  const today = new Date()
  const same = (a: Date, b: Date) => a.toDateString() === b.toDateString()

  return (
    <div className="st-calendar" role="group" aria-label={label}>
      <div className="st-calendar__head">
        <button type="button" className="st-btn st-btn--ghost st-btn--sm st-btn--icon"
                aria-label="Previous month" onClick={() => setView(new Date(y, m - 1, 1))}>‹</button>
        <strong style={{ fontSize: "var(--st-text-sm)" }}>{MONTHS[m]} {y}</strong>
        <button type="button" className="st-btn st-btn--ghost st-btn--sm st-btn--icon"
                aria-label="Next month" onClick={() => setView(new Date(y, m + 1, 1))}>›</button>
      </div>
      <div className="st-calendar__grid">
        {DOW.map((d) => <div className="st-calendar__dow" key={d} aria-hidden="true">{d}</div>)}
        {Array.from({ length: lead }, (_, i) => <div key={`lead${i}`} />)}
        {Array.from({ length: days }, (_, i) => {
          const d = new Date(y, m, i + 1)
          return (
            <button
              key={i} type="button" className="st-calendar__day"
              aria-selected={value ? same(d, value) : undefined}
              data-today={same(d, today) ? "true" : undefined}
              aria-label={d.toDateString()}
              onClick={() => onChange?.(d)}
            >{i + 1}</button>
          )
        })}
      </div>
    </div>
  )
}

export function DatePicker({ value, onChange, label }: { value?: Date; onChange?: (d: Date) => void; label: string }) {
  const [open, setOpen] = React.useState(false)
  return (
    <div className="st-combobox">
      <input
        className="st-input" readOnly aria-label={label} aria-expanded={open} aria-haspopup="dialog"
        value={value ? value.toLocaleDateString() : ""} placeholder="Select a date"
        onClick={() => setOpen((o) => !o)}
      />
      {open && (
        <div className="st-combobox__list" style={{ padding: 0 }}>
          <Calendar value={value} label={label} onChange={(d) => { onChange?.(d); setOpen(false) }} />
        </div>
      )}
    </div>
  )
}

export function DateRangePicker({ value, onChange, label }: {
  value: [Date | undefined, Date | undefined]
  onChange: (v: [Date | undefined, Date | undefined]) => void
  label: string
}) {
  const [from, to] = value
  return (
    <div className="st-cluster" role="group" aria-label={label}>
      <DatePicker label={`${label} from`} value={from} onChange={(d) => onChange([d, to])} />
      <span className="st-muted">→</span>
      <DatePicker label={`${label} to`} value={to} onChange={(d) => onChange([from, d])} />
    </div>
  )
}

export const TimePicker = ({ label, ...rest }: React.ComponentPropsWithoutRef<"input"> & { label: string }) => (
  <input type="time" className="st-input" aria-label={label} {...rest} />
)

/* --------------------------------------------------------- file upload */

export function FileUpload({ onFiles, accept, multiple, label = "Upload files", hint }: {
  onFiles: (files: File[]) => void
  accept?: string
  multiple?: boolean
  label?: string
  hint?: string
}) {
  const [over, setOver] = React.useState(false)
  const input = React.useRef<HTMLInputElement>(null)
  return (
    <div
      className="st-dropzone"
      data-over={over ? "true" : undefined}
      role="button"
      tabIndex={0}
      aria-label={label}
      onClick={() => input.current?.click()}
      onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); input.current?.click() } }}
      onDragOver={(e) => { e.preventDefault(); setOver(true) }}
      onDragLeave={() => setOver(false)}
      onDrop={(e) => { e.preventDefault(); setOver(false); onFiles(Array.from(e.dataTransfer.files)) }}
    >
      <input ref={input} type="file" accept={accept} multiple={multiple} hidden
             onChange={(e) => onFiles(Array.from(e.target.files ?? []))} />
      <strong>{label}</strong>
      <span className="st-caption">{hint ?? "Drag and drop, or click to browse"}</span>
    </div>
  )
}

/* ----------------------------------------------------------- signature */

export function Signature({ onChange, height = 160, label = "Signature" }: {
  onChange?: (dataUrl: string | null) => void; height?: number; label?: string
}) {
  const ref = React.useRef<HTMLCanvasElement>(null)
  const drawing = React.useRef(false)

  const pos = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const r = e.currentTarget.getBoundingClientRect()
    return { x: e.clientX - r.left, y: e.clientY - r.top }
  }

  return (
    <div className="st-stack st-stack--xs">
      <canvas
        ref={ref} className="st-signature" height={height} aria-label={label}
        onPointerDown={(e) => {
          drawing.current = true
          e.currentTarget.setPointerCapture(e.pointerId)
          const ctx = ref.current!.getContext("2d")!
          const { x, y } = pos(e)
          ctx.beginPath(); ctx.moveTo(x, y)
        }}
        onPointerMove={(e) => {
          if (!drawing.current) return
          const ctx = ref.current!.getContext("2d")!
          const { x, y } = pos(e)
          ctx.lineWidth = 2; ctx.lineCap = "round"
          ctx.strokeStyle = getComputedStyle(document.documentElement).getPropertyValue("--st-foreground").trim()
          ctx.lineTo(x, y); ctx.stroke()
        }}
        onPointerUp={() => { drawing.current = false; onChange?.(ref.current?.toDataURL() ?? null) }}
      />
      <button type="button" className="st-btn st-btn--ghost st-btn--sm" onClick={() => {
        const c = ref.current!
        c.getContext("2d")!.clearRect(0, 0, c.width, c.height)
        onChange?.(null)
      }}>Clear</button>
    </div>
  )
}

export const ColorInput = ({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) => (
  <span className="st-color">
    <input type="color" value={value} aria-label={label} onChange={(e) => onChange(e.target.value)}
           style={{ width: 0, height: 0, opacity: 0, position: "absolute" }} id={`c-${label}`} />
    <label htmlFor={`c-${label}`} className="st-color__swatch" style={{ background: value }} />
    <code className="st-code">{value}</code>
  </span>
)
