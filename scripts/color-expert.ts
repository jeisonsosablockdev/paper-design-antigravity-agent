export interface ColorScale {
  50: string;
  100: string;
  200: string;
  300: string;
  400: string;
  500: string;
  600: string;
  700: string;
  800: string;
  900: string;
  950: string;
}

export interface ContrastResult {
  ratio: number;
  wcagAA: boolean;
  wcagAAA: boolean;
  wcagLargeAA: boolean;
  wcagLargeAAA: boolean;
}

// Convertir HEX a RGB
export function hexToRgb(hex: string): { r: number; g: number; b: number } {
  let cleaned = hex.replace("#", "").trim();
  if (cleaned.length === 3) {
    cleaned = cleaned.split("").map(c => c + c).join("");
  }
  const num = parseInt(cleaned, 16);
  return {
    r: (num >> 16) & 255,
    g: (num >> 8) & 255,
    b: num & 255
  };
}

// Convertir RGB a HEX
export function rgbToHex(r: number, g: number, b: number): string {
  const clamp = (val: number) => Math.max(0, Math.min(255, Math.round(val)));
  const toHex = (val: number) => clamp(val).toString(16).padStart(2, "0");
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

// Convertir RGB a HSL
export function rgbToHsl(r: number, g: number, b: number): { h: number; s: number; l: number } {
  r /= 255;
  g /= 255;
  b /= 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r:
        h = (g - b) / d + (g < b ? 6 : 0);
        break;
      case g:
        h = (b - r) / d + 2;
        break;
      case b:
        h = (r - g) / d + 4;
        break;
    }
    h /= 6;
  }
  return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
}

// Convertir HSL a RGB
export function hslToRgb(h: number, s: number, l: number): { r: number; g: number; b: number } {
  h /= 360;
  s /= 100;
  l /= 100;

  let r: number, g: number, b: number;
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / 6) return p + (q - p) * 6 * t;
      if (t < 1 / 2) return q;
      if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
      return p;
    };
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    r = hue2rgb(p, q, h + 1 / 3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1 / 3);
  }
  return { r: r * 255, g: g * 255, b: b * 255 };
}

// Luminancia Relativa Oficial W3C WCAG 2.1
export function getRelativeLuminance(hex: string): number {
  const { r, g, b } = hexToRgb(hex);
  const transform = (val: number) => {
    const s = val / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  const R = transform(r);
  const G = transform(g);
  const B = transform(b);
  return 0.2126 * R + 0.7152 * G + 0.0722 * B;
}

// Ratio de Contraste WCAG: (L1 + 0.05) / (L2 + 0.05)
export function getContrastRatio(foreground: string, background: string): ContrastResult {
  const lum1 = getRelativeLuminance(foreground);
  const lum2 = getRelativeLuminance(background);
  const brightest = Math.max(lum1, lum2);
  const darkest = Math.min(lum1, lum2);
  const ratio = Number(((brightest + 0.05) / (darkest + 0.05)).toFixed(2));

  return {
    ratio,
    wcagAA: ratio >= 4.5,
    wcagAAA: ratio >= 7.0,
    wcagLargeAA: ratio >= 3.0,
    wcagLargeAAA: ratio >= 4.5
  };
}

// Generador de Escala Tonal Perceptual (50 - 950)
export function generateTonalScale(seedHex: string): ColorScale {
  const { r, g, b } = hexToRgb(seedHex);
  const { h, s } = rgbToHsl(r, g, b);

  // Mapeo perceptual de luminancias objetivo para cada escalón
  const targetLightness: Record<keyof ColorScale, number> = {
    50: 97,
    100: 93,
    200: 85,
    300: 74,
    400: 62,
    500: 50,
    600: 40,
    700: 30,
    800: 20,
    900: 13,
    950: 8
  };

  const scale: Partial<ColorScale> = {};
  for (const [stop, l] of Object.entries(targetLightness)) {
    // Atenuar saturación en extremos muy claros o muy oscuros para evitar fluorescencia
    const adjustedSaturation = l > 90 ? Math.round(s * 0.7) : l < 15 ? Math.round(s * 0.8) : s;
    const rgb = hslToRgb(h, adjustedSaturation, l);
    scale[Number(stop) as keyof ColorScale] = rgbToHex(rgb.r, rgb.g, rgb.b);
  }

  // Preservar exactamente el seedHex en el escalón 500 más cercano si se prefiere
  return scale as ColorScale;
}

// Payload para Paper MCP create_tokens
export function exportToPaperTokens(name: string, scale: ColorScale) {
  return Object.entries(scale).map(([stop, hex]) => ({
    name: `color/${name}/${stop}`,
    value: hex,
    type: "color"
  }));
}

// CLI Execution
if (process.argv[1]?.endsWith("color-expert.ts")) {
  const inputHex = process.argv[2] || "#635bff";
  const bgHex = process.argv[3] || "#ffffff";
  console.log(`\n\x1b[36m[COLOR EXPERT]\x1b[0m Generando escala para: ${inputHex}`);

  const scale = generateTonalScale(inputHex);
  console.log("\nEscala Tonal Generada (50-950):");
  for (const [stop, hex] of Object.entries(scale)) {
    const contrastOnWhite = getContrastRatio(hex, "#ffffff").ratio;
    const contrastOnDark = getContrastRatio(hex, "#08090a").ratio;
    console.log(`  ${stop.padEnd(4)}: ${hex}  (vs #fff: ${contrastOnWhite}:1 | vs #080: ${contrastOnDark}:1)`);
  }

  const contrast = getContrastRatio(inputHex, bgHex);
  console.log(`\nContraste ${inputHex} sobre ${bgHex}: ${contrast.ratio}:1`);
  console.log(`  - WCAG AA (Texto Normal >= 4.5): ${contrast.wcagAA ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  - WCAG AAA (Texto Normal >= 7.0): ${contrast.wcagAAA ? "✅ PASS" : "❌ FAIL"}`);
  console.log(`  - WCAG UI / Large Text (>= 3.0): ${contrast.wcagLargeAA ? "✅ PASS" : "❌ FAIL"}`);
}
