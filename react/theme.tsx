/* Structure — theme and density providers.
 *
 * Theme and density are DOM attributes, not React context values, because the
 * CSS is the source of truth: a plain-HTML page and a React page must switch
 * the same way. The hooks below are a convenience over `data-theme` and
 * `data-density`, never a second mechanism.
 * structure-definitions — defines the vocabulary; view budgets do not apply.
 */
import * as React from "react"

export type Theme = "light" | "dark" | "system"
export type Density = "comfortable" | "compact"

type Ctx = {
  theme: Theme
  setTheme: (t: Theme) => void
  density: Density
  setDensity: (d: Density) => void
}

const ThemeContext = React.createContext<Ctx | null>(null)

export function useTheme(): Ctx {
  const ctx = React.useContext(ThemeContext)
  if (!ctx) throw new Error("useTheme must be used inside <ThemeProvider>")
  return ctx
}

export function ThemeProvider({
  children,
  defaultTheme = "system",
  defaultDensity = "comfortable",
  storageKey = "structure-theme",
}: {
  children: React.ReactNode
  defaultTheme?: Theme
  defaultDensity?: Density
  /** Set to null to opt out of persistence entirely. */
  storageKey?: string | null
}) {
  const [theme, setThemeState] = React.useState<Theme>(defaultTheme)
  const [density, setDensityState] = React.useState<Density>(defaultDensity)

  // Read persisted choice after mount, never during render — reading storage
  // in the initial state would diverge between server and client and hydrate
  // with the wrong theme.
  React.useEffect(() => {
    if (!storageKey) return
    try {
      const saved = localStorage.getItem(storageKey) as Theme | null
      if (saved === "light" || saved === "dark" || saved === "system") setThemeState(saved)
    } catch {
      /* Private mode or a blocked origin. The default stands. */
    }
  }, [storageKey])

  React.useEffect(() => {
    const el = document.documentElement
    // "system" removes the attribute so the prefers-color-scheme media query
    // in tokens.css takes over. Setting data-theme="system" would match
    // neither selector and leave the page unthemed.
    if (theme === "system") el.removeAttribute("data-theme")
    else el.setAttribute("data-theme", theme)
  }, [theme])

  React.useEffect(() => {
    document.documentElement.setAttribute("data-density", density)
  }, [density])

  const setTheme = React.useCallback(
    (t: Theme) => {
      setThemeState(t)
      if (storageKey) { try { localStorage.setItem(storageKey, t) } catch { /* ignore */ } }
    },
    [storageKey]
  )

  const value = React.useMemo(
    () => ({ theme, setTheme, density, setDensity: setDensityState }),
    [theme, setTheme, density]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

/** Cycles light -> dark -> system. Labelled, never icon-only without a name. */
export function ThemeToggle({ className = "" }: { className?: string }) {
  const { theme, setTheme } = useTheme()
  const next: Record<Theme, Theme> = { light: "dark", dark: "system", system: "light" }
  return (
    <button
      type="button"
      className={`st-btn st-btn--ghost st-btn--sm ${className}`}
      onClick={() => setTheme(next[theme])}
      aria-label={`Theme: ${theme}. Switch to ${next[theme]}.`}
    >
      {theme}
    </button>
  )
}
