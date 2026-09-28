import * as fs from "node:fs";
import * as path from "node:path";

export interface TokenEvalResult {
  passed: boolean;
  score: number;
  unrecognizedColors: string[];
}

export function evaluateTokenAdherence(
  colorsUsed: string[],
  tokensFilePath = path.resolve(process.cwd(), "design-system/tokens/colors.json")
): TokenEvalResult {
  if (!fs.existsSync(tokensFilePath)) {
    return { passed: false, score: 0, unrecognizedColors: ["Archivo de tokens no encontrado."] };
  }

  const tokensData = JSON.parse(fs.readFileSync(tokensFilePath, "utf-8"));
  const approvedColors = new Set<string>();

  // Extraer todos los valores hex aprobados del archivo de tokens
  function extractColors(obj: Record<string, unknown>) {
    for (const val of Object.values(obj)) {
      if (typeof val === "string" && val.startsWith("#")) {
        approvedColors.add(val.toUpperCase());
      } else if (typeof val === "object" && val !== null) {
        extractColors(val as Record<string, unknown>);
      }
    }
  }

  extractColors(tokensData.colors);

  const unrecognizedColors: string[] = [];
  for (const color of colorsUsed) {
    const normalized = color.trim().toUpperCase();
    if (normalized.startsWith("#") && !approvedColors.has(normalized)) {
      unrecognizedColors.push(color);
    }
  }

  const score = unrecognizedColors.length === 0 ? 10 : Math.max(0, 10 - unrecognizedColors.length * 2.5);

  return {
    passed: unrecognizedColors.length === 0,
    score,
    unrecognizedColors,
  };
}

// Ejecución directa de prueba de humo
const tokensData = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), "design-system/tokens/colors.json"), "utf-8"));
const sampleColors: string[] = [];
function findSamples(obj: Record<string, unknown>) {
  for (const val of Object.values(obj)) {
    if (typeof val === "string" && val.startsWith("#") && sampleColors.length < 3) {
      sampleColors.push(val);
    } else if (typeof val === "object" && val !== null && sampleColors.length < 3) {
      findSamples(val as Record<string, unknown>);
    }
  }
}
findSamples(tokensData.colors);
const result = evaluateTokenAdherence(sampleColors);
console.log(`[Token Eval Test] Pasó: ${result.passed}, Score: ${result.score}/10`);

