import { type ScreenSpec, type ComponentNode } from "../../specs/schemas/screen.schema.ts";

export interface RenderedNode {
  id: string;
  role?: string;
  children?: RenderedNode[];
}

export interface ContractEvalResult {
  passed: boolean;
  score: number;
  missingComponentIds: string[];
}

export function evaluateContractFidelity(
  spec: ScreenSpec,
  renderedTree: RenderedNode[]
): ContractEvalResult {
  const renderedIds = new Set<string>();

  function collectIds(nodes: RenderedNode[]) {
    for (const node of nodes) {
      renderedIds.add(node.id);
      if (node.children) collectIds(node.children);
    }
  }
  collectIds(renderedTree);

  const missingComponentIds: string[] = [];

  function checkComponent(c: ComponentNode) {
    if (!renderedIds.has(c.id)) {
      missingComponentIds.push(c.id);
    }
    if (c.children) {
      c.children.forEach(checkComponent);
    }
  }

  spec.components.forEach(checkComponent);

  const score = missingComponentIds.length === 0 ? 10 : Math.max(0, 10 - missingComponentIds.length * 2);

  return {
    passed: missingComponentIds.length === 0,
    score,
    missingComponentIds,
  };
}

console.log("[Contract Eval Test] Suite cargada correctamente.");
