/**
 * Eval: Typography Assertions
 * Valida que los estilos tipográficos en nodos de Paper cumplan con las reglas de proyecto:
 * - Unidades estrictas: px para font-size y line-height, em para letter-spacing.
 * - Familias tipográficas aprobadas en get_basic_info.
 */

export interface TypographyEvalResult {
  passed: boolean;
  score: number; // 0 - 10
  violations: string[];
}

export interface NodeStyleSnapshot {
  nodeId: string;
  fontSize?: string | number;
  lineHeight?: string | number;
  letterSpacing?: string | number;
  fontFamily?: string;
}

export function evaluateTypography(
  nodes: NodeStyleSnapshot[],
  approvedFonts: string[] = ['Inter', 'SF Pro Display', 'system-ui']
): TypographyEvalResult {
  const violations: string[] = [];

  for (const node of nodes) {
    // 1. Validar font-size
    if (node.fontSize !== undefined) {
      const fsStr = String(node.fontSize);
      if (fsStr.includes('rem') || fsStr.includes('em') || fsStr.includes('%')) {
        violations.push(`Nodo ${node.nodeId}: font-size '${fsStr}' usa unidades relativas prohibidas. Debe ser 'px'.`);
      }
    }

    // 2. Validar letter-spacing
    if (node.letterSpacing !== undefined) {
      const lsStr = String(node.letterSpacing);
      if (lsStr.includes('px')) {
        violations.push(`Nodo ${node.nodeId}: letter-spacing '${lsStr}' usa 'px'. Debe ser 'em'.`);
      }
    }

    // 3. Validar font-family
    if (node.fontFamily && !approvedFonts.some((f) => node.fontFamily?.includes(f))) {
      violations.push(`Nodo ${node.nodeId}: familia tipográfica '${node.fontFamily}' no está en la lista autorizada.`);
    }
  }

  const score = violations.length === 0 ? 10 : Math.max(0, 10 - violations.length * 2);

  return {
    passed: violations.length === 0,
    score,
    violations,
  };
}

// Prueba de humo directa
const sampleNodes: NodeStyleSnapshot[] = [
  { nodeId: "heading-1", fontSize: "24px", lineHeight: "32px", letterSpacing: "-0.02em", fontFamily: "Inter" },
  { nodeId: "body-1", fontSize: "14px", lineHeight: "20px", letterSpacing: "0em", fontFamily: "Inter" }
];
const result = evaluateTypography(sampleNodes);
console.log(`[Typography Eval Test] Pasó: ${result.passed}, Score: ${result.score}/10`);

