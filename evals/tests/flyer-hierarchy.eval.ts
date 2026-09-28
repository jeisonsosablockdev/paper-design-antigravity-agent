import { type FlyerSpec } from "../../specs/schemas/flyer.schema.ts";

export interface FlyerRenderedNode {
  id: string;
  role: "background" | "eyebrow" | "headline" | "subheadline" | "details" | "cta" | "sponsors";
  text?: string;
  fontSize?: number;
  letterSpacing?: string;
  color?: string;
}

export interface FlyerHierarchyEvalResult {
  passed: boolean;
  score: number;
  violations: string[];
}

export function evaluateFlyerHierarchy(
  spec: FlyerSpec,
  nodes: FlyerRenderedNode[]
): FlyerHierarchyEvalResult {
  const violations: string[] = [];

  // 1. Validar presencia del titular (Headline)
  const headlineNode = nodes.find((n) => n.role === "headline");
  if (!headlineNode) {
    violations.push("Falta el nodo 'headline' con el titular del flyer.");
  } else {
    const minFontSize = spec.format === "square" ? 40 : 52;
    if (headlineNode.fontSize && headlineNode.fontSize < minFontSize) {
      violations.push(
        `El titular tiene font-size ${headlineNode.fontSize}px, pero para formato '${spec.format}' se requiere al menos ${minFontSize}px.`
      );
    }
  }

  // 2. Validar presencia de Eyebrow / Categoría
  if (spec.content.eyebrow) {
    const eyebrowNode = nodes.find((n) => n.role === "eyebrow");
    if (!eyebrowNode) {
      violations.push("Falta el nodo 'eyebrow' especificado en el contenido.");
    }
  }

  // 3. Validar presencia de CTA
  if (spec.content.cta) {
    const ctaNode = nodes.find((n) => n.role === "cta");
    if (!ctaNode) {
      violations.push("Falta el bloque o botón de 'cta' especificado en el contenido.");
    }
  }

  // 4. Validar bloque de detalles de evento
  if (spec.content.eventDetails && spec.content.eventDetails.length > 0) {
    const detailsNode = nodes.find((n) => n.role === "details");
    if (!detailsNode) {
      violations.push("Falta el contenedor de 'details' con la información del evento.");
    }
  }

  const score = violations.length === 0 ? 10 : Math.max(0, 10 - violations.length * 2.5);

  return {
    passed: violations.length === 0,
    score,
    violations,
  };
}

// Prueba de humo
import { launchPartyFlyerSpec } from "../../specs/flyers/launch-party.flyer.ts";

const sampleRenderedFlyer: FlyerRenderedNode[] = [
  { id: "eyebrow-1", role: "eyebrow", text: "EXCLUSIVA • BOGOTÁ TECH WEEK", fontSize: 14, letterSpacing: "0.08em" },
  { id: "headline-1", role: "headline", text: "AI LAUNCH NIGHT 2026", fontSize: 64, letterSpacing: "-0.03em" },
  { id: "details-1", role: "details", text: "Detalles del evento" },
  { id: "cta-1", role: "cta", text: "RESERVA TU ACCESO VIP" },
];

const evalResult = evaluateFlyerHierarchy(launchPartyFlyerSpec, sampleRenderedFlyer);
console.log(`[Flyer Hierarchy Eval Test] Pasó: ${evalResult.passed}, Score: ${evalResult.score}/10`);
