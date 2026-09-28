export interface NodeDimensions {
  nodeId: string;
  declaredHeight?: number | "fit-content";
  childrenHeightTotal: number;
}

export interface OverflowEvalResult {
  passed: boolean;
  score: number;
  clippingViolations: string[];
}

export function evaluateOverflow(nodes: NodeDimensions[]): OverflowEvalResult {
  const clippingViolations: string[] = [];

  for (const node of nodes) {
    if (typeof node.declaredHeight === "number") {
      if (node.childrenHeightTotal > node.declaredHeight) {
        clippingViolations.push(
          `Nodo ${node.nodeId}: Altura fija declarada ${node.declaredHeight}px es menor que el contenido (${node.childrenHeightTotal}px). Requiere height: 'fit-content'.`
        );
      }
    }
  }

  const score = clippingViolations.length === 0 ? 10 : Math.max(0, 10 - clippingViolations.length * 3);

  return {
    passed: clippingViolations.length === 0,
    score,
    clippingViolations,
  };
}

// Prueba de humo
const sampleNodes: NodeDimensions[] = [
  { nodeId: "card-1", declaredHeight: "fit-content", childrenHeightTotal: 250 },
  { nodeId: "header-1", declaredHeight: 60, childrenHeightTotal: 40 },
];
const result = evaluateOverflow(sampleNodes);
console.log(`[Overflow Eval Test] Pasó: ${result.passed}, Score: ${result.score}/10`);
