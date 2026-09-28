/**
 * Guardrail: Post-Tool Check
 * Inspecciona los nodos después de operaciones en Paper (write_html, update_styles)
 * para detectar desbordes verticales (clipping) o problemas de renderizado.
 */

export interface NodeMetrics {
  nodeId: string;
  width?: number | null;
  height?: number | null;
  worldY?: number | null;
  children?: NodeMetrics[];
}

export interface PostToolCheckResult {
  hasOverflow: boolean;
  overflowingNodeIds: string[];
  suggestedAction?: {
    tool: "update_styles";
    styles: { height: "fit-content" };
  };
  warnings: string[];
}

export function postToolCheck(
  container: NodeMetrics,
  containerDeclaredHeight?: number
): PostToolCheckResult {
  const warnings: string[] = [];
  const overflowingNodeIds: string[] = [];

  if (!container.children || container.children.length === 0) {
    return { hasOverflow: false, overflowingNodeIds: [], warnings };
  }

  // Si el contenedor tiene altura fija explícita, verificar si la suma de los hijos la supera
  if (containerDeclaredHeight && containerDeclaredHeight > 0) {
    let totalChildHeight = 0;
    for (const child of container.children) {
      if (child.height && child.height > 0) {
        totalChildHeight += child.height;
      }
    }

    if (totalChildHeight > containerDeclaredHeight) {
      overflowingNodeIds.push(container.nodeId);
      warnings.push(
        `El contenedor tiene altura fija ${containerDeclaredHeight}px, pero sus hijos ocupan al menos ${totalChildHeight}px.`
      );
    }
  }

  return {
    hasOverflow: overflowingNodeIds.length > 0,
    overflowingNodeIds,
    suggestedAction:
      overflowingNodeIds.length > 0
        ? {
            tool: "update_styles",
            styles: { height: "fit-content" },
          }
        : undefined,
    warnings,
  };
}
