/**
 * Eval: Color Expert & WCAG Math Assertions
 * Valida la precisión matemática de:
 * - Luminancia relativa según W3C WCAG 2.1
 * - Ratio de contraste (L1 + 0.05) / (L2 + 0.05)
 * - Progresión monótona de luminancia en escalas tonales (50 a 950)
 */

import { getRelativeLuminance, getContrastRatio, generateTonalScale } from "../../scripts/color-expert.ts";

export interface ColorEvalResult {
  passed: boolean;
  score: number;
  violations: string[];
}

export function evaluateColorMath(): ColorEvalResult {
  const violations: string[] = [];

  // 1. Prueba de luminancia de extremos teóricos
  const lumWhite = getRelativeLuminance("#ffffff");
  const lumBlack = getRelativeLuminance("#000000");

  if (Math.abs(lumWhite - 1.0) > 0.001) {
    violations.push(`Luminancia de #ffffff esperada 1.0, obtenida ${lumWhite}`);
  }
  if (Math.abs(lumBlack - 0.0) > 0.001) {
    violations.push(`Luminancia de #000000 esperada 0.0, obtenida ${lumBlack}`);
  }

  // 2. Ratio blanco sobre negro: debe ser exactamente 21:1
  const maxContrast = getContrastRatio("#000000", "#ffffff");
  if (maxContrast.ratio !== 21) {
    violations.push(`Contraste #000 vs #fff esperado 21, obtenido ${maxContrast.ratio}`);
  }
  if (!maxContrast.wcagAA || !maxContrast.wcagAAA) {
    violations.push("Contraste 21:1 falló banderas WCAG AA o AAA.");
  }

  // 3. Ratio de colores idénticos: debe ser exactamente 1:1
  const identityContrast = getContrastRatio("#635bff", "#635bff");
  if (identityContrast.ratio !== 1) {
    violations.push(`Contraste idéntico esperado 1, obtenido ${identityContrast.ratio}`);
  }

  // 4. Progresión monótona de la escala tonal
  const scale = generateTonalScale("#635bff");
  const stops = [50, 100, 200, 300, 400, 500, 600, 700, 800, 900, 950] as const;
  
  let previousLum = 1.01;
  for (const stop of stops) {
    const hex = scale[stop];
    if (!hex || !/^#[0-9a-fA-F]{6}$/.test(hex)) {
      violations.push(`Escalón ${stop} no produjo un HEX válido de 6 dígitos: '${hex}'`);
      continue;
    }
    const currentLum = getRelativeLuminance(hex);
    if (currentLum > previousLum) {
      violations.push(`Violación de monotonía en escala: escalón ${stop} (${currentLum}) es más luminoso que el anterior (${previousLum})`);
    }
    previousLum = currentLum;
  }

  const score = violations.length === 0 ? 10 : Math.max(0, 10 - violations.length * 2);
  return {
    passed: violations.length === 0,
    score,
    violations
  };
}

// Ejecución
const result = evaluateColorMath();
console.log(`[Color Expert Eval Test] Pasó: ${result.passed}, Score: ${result.score}/10`);
if (result.violations.length > 0) {
  console.error("Violaciones:", result.violations);
  process.exit(1);
}
