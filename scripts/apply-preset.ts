import * as fs from "node:fs";
import * as path from "node:path";

interface PresetConfig {
  name: string;
  colors: {
    primary: { default: string; hover: string; subtle: string };
    background: { canvas: string; surface: string; elevated: string };
    text: { primary: string; secondary: string; muted: string; inverse: string };
    border: { subtle: string; default: string; strong: string };
    status: { success: string; warning: string; danger: string; info: string };
  };
  typography: {
    fontFamilies: { sans: string; mono: string };
    fontSizes: Record<string, string>;
    lineHeights: Record<string, string>;
    letterSpacing: Record<string, string>;
  };
  description: string;
}

const PRESETS: Record<string, PresetConfig> = {
  linear: {
    name: "Linear (Dark Mode Craftsman)",
    description: "Modo oscuro profundo, densidad técnica, bordes de baja opacidad y acento eléctrico.",
    colors: {
      primary: { default: "#5E6AD2", hover: "#6875E5", subtle: "rgba(94, 106, 210, 0.15)" },
      background: { canvas: "#08090A", surface: "#0F1011", elevated: "#161719" },
      text: { primary: "#F7F8F8", secondary: "#8A8F98", muted: "#62666D", inverse: "#08090A" },
      border: { subtle: "rgba(255, 255, 255, 0.07)", default: "rgba(255, 255, 255, 0.12)", strong: "rgba(255, 255, 255, 0.2)" },
      status: { success: "#4CB782", warning: "#F2994A", danger: "#EB5757", info: "#5E6AD2" }
    },
    typography: {
      fontFamilies: {
        sans: "Inter, Geist Sans, -apple-system, sans-serif",
        mono: "Geist Mono, ui-monospace, monospace"
      },
      fontSizes: { xs: "11px", sm: "13px", base: "14px", lg: "16px", xl: "18px", "2xl": "22px", "3xl": "28px", "4xl": "36px" },
      lineHeights: { tight: "14px", snug: "18px", normal: "20px", relaxed: "24px", loose: "28px", heading: "34px" },
      letterSpacing: { tighter: "-0.04em", tight: "-0.02em", normal: "-0.005em", wide: "0.02em", wider: "0.05em" }
    }
  },
  stripe: {
    name: "Stripe (Fintech & Clarity)",
    description: "Modo claro hiper pulido, sombras multi-stop compuestas y Blurple vibrante.",
    colors: {
      primary: { default: "#635BFF", hover: "#544DC9", subtle: "#F4F5FD" },
      background: { canvas: "#F6F9FC", surface: "#FFFFFF", elevated: "#FFFFFF" },
      text: { primary: "#0A2540", secondary: "#425466", muted: "#8898AA", inverse: "#FFFFFF" },
      border: { subtle: "#F0F3F7", default: "#E6EBF1", strong: "#CFD7DF" },
      status: { success: "#00D924", warning: "#FFC043", danger: "#DF1B41", info: "#00D4B2" }
    },
    typography: {
      fontFamilies: {
        sans: "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        mono: "ui-monospace, Menlo, Monaco, Consolas, monospace"
      },
      fontSizes: { xs: "12px", sm: "14px", base: "15px", lg: "17px", xl: "20px", "2xl": "24px", "3xl": "32px", "4xl": "40px" },
      lineHeights: { tight: "16px", snug: "20px", normal: "22px", relaxed: "26px", loose: "30px", heading: "42px" },
      letterSpacing: { tighter: "-0.03em", tight: "-0.015em", normal: "0em", wide: "0.025em", wider: "0.05em" }
    }
  },
  apple: {
    name: "Apple (HIG Precision)",
    description: "Materiales translúcidos, curvatura squircle continua y SF Blue.",
    colors: {
      primary: { default: "#0071E3", hover: "#0077ED", subtle: "#E8F2FD" },
      background: { canvas: "#F5F5F7", surface: "#FFFFFF", elevated: "rgba(255, 255, 255, 0.85)" },
      text: { primary: "#1D1D1F", secondary: "#86868B", muted: "#A1A1A6", inverse: "#FFFFFF" },
      border: { subtle: "rgba(60, 60, 67, 0.08)", default: "rgba(60, 60, 67, 0.14)", strong: "rgba(60, 60, 67, 0.25)" },
      status: { success: "#34C759", warning: "#FF9500", danger: "#FF3B30", info: "#0071E3" }
    },
    typography: {
      fontFamilies: {
        sans: "-apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', sans-serif",
        mono: "SFMono-Regular, ui-monospace, monospace"
      },
      fontSizes: { xs: "12px", sm: "13px", base: "15px", lg: "17px", xl: "20px", "2xl": "22px", "3xl": "28px", "4xl": "34px" },
      lineHeights: { tight: "16px", snug: "18px", normal: "22px", relaxed: "24px", loose: "28px", heading: "41px" },
      letterSpacing: { tighter: "-0.04em", tight: "-0.02em", normal: "-0.01em", wide: "0.01em", wider: "0.04em" }
    }
  },
  swiss: {
    name: "Swiss Style (International Typographic)",
    description: "Retícula asimétrica pura, esquinas 0px y rojo suizo de alto contraste.",
    colors: {
      primary: { default: "#0A0A0A", hover: "#262626", subtle: "#F4F4F4" },
      background: { canvas: "#FFFFFF", surface: "#F4F4F4", elevated: "#EBEBEB" },
      text: { primary: "#0A0A0A", secondary: "#4A4A4A", muted: "#737373", inverse: "#FFFFFF" },
      border: { subtle: "#E5E5E5", default: "#0A0A0A", strong: "#0A0A0A" },
      status: { success: "#0A0A0A", warning: "#D90429", danger: "#D90429", info: "#0A0A0A" }
    },
    typography: {
      fontFamilies: {
        sans: "Helvetica Neue, Helvetica, Arial, sans-serif",
        mono: "ui-monospace, monospace"
      },
      fontSizes: { xs: "11px", sm: "12px", base: "14px", lg: "16px", xl: "20px", "2xl": "28px", "3xl": "44px", "4xl": "64px" },
      lineHeights: { tight: "14px", snug: "16px", normal: "20px", relaxed: "24px", loose: "32px", heading: "58px" },
      letterSpacing: { tighter: "-0.05em", tight: "-0.03em", normal: "0em", wide: "0.1em", wider: "0.15em" }
    }
  },
  vercel: {
    name: "Vercel (Geist Design System)",
    description: "Monocromatismo estricto blanco y negro, Geist Sans y Geist Mono.",
    colors: {
      primary: { default: "#000000", hover: "#222222", subtle: "#FAFAFA" },
      background: { canvas: "#000000", surface: "#0A0A0A", elevated: "#111111" },
      text: { primary: "#FFFFFF", secondary: "#A1A1A1", muted: "#707070", inverse: "#000000" },
      border: { subtle: "#222222", default: "#333333", strong: "#444444" },
      status: { success: "#0070F3", warning: "#F5A623", danger: "#FF0000", info: "#0070F3" }
    },
    typography: {
      fontFamilies: {
        sans: "Geist Sans, -apple-system, BlinkMacSystemFont, sans-serif",
        mono: "Geist Mono, ui-monospace, monospace"
      },
      fontSizes: { xs: "12px", sm: "13px", base: "14px", lg: "16px", xl: "18px", "2xl": "20px", "3xl": "24px", "4xl": "32px" },
      lineHeights: { tight: "16px", snug: "18px", normal: "20px", relaxed: "24px", loose: "28px", heading: "36px" },
      letterSpacing: { tighter: "-0.04em", tight: "-0.02em", normal: "-0.01em", wide: "0.01em", wider: "0.03em" }
    }
  },
  bento: {
    name: "Bento Grid (Modular Modern UI)",
    description: "Cuadrícula modular asimétrica, esquinas suaves y densidad balanceada.",
    colors: {
      primary: { default: "#6366F1", hover: "#4F46E5", subtle: "rgba(99, 102, 241, 0.1)" },
      background: { canvas: "#0B0C0E", surface: "#141619", elevated: "#1B1E22" },
      text: { primary: "#F0F2F5", secondary: "#8B949E", muted: "#6B7280", inverse: "#0B0C0E" },
      border: { subtle: "rgba(255, 255, 255, 0.05)", default: "rgba(255, 255, 255, 0.08)", strong: "rgba(255, 255, 255, 0.16)" },
      status: { success: "#34D399", warning: "#FBBF24", danger: "#F87171", info: "#60A5FA" }
    },
    typography: {
      fontFamilies: {
        sans: "-apple-system, BlinkMacSystemFont, Inter, sans-serif",
        mono: "ui-monospace, monospace"
      },
      fontSizes: { xs: "11px", sm: "13px", base: "15px", lg: "17px", xl: "20px", "2xl": "24px", "3xl": "32px", "4xl": "40px" },
      lineHeights: { tight: "16px", snug: "18px", normal: "22px", relaxed: "26px", loose: "32px", heading: "44px" },
      letterSpacing: { tighter: "-0.03em", tight: "-0.02em", normal: "0em", wide: "0.05em", wider: "0.1em" }
    }
  }
};

export function applyPreset(presetKey: string) {
  const key = presetKey.toLowerCase().trim();
  const preset = PRESETS[key];
  if (!preset) {
    console.error(`\x1b[31m[ERROR]\x1b[0m Preset desconocido: "${presetKey}".`);
    console.log(`Presets disponibles: ${Object.keys(PRESETS).join(", ")}`);
    process.exit(1);
  }

  const workspaceRoot = process.cwd();
  const colorsPath = path.join(workspaceRoot, "design-system/tokens/colors.json");
  const typographyPath = path.join(workspaceRoot, "design-system/tokens/typography.json");
  const activeDesignPath = path.join(workspaceRoot, "design-system/active/DESIGN.md");

  // 1. Escribir colors.json
  const colorsContent = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    colors: preset.colors
  };
  fs.writeFileSync(colorsPath, JSON.stringify(colorsContent, null, 2) + "\n");

  // 2. Escribir typography.json
  const typographyContent = {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    typography: preset.typography
  };
  fs.writeFileSync(typographyPath, JSON.stringify(typographyContent, null, 2) + "\n");

  // 3. Escribir DESIGN.md activo
  const activeDoc = `# Sistema de Diseño Activo: ${preset.name}

${preset.description}

---

## 1. Configuración de Tokens
- **Preset Clave**: \`${key}\`
- **Fuente Sans**: \`${preset.typography.fontFamilies.sans}\`
- **Fuente Mono**: \`${preset.typography.fontFamilies.mono}\`
- **Fondo Canvas**: \`${preset.colors.background.canvas}\`
- **Fondo Superficie**: \`${preset.colors.background.surface}\`
- **Acento Primario**: \`${preset.colors.primary.default}\`
- **Texto Principal**: \`${preset.colors.text.primary}\`

---

## 2. Próximo Paso
Para aplicar estos tokens en tu canvas de Paper, ejecuta el workflow \`/sync-tokens\` o la herramienta Paper MCP \`set_tokens\`.
`;
  fs.writeFileSync(activeDesignPath, activeDoc);

  console.log(`\x1b[32m[PRESET APLICADO]\x1b[0m "${preset.name}" configurado exitosamente.`);
  console.log(`- design-system/tokens/colors.json actualizado.`);
  console.log(`- design-system/tokens/typography.json actualizado.`);
  console.log(`- design-system/active/DESIGN.md sincronizado.`);
}

// Ejecución directa por CLI si se invoca con argumentos
if (process.argv[1]?.endsWith("apply-preset.ts")) {
  const targetPreset = process.argv[2] || "linear";
  applyPreset(targetPreset);
}
