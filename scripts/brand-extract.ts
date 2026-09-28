import * as fs from "node:fs";
import * as path from "node:path";
import { getContrastRatio, generateTonalScale } from "./color-expert.ts";

export interface ExtractedBrand {
  name: string;
  archetype: "Technical SaaS" | "Fintech & Clarity" | "Human Centered" | "Swiss & Editorial" | "Modern Bento" | "Custom";
  colors: {
    background: string;
    surface: string;
    border: string;
    textPrimary: string;
    textSecondary: string;
    accent: string;
  };
  typography: {
    primaryFont: string;
    monoFont: string;
  };
  radii: {
    sm: string;
    md: string;
    lg: string;
  };
}

// Extrae colores en formato HEX (#fff, #ffffff, #ffffffff) de un texto o CSS
export function extractHexColors(input: string): string[] {
  const hexRegex = /#(?:[0-9a-fA-F]{3,4}){1,2}\b/g;
  const matches = input.match(hexRegex) || [];
  return Array.from(new Set(matches.map(h => h.toLowerCase())));
}

// Extrae variables CSS (--...) de un texto o CSS
export function extractCssVariables(css: string): Record<string, string> {
  const varRegex = /--([a-zA-Z0-9-_]+)\s*:\s*([^;]+);/g;
  const vars: Record<string, string> = {};
  let match;
  while ((match = varRegex.exec(css)) !== null) {
    vars[`--${match[1]}`] = match[2].trim();
  }
  return vars;
}

// Detecta el arquetipo estético basado en colores y radios
export function inferArchetype(bg: string, accent: string, radius: number): ExtractedBrand["archetype"] {
  const isDark = bg.toLowerCase() === "#000000" || bg.toLowerCase() === "#08090a" || bg.toLowerCase().startsWith("#1");
  if (radius === 0) return "Swiss & Editorial";
  if (isDark && radius <= 8) return "Technical SaaS";
  if (!isDark && (radius >= 14 || bg.includes("f5f5f7"))) return "Human Centered";
  if (!isDark && accent.toLowerCase().includes("635b") || bg.includes("f6f9fc")) return "Fintech & Clarity";
  if (radius >= 16) return "Modern Bento";
  return "Custom";
}

// Sintetizador de Marca a partir de input de texto o CSS
export function extractBrandFromContent(content: string, brandName = "Extracted Brand"): ExtractedBrand {
  const cssVars = extractCssVariables(content);
  const hexes = extractHexColors(content);

  // Colores por defecto si no se encuentran
  const bg = cssVars["--background"] || cssVars["--bg"] || hexes[0] || "#ffffff";
  const text = cssVars["--foreground"] || cssVars["--text"] || hexes[1] || "#0a0a0a";
  const accent = cssVars["--primary"] || cssVars["--accent"] || hexes[2] || "#2563eb";
  const border = cssVars["--border"] || (bg === "#ffffff" ? "#e5e7eb" : "rgba(255, 255, 255, 0.1)");

  // Tipografía
  const primaryFont = cssVars["--font-sans"] || cssVars["--font-family"] || "Inter, sans-serif";
  const monoFont = cssVars["--font-mono"] || "ui-monospace, monospace";

  // Radios
  const radiusVal = parseInt(cssVars["--radius"] || "8", 10) || 8;
  const archetype = inferArchetype(bg, accent, radiusVal);

  return {
    name: brandName,
    archetype,
    colors: {
      background: bg,
      surface: bg === "#ffffff" ? "#f9fafb" : "#121417",
      border,
      textPrimary: text,
      textSecondary: bg === "#ffffff" ? "#6b7280" : "#9ca3af",
      accent
    },
    typography: {
      primaryFont,
      monoFont
    },
    radii: {
      sm: `${Math.max(2, radiusVal - 4)}px`,
      md: `${radiusVal}px`,
      lg: `${radiusVal + 4}px`
    }
  };
}

// Guarda la marca extraída en el sistema de diseño local
export function saveExtractedBrand(brand: ExtractedBrand) {
  const workspaceRoot = process.cwd();
  const colorsPath = path.join(workspaceRoot, "design-system/tokens/colors.json");
  const typographyPath = path.join(workspaceRoot, "design-system/tokens/typography.json");

  // Escala para el color de acento
  const accentScale = generateTonalScale(brand.colors.accent);

  const colorsData = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    colors: {
      primary: {
        default: brand.colors.accent,
        hover: accentScale[600] || brand.colors.accent,
        subtle: accentScale[50] || "#eff6ff"
      },
      background: {
        canvas: brand.colors.background,
        surface: brand.colors.surface,
        elevated: brand.colors.surface
      },
      text: {
        primary: brand.colors.textPrimary,
        secondary: brand.colors.textSecondary,
        muted: brand.colors.textSecondary,
        inverse: brand.colors.background
      },
      border: {
        subtle: brand.colors.border,
        default: brand.colors.border,
        strong: brand.colors.textSecondary
      },
      status: {
        success: "#16a34a",
        warning: "#f59e0b",
        danger: "#dc2626",
        info: brand.colors.accent
      }
    }
  };

  fs.writeFileSync(colorsPath, JSON.stringify(colorsData, null, 2) + "\n");
  console.log(`\x1b[32m[BRAND EXTRACTED]\x1b[0m Marca "${brand.name}" sintetizada.`);
  console.log(`- Arquetipo: ${brand.archetype}`);
  console.log(`- Fondo: ${brand.colors.background} | Acento: ${brand.colors.accent}`);
  console.log(`- Tokens guardados en: design-system/tokens/colors.json`);
}

// CLI Execution
if (process.argv[1]?.endsWith("brand-extract.ts")) {
  const sampleCss = process.argv[2] || `
    :root {
      --background: #0f172a;
      --foreground: #f8fafc;
      --primary: #38bdf8;
      --border: rgba(255, 255, 255, 0.1);
      --radius: 8px;
      --font-sans: 'Inter', sans-serif;
    }
  `;
  const brandName = process.argv[3] || "Sample Brand";
  const brand = extractBrandFromContent(sampleCss, brandName);
  saveExtractedBrand(brand);
}
