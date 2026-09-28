import * as fs from "node:fs";
import * as path from "node:path";
import { authLoginSpec } from "../screens/auth-login.spec.ts";

export interface DriftReport {
  timestamp: string;
  specId: string;
  divergences: string[];
  newComponentsDetected: string[];
  missingComponents: string[];
}

export function detectDrift(
  actualCanvasNodes: Array<{ id: string; role?: string }>,
  spec = authLoginSpec
): DriftReport {
  const specIds = new Set<string>();

  function collectSpecIds(components: typeof spec.components) {
    for (const c of components) {
      specIds.add(c.id);
      if (c.children) collectSpecIds(c.children);
    }
  }
  collectSpecIds(spec.components);

  const canvasIds = new Set(actualCanvasNodes.map((n) => n.id));

  const missingComponents: string[] = [];
  for (const id of specIds) {
    if (!canvasIds.has(id)) {
      missingComponents.push(id);
    }
  }

  const newComponentsDetected: string[] = [];
  for (const id of canvasIds) {
    if (!specIds.has(id)) {
      newComponentsDetected.push(id);
    }
  }

  const divergences: string[] = [];
  if (missingComponents.length > 0) {
    divergences.push(`Faltan componentes requeridos por la spec: ${missingComponents.join(", ")}`);
  }
  if (newComponentsDetected.length > 0) {
    divergences.push(`Nuevos componentes manuales detectados en el canvas: ${newComponentsDetected.join(", ")}`);
  }

  const report: DriftReport = {
    timestamp: new Date().toISOString(),
    specId: spec.id,
    divergences,
    newComponentsDetected,
    missingComponents,
  };

  const driftDir = path.resolve(process.cwd(), "specs/drift");
  if (!fs.existsSync(driftDir)) fs.mkdirSync(driftDir, { recursive: true });

  const filename = `${new Date().toISOString().replace(/[:.]/g, "-")}_drift_report.json`;
  fs.writeFileSync(path.join(driftDir, filename), JSON.stringify(report, null, 2), "utf-8");

  return report;
}

// Prueba de humo
const sampleActual = [
  { id: "brand-header" },
  { id: "credentials-form" },
  { id: "primary-login-button" },
  { id: "user-added-custom-banner" }, // componente nuevo
];
const rep = detectDrift(sampleActual);
console.log(`[Drift Detector Test] Divergencias encontradas: ${rep.divergences.length}`);
console.log(` - Nuevos componentes: ${rep.newComponentsDetected.join(", ")}`);
