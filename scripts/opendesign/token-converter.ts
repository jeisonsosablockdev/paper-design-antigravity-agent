import * as fs from "node:fs";
import * as path from "node:path";

export interface PaperColorCategory {
  default?: string;
  hover?: string;
  subtle?: string;
  canvas?: string;
  surface?: string;
  elevated?: string;
  primary?: string;
  secondary?: string;
  muted?: string;
  inverse?: string;
  strong?: string;
  success?: string;
  warning?: string;
  danger?: string;
  info?: string;
  [key: string]: string | undefined;
}

export interface PaperColors {
  primary: { default: string; hover: string; subtle: string };
  background: { canvas: string; surface: string; elevated: string };
  text: { primary: string; secondary: string; muted: string; inverse: string };
  border: { subtle: string; default: string; strong: string };
  status: { success: string; warning: string; danger: string; info: string };
  [key: string]: PaperColorCategory;
}

export interface PaperTypography {
  fontFamilies: {
    sans: string;
    mono: string;
    serif?: string;
  };
  fontSizes: Record<string, string>;
  lineHeights: Record<string, string>;
  letterSpacing: Record<string, string>;
}

export interface PaperSpacing {
  scale: Record<string, string>;
}

export interface NormalizedPaperTokens {
  colors: PaperColors;
  typography: PaperTypography;
  spacing: PaperSpacing;
}

/**
 * Normaliza valores de unidades a estándares de Paper MCP:
 * - fontSizes & lineHeights: siempre en "px"
 * - letterSpacing: siempre en "em"
 * - spacing: siempre en "px"
 */
export function normalizeUnit(val: string | number, targetUnit: "px" | "em", baseRem = 16): string {
  if (typeof val === "number") {
    return `${val}${targetUnit}`;
  }
  const clean = val.trim();
  if (targetUnit === "px") {
    if (clean.endsWith("rem")) {
      const num = parseFloat(clean);
      return `${Math.round(num * baseRem)}px`;
    }
    if (clean.endsWith("px")) {
      return clean;
    }
    const num = parseFloat(clean);
    return isNaN(num) ? "14px" : `${Math.round(num)}px`;
  }
  if (targetUnit === "em") {
    if (clean.endsWith("em")) {
      return clean;
    }
    if (clean.endsWith("px")) {
      const num = parseFloat(clean);
      return `${(num / baseRem).toFixed(3)}em`;
    }
    if (clean.endsWith("%")) {
      const num = parseFloat(clean);
      return `${(num / 100).toFixed(3)}em`;
    }
    const num = parseFloat(clean);
    return isNaN(num) ? "0em" : `${num}em`;
  }
  return String(val);
}

/**
 * Convierte tokens de OpenDesign (design-tokens.json o tokens.css)
 * al estándar tipado de Paper.Design
 */
export class OpenDesignTokenConverter {
  /**
   * Procesa un archivo o string de tokens en formato JSON (W3C tokens o clave-valor plana)
   */
  public static convertFromJson(rawJson: Record<string, any>): NormalizedPaperTokens {
    // Valores predeterminados seguros (Linear Dark Craftsman baseline)
    const result: NormalizedPaperTokens = {
      colors: {
        primary: {
          default: "#5E6AD2",
          hover: "#6875E5",
          subtle: "rgba(94, 106, 210, 0.15)"
        },
        background: {
          canvas: "#08090A",
          surface: "#0F1011",
          elevated: "#161719"
        },
        text: {
          primary: "#F7F8F8",
          secondary: "#8A8F98",
          muted: "#62666D",
          inverse: "#08090A"
        },
        border: {
          subtle: "rgba(255, 255, 255, 0.07)",
          default: "rgba(255, 255, 255, 0.12)",
          strong: "rgba(255, 255, 255, 0.2)"
        },
        status: {
          success: "#4CB782",
          warning: "#F2994A",
          danger: "#EB5757",
          info: "#5E6AD2"
        }
      },
      typography: {
        fontFamilies: {
          sans: "Inter, Geist Sans, -apple-system, sans-serif",
          mono: "Geist Mono, ui-monospace, monospace"
        },
        fontSizes: {
          xs: "11px",
          sm: "13px",
          base: "14px",
          lg: "16px",
          xl: "18px",
          "2xl": "22px",
          "3xl": "28px",
          "4xl": "36px"
        },
        lineHeights: {
          tight: "14px",
          snug: "18px",
          normal: "20px",
          relaxed: "24px",
          loose: "28px",
          heading: "34px"
        },
        letterSpacing: {
          tighter: "-0.04em",
          tight: "-0.02em",
          normal: "-0.005em",
          wide: "0.02em",
          wider: "0.05em"
        }
      },
      spacing: {
        scale: {
          "0": "0px",
          "1": "4px",
          "2": "8px",
          "3": "12px",
          "4": "16px",
          "5": "20px",
          "6": "24px",
          "8": "32px",
          "10": "40px",
          "12": "48px",
          "16": "64px"
        }
      }
    };

    const flat = this.flattenObject(rawJson);

    // Mapeo inteligente de colores
    for (const [key, value] of Object.entries(flat)) {
      if (typeof value !== "string") continue;
      const lowerKey = key.toLowerCase();

      // Primary
      if (lowerKey.includes("primary") || lowerKey.includes("brand")) {
        if (lowerKey.includes("hover") || lowerKey.includes("600")) {
          result.colors.primary.hover = value;
        } else if (lowerKey.includes("subtle") || lowerKey.includes("100") || lowerKey.includes("50")) {
          result.colors.primary.subtle = value;
        } else if (!lowerKey.includes("foreground") && !lowerKey.includes("text")) {
          result.colors.primary.default = value;
        }
      }

      // Backgrounds
      if (lowerKey.includes("background") || lowerKey.includes("bg") || lowerKey.includes("surface")) {
        if (lowerKey.includes("canvas") || lowerKey.includes("base") || lowerKey.includes("page")) {
          result.colors.background.canvas = value;
        } else if (lowerKey.includes("elevated") || lowerKey.includes("card") || lowerKey.includes("popover")) {
          result.colors.background.elevated = value;
        } else if (!lowerKey.includes("text")) {
          result.colors.background.surface = value;
        }
      }

      // Text
      if (lowerKey.includes("text") || lowerKey.includes("foreground") || lowerKey.includes("content")) {
        if (lowerKey.includes("secondary") || lowerKey.includes("subtle") || lowerKey.includes("light")) {
          result.colors.text.secondary = value;
        } else if (lowerKey.includes("muted") || lowerKey.includes("tertiary")) {
          result.colors.text.muted = value;
        } else if (lowerKey.includes("inverse") || lowerKey.includes("contrast")) {
          result.colors.text.inverse = value;
        } else {
          result.colors.text.primary = value;
        }
      }

      // Border
      if (lowerKey.includes("border") || lowerKey.includes("divider") || lowerKey.includes("stroke")) {
        if (lowerKey.includes("subtle") || lowerKey.includes("light")) {
          result.colors.border.subtle = value;
        } else if (lowerKey.includes("strong") || lowerKey.includes("bold") || lowerKey.includes("focus")) {
          result.colors.border.strong = value;
        } else {
          result.colors.border.default = value;
        }
      }

      // Font Families
      if (lowerKey.includes("font") && lowerKey.includes("sans")) {
        result.typography.fontFamilies.sans = value;
      }
      if (lowerKey.includes("font") && lowerKey.includes("mono")) {
        result.typography.fontFamilies.mono = value;
      }

      // Font Sizes
      if (lowerKey.includes("fontsize") || lowerKey.includes("font-size") || lowerKey.includes("text-size")) {
        const parts = lowerKey.split(/[.-]/).filter(Boolean);
        const sizeName = parts.pop() || "";
        if (sizeName) {
          result.typography.fontSizes[sizeName] = normalizeUnit(value, "px");
        }
      }

      // Line Heights
      if (lowerKey.includes("lineheight") || lowerKey.includes("line-height") || lowerKey.includes("leading")) {
        const parts = lowerKey.split(/[.-]/).filter(Boolean);
        const lhName = parts.pop() || "";
        if (lhName) {
          result.typography.lineHeights[lhName] = normalizeUnit(value, "px");
        }
      }

      // Letter Spacing
      if (lowerKey.includes("letterspacing") || lowerKey.includes("letter-spacing") || lowerKey.includes("tracking")) {
        const parts = lowerKey.split(/[.-]/).filter(Boolean);
        const lsName = parts.pop() || "";
        if (lsName) {
          result.typography.letterSpacing[lsName] = normalizeUnit(value, "em");
        }
      }
    }

    return result;
  }

  /**
   * Extrae variables CSS (:root { --... }) y las convierte a tokens de Paper
   */
  public static convertFromCss(cssContent: string): NormalizedPaperTokens {
    const cssVars: Record<string, string> = {};
    const varRegex = /--([a-zA-Z0-9_-]+)\s*:\s*([^;]+);/g;
    let match;
    while ((match = varRegex.exec(cssContent)) !== null) {
      cssVars[match[1]] = match[2].trim();
    }
    return this.convertFromJson(cssVars);
  }

  /**
   * Genera un mapa plano para inyectar directamente en Paper MCP con `set_tokens`
   */
  public static toPaperMcpTokens(tokens: NormalizedPaperTokens): Record<string, string> {
    const mcpTokens: Record<string, string> = {};

    for (const [catKey, catVal] of Object.entries(tokens.colors)) {
      for (const [subKey, val] of Object.entries(catVal)) {
        if (val) mcpTokens[`colors.${catKey}.${subKey}`] = val;
      }
    }

    for (const [fontKey, fontVal] of Object.entries(tokens.typography.fontFamilies)) {
      if (fontVal) mcpTokens[`typography.fontFamilies.${fontKey}`] = fontVal;
    }

    for (const [sizeKey, sizeVal] of Object.entries(tokens.typography.fontSizes)) {
      mcpTokens[`typography.fontSizes.${sizeKey}`] = sizeVal;
    }

    for (const [lhKey, lhVal] of Object.entries(tokens.typography.lineHeights)) {
      mcpTokens[`typography.lineHeights.${lhKey}`] = lhVal;
    }

    for (const [lsKey, lsVal] of Object.entries(tokens.typography.letterSpacing)) {
      mcpTokens[`typography.letterSpacing.${lsKey}`] = lsVal;
    }

    for (const [spKey, spVal] of Object.entries(tokens.spacing.scale)) {
      mcpTokens[`spacing.scale.${spKey}`] = spVal;
    }

    return mcpTokens;
  }

  private static flattenObject(obj: Record<string, any>, prefix = ""): Record<string, any> {
    const flattened: Record<string, any> = {};
    for (const [key, val] of Object.entries(obj)) {
      const fullKey = prefix ? `${prefix}.${key}` : key;
      if (val && typeof val === "object" && !Array.isArray(val)) {
        // Soporte para formato W3C design token: { value: "#123", type: "color" }
        if ("value" in val && typeof val.value !== "object") {
          flattened[fullKey] = String(val.value);
        } else {
          Object.assign(flattened, this.flattenObject(val, fullKey));
        }
      } else {
        flattened[fullKey] = val;
      }
    }
    return flattened;
  }
}
