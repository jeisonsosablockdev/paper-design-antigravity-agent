import * as crypto from "node:crypto";
import * as fs from "node:fs";
import * as path from "node:path";

// Normaliza recursivamente un objeto ordenando sus claves alfabéticamente
export function sortObjectKeys(obj: unknown): unknown {
  if (obj === null || typeof obj !== "object") {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(sortObjectKeys);
  }
  const sorted: Record<string, unknown> = {};
  for (const key of Object.keys(obj).sort()) {
    sorted[key] = sortObjectKeys((obj as Record<string, unknown>)[key]);
  }
  return sorted;
}

// Calcula el hash SHA-256 de una cadena de texto
export function sha256(content: string): string {
  return crypto.createHash("sha256").update(content, "utf8").digest("hex");
}

// Calcula el hash determinista acumulado de una marca a partir de sus archivos clave
export function computeBrandStateHash(brandDir: string): string {
  if (!fs.existsSync(brandDir)) {
    throw new Error(`El directorio de marca no existe: ${brandDir}`);
  }

  const parts: string[] = [];

  // 1. brand.json
  const brandMetaPath = path.join(brandDir, "brand.json");
  if (fs.existsSync(brandMetaPath)) {
    const meta = JSON.parse(fs.readFileSync(brandMetaPath, "utf8"));
    // Excluir stateHash y timestamps para evitar circularidad
    const { stateHash: _s, updatedAt: _u, ...rest } = meta;
    parts.push(`brand.json:${JSON.stringify(sortObjectKeys(rest))}`);
  }

  // 2. DESIGN.md
  const designPath = path.join(brandDir, "DESIGN.md");
  if (fs.existsSync(designPath)) {
    const designContent = fs.readFileSync(designPath, "utf8").trim();
    parts.push(`DESIGN.md:${designContent}`);
  }

  // 3. Tokens: colors.json, typography.json, spacing.json
  const tokensDir = path.join(brandDir, "tokens");
  const tokenFiles = ["colors.json", "typography.json", "spacing.json"];

  for (const file of tokenFiles) {
    const filePath = path.join(tokensDir, file);
    if (fs.existsSync(filePath)) {
      try {
        const json = JSON.parse(fs.readFileSync(filePath, "utf8"));
        parts.push(`${file}:${JSON.stringify(sortObjectKeys(json))}`);
      } catch {
        parts.push(`${file}:${fs.readFileSync(filePath, "utf8").trim()}`);
      }
    }
  }

  return sha256(parts.join("||"));
}
