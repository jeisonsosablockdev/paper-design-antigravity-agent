/**
 * Eval: Brand Digestion & Dropzone Inbox Processing
 * Valida la detección y asimilación de archivos en brands/<brand-id>/inbox/
 */

import * as fs from "node:fs";
import * as path from "node:path";
import { BrandDigester } from "../../scripts/brands/brand-digester.ts";
import { BrandManager } from "../../scripts/brands/brand-manager.ts";
import { computeBrandStateHash } from "../../scripts/brands/brand-hasher.ts";

export interface BrandDigestEvalResult {
  passed: boolean;
  score: number;
  violations: string[];
}

export function evaluateBrandDigestion(): BrandDigestEvalResult {
  const violations: string[] = [];
  const manager = new BrandManager();
  const digester = new BrandDigester();

  const testBrandId = "eval-test-brand";
  const brandDir = path.join(process.cwd(), "brands", testBrandId);

  try {
    // 1. Limpieza preventiva
    if (fs.existsSync(brandDir)) {
      fs.rmSync(brandDir, { recursive: true, force: true });
    }
    const registry = manager.loadRegistry();
    if (registry.brands[testBrandId]) {
      delete registry.brands[testBrandId];
      manager.saveRegistry(registry);
    }

    // 2. Crear marca de prueba
    manager.createBrand({
      id: testBrandId,
      name: "Eval Test Brand",
      description: "Marca efímera para probar la digestión de archivos en inbox",
      basePreset: "linear"
    });

    const paths = manager.getBrandPaths(testBrandId);

    // 3. Verificar que la carpeta inbox exista con su README y .gitkeep
    if (!fs.existsSync(paths.inbox)) {
      violations.push("createBrand() no creó la carpeta inbox/.");
    }
    if (!fs.existsSync(path.join(paths.inbox, ".gitkeep"))) {
      violations.push("createBrand() no creó inbox/.gitkeep.");
    }

    // 4. Depositar archivos de prueba en el inbox
    const sampleCss = `
:root {
  --primary: #8b5cf6;
  --background: #030712;
  --font-sans: 'Space Grotesk', sans-serif;
}
`;
    fs.writeFileSync(path.join(paths.inbox, "theme.css"), sampleCss, "utf8");

    const sampleSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"><circle cx="50" cy="50" r="40" fill="#ec4899" /></svg>`;
    fs.writeFileSync(path.join(paths.inbox, "logo-mark.svg"), sampleSvg, "utf8");

    const sampleMd = `# Reglas de Voz\n\nTono ultra-técnico, sobrio y directo.\n`;
    fs.writeFileSync(path.join(paths.inbox, "guidelines.md"), sampleMd, "utf8");

    // 5. Verificar detección previa a la digestión
    const pendingBefore = manager.getInboxFiles(testBrandId);
    if (pendingBefore.length !== 3) {
      violations.push(`getInboxFiles() detectó ${pendingBefore.length} archivos, se esperaban 3.`);
    }

    // 6. Ejecutar la digestión
    const digestResult = digester.digestBrand(testBrandId);

    if (digestResult.filesProcessed.length !== 3) {
      violations.push(`Se procesaron ${digestResult.filesProcessed.length} archivos, se esperaban 3.`);
    }

    // 7. Validar actualización de tokens
    const updatedColors = JSON.parse(fs.readFileSync(paths.tokens.colors, "utf8"));
    const updatedTypo = JSON.parse(fs.readFileSync(paths.tokens.typography, "utf8"));

    if (!updatedColors.colors?.primary?.default?.includes("ec4899") && !updatedColors.colors?.primary?.default?.includes("8b5cf6")) {
      violations.push(`El color primario no se actualizó correctamente. Valor: ${updatedColors.colors?.primary?.default}`);
    }

    if (!updatedTypo.typography?.fontFamilies?.sans?.includes("Space Grotesk")) {
      violations.push(`La tipografía sans no asimiló 'Space Grotesk'. Valor: ${updatedTypo.typography?.fontFamilies?.sans}`);
    }

    // 8. Validar archivo de logo SVG
    const archivedLogo = path.join(paths.assets, "logos", "logo-mark.svg");
    if (!fs.existsSync(archivedLogo)) {
      violations.push("El vector SVG no fue archivado en assets/logos/.");
    }

    // 9. Validar enriquecimiento de DESIGN.md
    const updatedDesign = fs.readFileSync(paths.design, "utf8");
    if (!updatedDesign.includes("Reglas de Voz")) {
      violations.push("DESIGN.md no incorporó los lineamientos de guidelines.md.");
    }

    // 10. Validar limpieza de inbox y generación de manifiesto
    const pendingAfter = manager.getInboxFiles(testBrandId);
    if (pendingAfter.length !== 0) {
      violations.push(`El buzón no quedó limpio tras la digestión. Quedaron: ${pendingAfter.join(", ")}`);
    }

    const manifestPath = path.join(paths.dir, "inbox-manifest.json");
    if (!fs.existsSync(manifestPath)) {
      violations.push("No se generó inbox-manifest.json en la raíz de la marca.");
    }

    // 11. Validar stateHash
    const computedHash = computeBrandStateHash(paths.dir);
    const updatedRegistry = manager.loadRegistry();
    if (updatedRegistry.brands[testBrandId]?.stateHash !== computedHash) {
      violations.push("El stateHash registrado no coincide con computeBrandStateHash tras la digestión.");
    }

  } catch (err: unknown) {
    violations.push(`Excepción no controlada en la prueba: ${(err as Error).message}`);
  } finally {
    // Limpieza de marca de prueba
    if (fs.existsSync(brandDir)) {
      fs.rmSync(brandDir, { recursive: true, force: true });
    }
    try {
      const reg = manager.loadRegistry();
      if (reg.brands[testBrandId]) {
        delete reg.brands[testBrandId];
        manager.saveRegistry(reg);
      }
    } catch {
      // Ignorar error al limpiar
    }
  }

  const score = violations.length === 0 ? 10 : Math.max(0, 10 - violations.length * 2);
  return {
    passed: violations.length === 0,
    score,
    violations
  };
}

// Ejecución directa de prueba de humo
const result = evaluateBrandDigestion();
console.log(`[Brand Digestion Eval Test] Pasó: ${result.passed}, Score: ${result.score}/10`);
if (result.violations.length > 0) {
  console.error("Violaciones:", result.violations);
  process.exit(1);
}
