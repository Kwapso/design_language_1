/* Structure — the Kwapso design language.
 * GENERATED FILE. Do not edit by hand: edit tokens/tokens.json and run
 * `npm run build:tokens`. Source of truth measured from https://kwapso.com.
 * Usage: `presets: [require('@kwapso/structure/dist/tailwind-preset')]` (v3), or `@import` tokens.css and use the CSS variables directly (v4).
 */
module.exports = {
  "theme": {
    "extend": {
      "colors": {
        "ink": "#191817",
        "paper": "#fffdf8",
        "sand": "#f7f2eb",
        "mango": "#ffd066",
        "sky": "#89bce5",
        "forest": "#1d9159",
        "poppy": "#ea4832",
        "grey": "#bab8b4",
        "ink-10": "rgba(25, 24, 23, 0.10)",
        "ink-15": "rgba(25, 24, 23, 0.15)",
        "ink-30": "rgba(25, 24, 23, 0.30)",
        "ink-50": "rgba(25, 24, 23, 0.50)",
        "ink-65": "rgba(25, 24, 23, 0.65)",
        "mango-deep": "#e8b244",
        "sky-deep": "#6489a7",
        "background": "var(--st-background)",
        "foreground": "var(--st-foreground)",
        "surface": "var(--st-surface)",
        "raised": "var(--st-raised)",
        "muted": "var(--st-muted)",
        "accent": "var(--st-accent)",
        "accent-foreground": "var(--st-accent-foreground)",
        "border": "var(--st-border)",
        "divider": "var(--st-divider)",
        "ring": "var(--st-ring)",
        "info": "var(--st-info)",
        "success": "var(--st-success)",
        "danger": "var(--st-danger)",
        "warning": "var(--st-warning)",
        "chart": {
          "1": "#ffd066",
          "2": "#89bce5",
          "3": "#1d9159",
          "4": "#ea4832",
          "5": "#bab8b4",
          "6": "#e8b244",
          "stroke-width": "1px"
        }
      },
      "fontFamily": {
        "display": [
          "Serrif Condensed",
          "Serrifcondensed",
          "Playfair Display",
          "Times New Roman",
          "serif"
        ],
        "sans": [
          "Saans",
          "Inter",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Arial",
          "sans-serif"
        ],
        "mono": [
          "SF Mono",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "Consolas",
          "monospace"
        ]
      },
      "fontSize": {
        "2xs": [
          "0.675rem",
          {
            "lineHeight": "1.1"
          }
        ],
        "xs": [
          "0.75rem",
          {
            "lineHeight": "1.5"
          }
        ],
        "sm": [
          "0.9rem",
          {
            "lineHeight": "1.5"
          }
        ],
        "base": [
          "1rem",
          {
            "lineHeight": "1.5"
          }
        ],
        "md": [
          "1.125rem",
          {
            "lineHeight": "1.5"
          }
        ],
        "lg": [
          "1.25rem",
          {
            "lineHeight": "1.5"
          }
        ],
        "xl": [
          "1.8rem",
          {
            "lineHeight": "1.2"
          }
        ],
        "2xl": [
          "2.925rem",
          {
            "lineHeight": "1.0"
          }
        ],
        "3xl": [
          "4.77rem",
          {
            "lineHeight": "1.05"
          }
        ],
        "4xl": [
          "6.75rem",
          {
            "lineHeight": "0.8"
          }
        ]
      },
      "fontWeight": {
        "light": "300",
        "medium": "500"
      },
      "letterSpacing": {
        "normal": "0",
        "wide": "0.5px",
        "wider": "1px"
      },
      "spacing": {
        "0": "0",
        "xs": "5px",
        "s": "10px",
        "base": "20px",
        "m": "40px",
        "l": "60px",
        "xl": "80px",
        "2xl": "100px",
        "section": "150px"
      },
      "borderRadius": {
        "none": "0",
        "surface": "10px",
        "pill": "50px",
        "circle": "50%"
      },
      "borderWidth": {
        "hairline": "1px",
        "accent": "2px"
      },
      "boxShadow": {
        "none": "none",
        "overlay": "0 4px 16px rgba(25, 24, 23, 0.08)"
      },
      "transitionTimingFunction": {
        "st": "cubic-bezier(0.645, 0.045, 0.355, 1)"
      },
      "transitionDuration": {
        "fast": "120ms",
        "base": "200ms",
        "slow": "400ms"
      },
      "maxWidth": {
        "measure": "950px",
        "frame": "1920px"
      },
      "zIndex": {
        "base": "0",
        "sticky": "100",
        "overlay": "200",
        "modal": "300",
        "toast": "400"
      }
    }
  }
}
