/* Structure — the Kwapso design language.
 * GENERATED FILE. Do not edit by hand: edit tokens/tokens.json and run
 * `npm run build:tokens`. Source of truth measured from https://kwapso.com.
 * 
 */
export const tokens = {
  "color": {
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
    "sky-deep": "#6489a7"
  },
  "semantic": {
    "light": {
      "background": "#fffdf8",
      "foreground": "#191817",
      "surface": "#f7f2eb",
      "surface-foreground": "#191817",
      "raised": "#fffdf8",
      "muted": "rgba(25, 24, 23, 0.65)",
      "accent": "#ffd066",
      "accent-hover": "#e8b244",
      "accent-foreground": "#191817",
      "border": "rgba(25, 24, 23, 0.15)",
      "border-control": "rgba(25, 24, 23, 0.50)",
      "divider": "rgba(25, 24, 23, 0.10)",
      "ring": "rgba(25, 24, 23, 0.50)",
      "placeholder": "rgba(25, 24, 23, 0.50)",
      "chart-stroke": "rgba(25, 24, 23, 0.65)",
      "disabled": "#bab8b4",
      "info": "#6489a7",
      "success": "#1d9159",
      "danger": "#ea4832",
      "warning": "#e8b244"
    },
    "dark": {
      "background": "#191817",
      "foreground": "#fffdf8",
      "surface": "#232120",
      "surface-foreground": "#fffdf8",
      "raised": "#2c2a28",
      "muted": "rgba(255, 253, 248, 0.60)",
      "accent": "#ffd066",
      "accent-hover": "#ffdd8a",
      "accent-foreground": "#191817",
      "border": "rgba(255, 253, 248, 0.15)",
      "border-control": "rgba(255, 253, 248, 0.45)",
      "divider": "rgba(255, 253, 248, 0.10)",
      "ring": "rgba(255, 253, 248, 0.45)",
      "placeholder": "rgba(255, 253, 248, 0.40)",
      "chart-stroke": "rgba(255, 253, 248, 0.55)",
      "disabled": "rgba(255, 253, 248, 0.35)",
      "info": "#89bce5",
      "success": "#2eb673",
      "danger": "#f26350",
      "warning": "#e8b244"
    }
  },
  "chart": {
    "1": "#ffd066",
    "2": "#89bce5",
    "3": "#1d9159",
    "4": "#ea4832",
    "5": "#bab8b4",
    "6": "#e8b244",
    "stroke-width": "1px"
  },
  "font": {
    "display": "\"Serrif Condensed\", \"Serrifcondensed\", \"Playfair Display\", \"Times New Roman\", serif",
    "sans": "\"Saans\", \"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Arial, sans-serif",
    "mono": "\"SF Mono\", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
  },
  "weight": {
    "light": 300,
    "medium": 500
  },
  "text": {
    "2xs": {
      "size": "0.675rem",
      "lineHeight": "1.1",
      "px": 10.8
    },
    "xs": {
      "size": "0.75rem",
      "lineHeight": "1.5",
      "px": 12
    },
    "sm": {
      "size": "0.9rem",
      "lineHeight": "1.5",
      "px": 14.4
    },
    "base": {
      "size": "1rem",
      "lineHeight": "1.5",
      "px": 16
    },
    "md": {
      "size": "1.125rem",
      "lineHeight": "1.5",
      "px": 18
    },
    "lg": {
      "size": "1.25rem",
      "lineHeight": "1.5",
      "px": 20
    },
    "xl": {
      "size": "1.8rem",
      "lineHeight": "1.2",
      "px": 28.8
    },
    "2xl": {
      "size": "2.925rem",
      "lineHeight": "1.0",
      "px": 46.8
    },
    "3xl": {
      "size": "4.77rem",
      "lineHeight": "1.05",
      "px": 76.3
    },
    "4xl": {
      "size": "6.75rem",
      "lineHeight": "0.8",
      "px": 108
    }
  },
  "tracking": {
    "normal": "0",
    "wide": "0.5px",
    "wider": "1px"
  },
  "space": {
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
  "radius": {
    "none": "0",
    "surface": "10px",
    "pill": "50px",
    "circle": "50%"
  },
  "motion": {
    "ease": "cubic-bezier(0.645, 0.045, 0.355, 1)",
    "ease-entrance": "cubic-bezier(0.16, 1, 0.3, 1)",
    "stagger": "45ms",
    "stagger-max": "8",
    "rise": "10px",
    "press": "0.97",
    "fast": "120ms",
    "base": "200ms",
    "slow": "400ms",
    "reveal": "360ms",
    "max-allowed": "400ms"
  },
  "layout": {
    "measure": "950px",
    "frame": "1920px",
    "gutter": "20px",
    "gutter-wide": "60px"
  },
  "control": {
    "height": "44px",
    "height-sm": "36px",
    "height-lg": "52px",
    "padding-x": "24px",
    "min-touch": "44px"
  },
  "z": {
    "base": 0,
    "sticky": 100,
    "overlay": 200,
    "modal": 300,
    "toast": 400
  },
  "cognitive": {
    "max-accents-per-view": 1,
    "max-type-sizes-per-view": 3,
    "max-items-per-group": 7,
    "max-shadow-optouts-per-view": 2,
    "max-motion-duration-ms": 400,
    "max-primary-actions-per-view": 1,
    "min-touch-target-px": 44,
    "min-contrast-body": 4.5,
    "min-contrast-large": 3
  }
}

export default tokens
