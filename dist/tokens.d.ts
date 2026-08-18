/* Structure — the Kwapso design language.
 * GENERATED FILE. Do not edit by hand: edit tokens/tokens.json and run
 * `npm run build:tokens`. Source of truth measured from https://kwapso.com.
 * 
 */
declare const tokens: {
  readonly color: {
    readonly ink: "#191817"
    readonly paper: "#fffdf8"
    readonly sand: "#f7f2eb"
    readonly mango: "#ffd066"
    readonly sky: "#89bce5"
    readonly forest: "#1d9159"
    readonly poppy: "#ea4832"
    readonly grey: "#bab8b4"
    readonly "ink-10": "rgba(25, 24, 23, 0.10)"
    readonly "ink-15": "rgba(25, 24, 23, 0.15)"
    readonly "ink-30": "rgba(25, 24, 23, 0.30)"
    readonly "ink-50": "rgba(25, 24, 23, 0.50)"
    readonly "ink-65": "rgba(25, 24, 23, 0.65)"
    readonly "mango-deep": "#e8b244"
    readonly "sky-deep": "#6489a7"
  }
  readonly semantic: {
    readonly light: {
      readonly background: "#fffdf8"
      readonly foreground: "#191817"
      readonly surface: "#f7f2eb"
      readonly "surface-foreground": "#191817"
      readonly raised: "#fffdf8"
      readonly muted: "rgba(25, 24, 23, 0.65)"
      readonly accent: "#ffd066"
      readonly "accent-hover": "#e8b244"
      readonly "accent-foreground": "#191817"
      readonly border: "rgba(25, 24, 23, 0.15)"
      readonly "border-control": "rgba(25, 24, 23, 0.50)"
      readonly divider: "rgba(25, 24, 23, 0.10)"
      readonly ring: "rgba(25, 24, 23, 0.50)"
      readonly placeholder: "rgba(25, 24, 23, 0.50)"
      readonly "chart-stroke": "rgba(25, 24, 23, 0.65)"
      readonly disabled: "#bab8b4"
      readonly info: "#6489a7"
      readonly success: "#1d9159"
      readonly danger: "#ea4832"
      readonly warning: "#e8b244"
    }
    readonly dark: {
      readonly background: "#191817"
      readonly foreground: "#fffdf8"
      readonly surface: "#232120"
      readonly "surface-foreground": "#fffdf8"
      readonly raised: "#2c2a28"
      readonly muted: "rgba(255, 253, 248, 0.60)"
      readonly accent: "#ffd066"
      readonly "accent-hover": "#ffdd8a"
      readonly "accent-foreground": "#191817"
      readonly border: "rgba(255, 253, 248, 0.15)"
      readonly "border-control": "rgba(255, 253, 248, 0.45)"
      readonly divider: "rgba(255, 253, 248, 0.10)"
      readonly ring: "rgba(255, 253, 248, 0.45)"
      readonly placeholder: "rgba(255, 253, 248, 0.40)"
      readonly "chart-stroke": "rgba(255, 253, 248, 0.55)"
      readonly disabled: "rgba(255, 253, 248, 0.35)"
      readonly info: "#89bce5"
      readonly success: "#2eb673"
      readonly danger: "#f26350"
      readonly warning: "#e8b244"
    }
  }
  readonly chart: {
    readonly "1": "#ffd066"
    readonly "2": "#89bce5"
    readonly "3": "#1d9159"
    readonly "4": "#ea4832"
    readonly "5": "#bab8b4"
    readonly "6": "#e8b244"
    readonly "stroke-width": "1px"
  }
  readonly font: {
    readonly display: "\"Serrif Condensed\", \"Serrifcondensed\", \"Playfair Display\", \"Times New Roman\", serif"
    readonly sans: "\"Saans\", \"Inter\", -apple-system, BlinkMacSystemFont, \"Segoe UI\", Arial, sans-serif"
    readonly mono: "\"SF Mono\", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace"
  }
  readonly weight: {
    readonly light: 300
    readonly medium: 500
  }
  readonly text: {
    readonly "2xs": {
      readonly size: "0.675rem"
      readonly lineHeight: "1.1"
      readonly px: 10.8
    }
    readonly xs: {
      readonly size: "0.75rem"
      readonly lineHeight: "1.5"
      readonly px: 12
    }
    readonly sm: {
      readonly size: "0.9rem"
      readonly lineHeight: "1.5"
      readonly px: 14.4
    }
    readonly base: {
      readonly size: "1rem"
      readonly lineHeight: "1.5"
      readonly px: 16
    }
    readonly md: {
      readonly size: "1.125rem"
      readonly lineHeight: "1.5"
      readonly px: 18
    }
    readonly lg: {
      readonly size: "1.25rem"
      readonly lineHeight: "1.5"
      readonly px: 20
    }
    readonly xl: {
      readonly size: "1.8rem"
      readonly lineHeight: "1.2"
      readonly px: 28.8
    }
    readonly "2xl": {
      readonly size: "2.925rem"
      readonly lineHeight: "1.0"
      readonly px: 46.8
    }
    readonly "3xl": {
      readonly size: "4.77rem"
      readonly lineHeight: "1.05"
      readonly px: 76.3
    }
    readonly "4xl": {
      readonly size: "6.75rem"
      readonly lineHeight: "0.8"
      readonly px: 108
    }
  }
  readonly tracking: {
    readonly normal: "0"
    readonly wide: "0.5px"
    readonly wider: "1px"
  }
  readonly space: {
    readonly "0": "0"
    readonly xs: "5px"
    readonly s: "10px"
    readonly base: "20px"
    readonly m: "40px"
    readonly l: "60px"
    readonly xl: "80px"
    readonly "2xl": "100px"
    readonly section: "150px"
  }
  readonly radius: {
    readonly none: "0"
    readonly surface: "10px"
    readonly pill: "50px"
    readonly circle: "50%"
  }
  readonly motion: {
    readonly ease: "cubic-bezier(0.645, 0.045, 0.355, 1)"
    readonly "ease-entrance": "cubic-bezier(0.16, 1, 0.3, 1)"
    readonly stagger: "45ms"
    readonly "stagger-max": "8"
    readonly rise: "10px"
    readonly press: "0.97"
    readonly fast: "120ms"
    readonly base: "200ms"
    readonly slow: "400ms"
    readonly reveal: "360ms"
    readonly "max-allowed": "400ms"
  }
  readonly layout: {
    readonly measure: "950px"
    readonly frame: "1920px"
    readonly gutter: "20px"
    readonly "gutter-wide": "60px"
  }
  readonly control: {
    readonly height: "44px"
    readonly "height-sm": "36px"
    readonly "height-lg": "52px"
    readonly "padding-x": "24px"
    readonly "min-touch": "44px"
  }
  readonly z: {
    readonly base: 0
    readonly sticky: 100
    readonly overlay: 200
    readonly modal: 300
    readonly toast: 400
  }
  readonly cognitive: {
    readonly "max-accents-per-view": 1
    readonly "max-type-sizes-per-view": 3
    readonly "max-items-per-group": 7
    readonly "max-shadow-optouts-per-view": 2
    readonly "max-motion-duration-ms": 400
    readonly "max-primary-actions-per-view": 1
    readonly "min-touch-target-px": 44
    readonly "min-contrast-body": 4.5
    readonly "min-contrast-large": 3
  }
}

export { tokens }
export default tokens
