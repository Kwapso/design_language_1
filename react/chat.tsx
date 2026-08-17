/* Structure — chat and AI surfaces.
 *
 * The cognitive-load argument for these defaults, in one place:
 *
 *  - The assistant does not speak in a bubble. Long generated text inside a
 *    tinted, rounded container is markedly harder to read than the same text
 *    set on the page; bubbles suit short turns, not paragraphs. The user's
 *    message keeps a sand bubble because it is short and needs to be findable
 *    when scrolling back.
 *  - Neither role is mango. An accent-coloured bubble would spend the view's
 *    single accent on every message, leaving nothing to mark the next action.
 *  - Machine detail — tool calls, reasoning — is collapsed by default. It is
 *    available in one click and absent until then.
 */
import * as React from "react"
import { cx } from "./layout"

export type Role = "user" | "assistant" | "system"

export const Chat = ({ className, ...rest }: React.ComponentPropsWithoutRef<"div">) => (
  <div className={cx("st-chat", className)} {...rest} />
)

/**
 * The scrolling transcript. Follows new content only when the reader is
 * already at the bottom — yanking someone away from a message they are
 * mid-way through reading is the most common chat-UI mistake there is.
 */
export function MessageList({ children, className, ...rest }: React.ComponentPropsWithoutRef<"div">) {
  const ref = React.useRef<HTMLDivElement>(null)
  const pinned = React.useRef(true)

  const onScroll = () => {
    const el = ref.current
    if (!el) return
    pinned.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
  }

  React.useEffect(() => {
    if (pinned.current) ref.current?.scrollTo({ top: ref.current.scrollHeight })
  })

  return (
    <div
      ref={ref}
      onScroll={onScroll}
      className={cx("st-chat__log", className)}
      // The transcript is a log: announce additions, do not re-read the lot.
      role="log"
      aria-live="polite"
      aria-relevant="additions"
      {...rest}
    >
      {children}
    </div>
  )
}

export function Message({ role, children, meta, actions, className }: {
  role: Role
  children: React.ReactNode
  meta?: string
  actions?: React.ReactNode
  className?: string
}) {
  return (
    <div className={cx("st-msg", `st-msg--${role}`, className)}>
      <div>
        <div className="st-msg__body">{children}</div>
        {(meta || actions) && (
          <div className="st-cluster" style={{ gap: "var(--st-space-s)" }}>
            {meta && <span className="st-msg__meta">{meta}</span>}
            {actions && <span className="st-msg__actions">{actions}</span>}
          </div>
        )}
      </div>
    </div>
  )
}

/** Three dots. Paired with text for anyone who cannot see the animation. */
export const Typing = ({ who = "Assistant" }: { who?: string }) => (
  <div className="st-msg st-msg--assistant">
    <div className="st-typing" aria-hidden="true"><span /><span /><span /></div>
    <span className="st-sr-only">{who} is typing</span>
  </div>
)

/** Streaming text with a caret. `done` removes the caret, nothing else. */
export const StreamingText = ({ children, done }: { children: React.ReactNode; done?: boolean }) => (
  <span className={done ? undefined : "st-stream"}>{children}</span>
)

/* -------------------------------------------------------------- composer */

export function Composer({ onSend, placeholder = "Message…", disabled, actions }: {
  onSend: (text: string) => void
  placeholder?: string
  disabled?: boolean
  actions?: React.ReactNode
}) {
  const [value, setValue] = React.useState("")
  const ref = React.useRef<HTMLTextAreaElement>(null)

  // Grow to fit, up to the CSS max-height, then scroll internally.
  const resize = React.useCallback(() => {
    const el = ref.current
    if (!el) return
    el.style.height = "auto"
    el.style.height = `${el.scrollHeight}px`
  }, [])

  React.useEffect(resize, [value, resize])

  const send = () => {
    const text = value.trim()
    if (!text || disabled) return
    onSend(text)
    setValue("")
  }

  return (
    <div className="st-composer">
      <textarea
        ref={ref}
        className="st-composer__input"
        rows={1}
        value={value}
        placeholder={placeholder}
        aria-label="Message"
        disabled={disabled}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          // Enter sends; Shift+Enter breaks the line. IME composition must be
          // left alone, or the Enter that commits a Japanese or Chinese
          // candidate would send a half-finished message.
          if (e.key === "Enter" && !e.shiftKey && !e.nativeEvent.isComposing) {
            e.preventDefault()
            send()
          }
        }}
      />
      {actions}
      <button
        type="button"
        className="st-btn st-btn--accent st-btn--icon st-btn--sm"
        onClick={send}
        disabled={disabled || !value.trim()}
        aria-label="Send message"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true">
          <path d="M8 13V3M4 7l4-4 4 4" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    </div>
  )
}

/* ----------------------------------------------------- machine detail */

export function ToolCall({ name, status = "done", children }: {
  name: string
  status?: "running" | "done" | "error"
  children?: React.ReactNode
}) {
  const [open, setOpen] = React.useState(false)
  const tone = status === "error" ? "danger" : status === "running" ? "warning" : "success"
  return (
    <div className="st-toolcall">
      <button type="button" className="st-toolcall__head" onClick={() => setOpen((o) => !o)} aria-expanded={open}>
        <span className={`st-dot st-dot--${tone}`} aria-hidden="true" />
        <span>{name}</span>
        <span className="st-sr-only">({status})</span>
        <span className="st-spacer" />
        <span aria-hidden="true">{open ? "−" : "+"}</span>
      </button>
      {open && children && <div className="st-toolcall__body">{children}</div>}
    </div>
  )
}

export const Reasoning = ({ children }: { children: React.ReactNode }) => (
  <details className="st-toolcall">
    <summary style={{ padding: "var(--st-space-s) var(--st-space-base)" }}>Reasoning</summary>
    <div className="st-toolcall__body">{children}</div>
  </details>
)

export function Citation({ n, href, source }: { n: number; href: string; source?: string }) {
  return (
    <a className="st-citation" href={href} target="_blank" rel="noopener noreferrer">
      {n}
      <span className="st-sr-only">Source {n}{source ? `: ${source}` : ""} (opens in a new tab)</span>
    </a>
  )
}

export function SuggestedPrompts({ prompts, onSelect, label = "Suggested prompts" }: {
  prompts: string[]
  onSelect: (p: string) => void
  label?: string
}) {
  return (
    <div className="st-prompts" role="group" aria-label={label}>
      {prompts.map((p) => (
        <button key={p} type="button" className="st-prompts__item" onClick={() => onSelect(p)}>
          {p}
        </button>
      ))}
    </div>
  )
}
