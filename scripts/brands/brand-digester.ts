import * as fs from "node:fs";
import * as path from "node:path";
import { BrandManager } from "./brand-manager.ts";
import { computeBrandStateHash } from "./brand-hasher.ts";
import { extractHexColors, extractCssVariables } from "../brand-extract.ts";

export interface DigestResult {
  brandId: string;
  filesProcessed: string[];
  updatedTokens: {
    colors: boolean;
    typography: boolean;
    spacing: boolean;
  };
  designUpdated: boolean;
  assetsArchived: string[];
  newStateHash: string;
  summary: string[];
}

export class BrandDigester {
  private manager: BrandManager;
  private workspaceRoot: string;

  constructor(workspaceRoot = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
    this.manager = new BrandManager(workspaceRoot);
  }

  /**
   * Procesa y digiere todos los archivos pendientes en el inbox de una marca.
   */
  public digestBrand(brandId: string, options: { keepFilesInInbox?: boolean } = {}): DigestResult {
    const paths = this.manager.getBrandPaths(brandId);
    if (!fs.existsSync(paths.dir)) {
      throw new Error(`La marca '${brandId}' no existe en brands/.`);
    }

    const inboxFiles = this.manager.getInboxFiles(brandId);
    const result: DigestResult = {
      brandId,
      filesProcessed: [],
      updatedTokens: { colors: false, typography: false, spacing: false },
      designUpdated: false,
      assetsArchived: [],
      newStateHash: "",
      summary: []
    };

    if (inboxFiles.length === 0) {
      result.summary.push("El buzón de entrada (inbox) está vacío. No hay archivos nuevos por digerir.");
      result.newStateHash = computeBrandStateHash(paths.dir);
      return result;
    }

    // Preparar directorio de archivo histórico en assets/digested
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const archiveDir = path.join(paths.assets, "digested", timestamp);
    fs.mkdirSync(archiveDir, { recursive: true });

    // Cargar tokens existentes
    const colors = JSON.parse(fs.readFileSync(paths.tokens.colors, "utf8"));
    const typography = JSON.parse(fs.readFileSync(paths.tokens.typography, "utf8"));
    const spacing = JSON.parse(fs.readFileSync(paths.tokens.spacing, "utf8"));
    let designContent = fs.readFileSync(paths.design, "utf8");

    // Procesar cada archivo en el inbox
    for (const filename of inboxFiles) {
      const filePath = path.join(paths.inbox, filename);
      const ext = path.extname(filename).toLowerCase();
      result.filesProcessed.push(filename);

      try {
        if (ext === ".css" || ext === ".scss" || ext === ".less") {
          // 1. Digestión de CSS / Hojas de estilo
          const cssContent = fs.readFileSync(filePath, "utf8");
          const cssVars = extractCssVariables(cssContent);
          const hexColors = extractHexColors(cssContent);

          let colorsChanged = false;
          let typoChanged = false;

          // Detectar y mapear variables clave
          for (const [vName, vVal] of Object.entries(cssVars)) {
            const lowerName = vName.toLowerCase();
            const val = vVal.trim();

            if (lowerName.includes("primary") || lowerName.includes("accent") || lowerName.includes("brand")) {
              if (val.startsWith("#") || val.startsWith("rgb")) {
                colors.colors.primary.default = val;
                colorsChanged = true;
              }
            } else if (lowerName.includes("background") || lowerName.includes("bg") || lowerName.includes("canvas")) {
              if (val.startsWith("#") || val.startsWith("rgb")) {
                colors.colors.background.canvas = val;
                colorsChanged = true;
              }
            } else if (lowerName.includes("surface") || lowerName.includes("card")) {
              if (val.startsWith("#") || val.startsWith("rgb")) {
                colors.colors.background.surface = val;
                colorsChanged = true;
              }
            } else if (lowerName.includes("font-sans") || lowerName.includes("font-family")) {
              typography.typography.fontFamilies.sans = val.replace(/['"]/g, "");
              typoChanged = true;
            } else if (lowerName.includes("font-mono")) {
              typography.typography.fontFamilies.mono = val.replace(/['"]/g, "");
              typoChanged = true;
            }
          }

          // Si no había variables explícitas pero sí colores HEX
          if (!colorsChanged && hexColors.length > 0) {
            colors.colors.primary.default = hexColors[0];
            colorsChanged = true;
          }

          if (colorsChanged) result.updatedTokens.colors = true;
          if (typoChanged) result.updatedTokens.typography = true;

          result.summary.push(`CSS digerido (${filename}): ${Object.keys(cssVars).length} variables y ${hexColors.length} colores analizados.`);

        } else if (ext === ".json") {
          // 2. Digestión de JSON (Tokens estructurados, paletas o metadata)
          const jsonContent = JSON.parse(fs.readFileSync(filePath, "utf8"));

          if (jsonContent.colors) {
            // Mapear o sobreescribir tokens de color
            Object.assign(colors.colors, jsonContent.colors);
            result.updatedTokens.colors = true;
            result.summary.push(`Tokens de color integrados desde JSON (${filename}).`);
          }

          if (jsonContent.typography) {
            Object.assign(typography.typography, jsonContent.typography);
            result.updatedTokens.typography = true;
            result.summary.push(`Tokens de tipografía integrados desde JSON (${filename}).`);
          }

          if (jsonContent.spacing) {
            Object.assign(spacing.spacing, jsonContent.spacing);
            result.updatedTokens.spacing = true;
            result.summary.push(`Tokens de espaciado integrados desde JSON (${filename}).`);
          }

          if (Array.isArray(jsonContent.palette)) {
            const hexes = jsonContent.palette.filter((c: unknown) => typeof c === "string" && (c as string).startsWith("#"));
            if (hexes.length > 0) {
              colors.colors.primary.default = hexes[0];
              result.updatedTokens.colors = true;
              result.summary.push(`Paleta de ${hexes.length} colores aplicada desde ${filename}.`);
            }
          }

        } else if (ext === ".svg") {
          // 3. Digestión de Logotipos e Iconos SVG
          const svgContent = fs.readFileSync(filePath, "utf8");
          const fillMatches = svgContent.match(/fill="(?!(?:none|currentColor))([^"]+)"/gi) || [];
          const extractedFills = fillMatches.map(m => m.replace(/fill="/i, "").replace(/"/i, "").trim());
          const validColors = extractedFills.filter(c => c.startsWith("#"));

          if (validColors.length > 0 && colors.colors.primary.default.toLowerCase() !== validColors[0].toLowerCase()) {
            colors.colors.primary.default = validColors[0];
            result.updatedTokens.colors = true;
            result.summary.push(`Color primario sincronizado con SVG (${filename}): ${validColors[0]}`);
          }

          // Clasificar como logo en assets/logos/
          const destLogo = path.join(paths.assets, "logos", filename);
          fs.copyFileSync(filePath, destLogo);
          result.assetsArchived.push(`assets/logos/${filename}`);
          result.summary.push(`Vector SVG archivado como recurso oficial en assets/logos/${filename}`);

        } else if (ext === ".png" || ext === ".jpg" || ext === ".jpeg" || ext === ".webp") {
          // 4. Digestión de Imágenes / Capturas de Pantalla
          const destImg = path.join(paths.assets, "images", filename);
          fs.copyFileSync(filePath, destImg);
          result.assetsArchived.push(`assets/images/${filename}`);
          result.summary.push(`Imagen de referencia archivada en assets/images/${filename}`);

        } else if (ext === ".md" || ext === ".txt") {
          // 5. Digestión de Manuales / Briefs de Texto
          const docContent = fs.readFileSync(filePath, "utf8");
          const hexes = extractHexColors(docContent);
          if (hexes.length > 0 && !result.updatedTokens.colors) {
            colors.colors.primary.default = hexes[0];
            result.updatedTokens.colors = true;
            result.summary.push(`Colores de manual detectados (${filename}): primario ajustado a ${hexes[0]}`);
          }

          // Añadir extracto a DESIGN.md si aporta lineamientos
          const docSection = `\n\n### Ingesta de Lineamientos (${filename})\n> Documento procesado el ${new Date().toLocaleDateString()}\n\n${docContent.slice(0, 1500)}\n`;
          designContent += docSection;
          result.designUpdated = true;
          result.summary.push(`Directrices de marca asimiladas y anexadas a DESIGN.md desde ${filename}`);
        }

        // Archivar copia en assets/digested/
        fs.copyFileSync(filePath, path.join(archiveDir, filename));

        // Limpiar archivo del inbox salvo que se indique lo contrario
        if (!options.keepFilesInInbox) {
          fs.unlinkSync(filePath);
        }

      } catch (err: unknown) {
        result.summary.push(`\x1b[31m[ADVERTENCIA]\x1b[0m Error al digerir ${filename}: ${(err as Error).message}`);
      }
    }

    // Persistir tokens si cambiaron
    if (result.updatedTokens.colors) {
      fs.writeFileSync(paths.tokens.colors, JSON.stringify(colors, null, 2) + "\n", "utf8");
    }
    if (result.updatedTokens.typography) {
      fs.writeFileSync(paths.tokens.typography, JSON.stringify(typography, null, 2) + "\n", "utf8");
    }
    if (result.updatedTokens.spacing) {
      fs.writeFileSync(paths.tokens.spacing, JSON.stringify(spacing, null, 2) + "\n", "utf8");
    }
    if (result.designUpdated) {
      fs.writeFileSync(paths.design, designContent, "utf8");
    }

    // Actualizar registro maestro brands.json y stateHash
    const registry = this.manager.loadRegistry();
    const brandMeta = registry.brands[brandId];
    if (brandMeta) {
      const newHash = computeBrandStateHash(paths.dir);
      brandMeta.stateHash = newHash;
      brandMeta.updatedAt = new Date().toISOString();
      this.manager.saveRegistry(registry);
      result.newStateHash = newHash;

      // Si la marca digerida es la activa, refrescar design-system/tokens/
      if (registry.activeBrand === brandId) {
        fs.copyFileSync(paths.tokens.colors, path.join(this.workspaceRoot, "design-system/tokens/colors.json"));
        fs.copyFileSync(paths.tokens.typography, path.join(this.workspaceRoot, "design-system/tokens/typography.json"));
        fs.copyFileSync(paths.tokens.spacing, path.join(this.workspaceRoot, "design-system/tokens/spacing.json"));
      }
    }

    // Registrar manifiesto de digestión en brands/<brandId>/inbox-manifest.json
    const manifestPath = path.join(paths.dir, "inbox-manifest.json");
    let history: Array<Record<string, unknown>> = [];
    if (fs.existsSync(manifestPath)) {
      try {
        history = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
      } catch {
        history = [];
      }
    }
    history.push({
      timestamp: new Date().toISOString(),
      files: result.filesProcessed,
      tokensUpdated: result.updatedTokens,
      stateHash: result.newStateHash,
      summary: result.summary
    });
    fs.writeFileSync(manifestPath, JSON.stringify(history, null, 2) + "\n", "utf8");

    return result;
  }

  /**
   * Digiere todas las marcas que tengan archivos pendientes en su inbox.
   */
  public digestAll(): Record<string, DigestResult> {
    const registry = this.manager.loadRegistry();
    const results: Record<string, DigestResult> = {};

    for (const brandId of Object.keys(registry.brands)) {
      const inboxFiles = this.manager.getInboxFiles(brandId);
      if (inboxFiles.length > 0) {
        results[brandId] = this.digestBrand(brandId);
      }
    }

    return results;
  }
}

// Invocación por CLI
if (process.argv[1]?.endsWith("brand-digester.ts")) {
  const digester = new BrandDigester();
  const manager = new BrandManager();
  const args = process.argv.slice(2);
  const keep = args.includes("--keep");
  const brandArg = args.find(a => !a.startsWith("--"));

  let targetBrand = brandArg;
  if (!targetBrand) {
    try {
      const active = manager.getActiveBrand();
      targetBrand = active.meta.id;
    } catch {
      targetBrand = undefined;
    }
  }

  console.log(`\n=== MOTOR DE DIGESTIÓN DE ACTIVOS (BRAND DIGESTER) ===\n`);

  if (targetBrand) {
    console.log(`Digeriendo buzón de entrada para marca: \x1b[36m${targetBrand}\x1b[0m...`);
    try {
      const res = digester.digestBrand(targetBrand, { keepFilesInInbox: keep });
      console.log(`\nArchivos procesados: ${res.filesProcessed.length}`);
      for (const item of res.summary) {
        console.log(`  • ${item}`);
      }
      console.log(`\nNuevo State Hash: \x1b[32m${res.newStateHash.slice(0, 16)}...\x1b[0m\n`);
    } catch (err: unknown) {
      console.error(`\x1b[31m[ERROR]\x1b[0m ${(err as Error).message}`);
      process.exit(1);
    }
  } else {
    console.log("No se especificó marca. Analizando todas las marcas registradas...");
    const all = digester.digestAll();
    const count = Object.keys(all).length;
    if (count === 0) {
      console.log("Ninguna marca tiene archivos pendientes en su inbox.");
    } else {
      console.log(`Se digirieron activos para ${count} marca(s).\n`);
    }
  }
}
