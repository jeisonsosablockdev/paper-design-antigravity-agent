/**
 * Eval: Multi-Brand System & Idempotency Assertions
 * Valida la integridad de brands.json, el aislamiento de marcas y la idempotencia matemática al conmutar.
 */

import { BrandManager } from "../../scripts/brands/brand-manager.ts";
import { computeBrandStateHash } from "../../scripts/brands/brand-hasher.ts";

export interface MultiBrandEvalResult {
  passed: boolean;
  score: number;
  violations: string[];
}

export function evaluateMultiBrandSystem(): MultiBrandEvalResult {
  const violations: string[] = [];
  const manager = new BrandManager();

  // 1. Validar integridad estructural del registro
  const validation = manager.validateBrands();
  if (!validation.valid) {
    violations.push(...validation.errors);
  }

  // 2. Validar que la marca activa resuelva correctamente
  try {
    const active = manager.getActiveBrand();
    if (!active.meta.id || !active.meta.name) {
      violations.push("getActiveBrand() no devolvió metadatos válidos.");
    }
  } catch (err: unknown) {
    violations.push(`Fallo al obtener marca activa: ${(err as Error).message}`);
  }

  // 3. Probar Idempotencia de Conmutación
  try {
    const registry = manager.loadRegistry();
    const currentActiveId = registry.activeBrand;

    // Conmutar a la misma marca que ya está activa
    const result1 = manager.switchBrand(currentActiveId);
    if (!result1.noop || result1.changed) {
      violations.push(`Fallo de idempotencia: switchBrand a la marca ya activa '${currentActiveId}' debió ser noop: true.`);
    }

    // Segunda llamada consecutiva: debe seguir siendo noop
    const result2 = manager.switchBrand(currentActiveId);
    if (!result2.noop || result2.changed) {
      violations.push("Fallo de idempotencia en segunda llamada consecutiva.");
    }
  } catch (err: unknown) {
    violations.push(`Error en prueba de idempotencia: ${(err as Error).message}`);
  }

  // 4. Probar Hash de Estado de Marcas
  try {
    const brands = manager.listBrands();
    if (brands.length === 0) {
      violations.push("No hay marcas registradas en brands.json.");
    }
    for (const b of brands) {
      const paths = manager.getBrandPaths(b.id);
      const computed = computeBrandStateHash(paths.dir);
      if (b.stateHash !== computed) {
        violations.push(`Desfase de hash en '${b.id}': registrado '${b.stateHash}', calculado '${computed}'.`);
      }
    }
  } catch (err: unknown) {
    violations.push(`Error al validar hashes de estado: ${(err as Error).message}`);
  }

  // 5. Probar rechazo seguro de nombres inválidos y duplicados
  try {
    let duplicateRejected = false;
    try {
      manager.createBrand({ id: "linear-tech", name: "Duplicado" });
    } catch {
      duplicateRejected = true;
    }
    if (!duplicateRejected) {
      violations.push("El sistema permitió duplicar una marca existente sin error.");
    }

    let invalidRejected = false;
    try {
      manager.createBrand({ id: "INVALID_NAME!!", name: "Invalido" });
    } catch {
      invalidRejected = true;
    }
    if (!invalidRejected) {
      violations.push("El sistema permitió un ID con formato no kebab-case.");
    }
  } catch (err: unknown) {
    violations.push(`Error en pruebas de validación de creación: ${(err as Error).message}`);
  }

  const score = violations.length === 0 ? 10 : Math.max(0, 10 - violations.length * 2);
  return {
    passed: violations.length === 0,
    score,
    violations
  };
}

// Ejecución directa de prueba de humo
const result = evaluateMultiBrandSystem();
console.log(`[Multi-Brand Eval Test] Pasó: ${result.passed}, Score: ${result.score}/10`);
if (result.violations.length > 0) {
  console.error("Violaciones:", result.violations);
  process.exit(1);
}
