import * as fs from "node:fs";
import * as path from "node:path";
import { BrandManager } from "../brands/brand-manager.ts";
import { OpenDesignTokenConverter } from "./token-converter.ts";
import { ScreenSpecGenerator } from "./spec-generator.ts";
import { ScreenSpecSchema } from "../../specs/schemas/screen.schema.ts";

export interface CatalogItem {
  urn: string;
  category: "system" | "screen" | "engine";
  id: string;
  name: string;
  description: string;
  path: string;
}

export class OpenDesignManager {
  private workspaceRoot: string;
  private catalogDir: string;
  private screensDir: string;
  private enginesDir: string;
  private brandManager: BrandManager;

  constructor(workspaceRoot = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
    this.catalogDir = path.join(this.workspaceRoot, "design-system", "catalog");
    this.screensDir = path.join(this.workspaceRoot, "templates", "screens");
    this.enginesDir = path.join(this.workspaceRoot, "templates", "engines");
    this.brandManager = new BrandManager(workspaceRoot);
  }

  /**
   * Lista todos los elementos del catálogo disponibles
   */
  public listCatalog(): CatalogItem[] {
    const items: CatalogItem[] = [];

    // 1. Systems
    if (fs.existsSync(this.catalogDir)) {
      const sysDirs = fs.readdirSync(this.catalogDir, { withFileTypes: true });
      for (const d of sysDirs) {
        if (!d.isDirectory()) continue;
        const manifestPath = path.join(this.catalogDir, d.name, "manifest.json");
        if (fs.existsSync(manifestPath)) {
          const meta = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
          items.push({
            urn: meta.urn || `od:sys/${d.name}`,
            category: "system",
            id: d.name,
            name: meta.name || d.name,
            description: meta.description || "",
            path: path.join(this.catalogDir, d.name)
          });
        }
      }
    }

    // 2. Screen Templates
    if (fs.existsSync(this.screensDir)) {
      const screenDirs = fs.readdirSync(this.screensDir, { withFileTypes: true });
      for (const d of screenDirs) {
        if (!d.isDirectory()) continue;
        const manifestPath = path.join(this.screensDir, d.name, "manifest.json");
        if (fs.existsSync(manifestPath)) {
          const meta = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
          items.push({
            urn: meta.urn || `od:screen/${d.name}`,
            category: "screen",
            id: d.name,
            name: meta.name || d.name,
            description: meta.description || "",
            path: path.join(this.screensDir, d.name)
          });
        }
      }
    }

    // 3. Engines
    if (fs.existsSync(this.enginesDir)) {
      const engDirs = fs.readdirSync(this.enginesDir, { withFileTypes: true });
      for (const d of engDirs) {
        if (!d.isDirectory()) continue;
        const manifestPath = path.join(this.enginesDir, d.name, "manifest.json");
        if (fs.existsSync(manifestPath)) {
          const meta = JSON.parse(fs.readFileSync(manifestPath, "utf8"));
          items.push({
            urn: meta.urn || `od:engine/${d.name}`,
            category: "engine",
            id: d.name,
            name: meta.name || d.name,
            description: meta.description || "",
            path: path.join(this.enginesDir, d.name)
          });
        }
      }
    }

    return items;
  }

  /**
   * Aplica un sistema de diseño de OpenDesign al lienzo activo de Paper
   */
  public applySystem(systemUrnOrId: string): { appliedUrn: string; paperTokensCount: number } {
    const sysId = systemUrnOrId.replace(/^od:sys\//, "");
    const sysDir = path.join(this.catalogDir, sysId);

    if (!fs.existsSync(sysDir)) {
      throw new Error(`Sistema de diseño no encontrado en catálogo: ${systemUrnOrId} (Ruta: ${sysDir})`);
    }

    const tokensPath = path.join(sysDir, "tokens.json");
    const designMdPath = path.join(sysDir, "DESIGN.md");

    if (!fs.existsSync(tokensPath) || !fs.existsSync(designMdPath)) {
      throw new Error(`El sistema ${sysId} está incompleto (faltan tokens.json o DESIGN.md).`);
    }

    const tokens = JSON.parse(fs.readFileSync(tokensPath, "utf8"));
    const designMd = fs.readFileSync(designMdPath, "utf8");

    // 1. Actualizar design-system/active/DESIGN.md
    const activeDesignDir = path.join(this.workspaceRoot, "design-system", "active");
    if (!fs.existsSync(activeDesignDir)) fs.mkdirSync(activeDesignDir, { recursive: true });
    fs.writeFileSync(path.join(activeDesignDir, "DESIGN.md"), designMd, "utf8");

    // 2. Actualizar tokens activos
    const tokensDir = path.join(this.workspaceRoot, "design-system", "tokens");
    fs.writeFileSync(
      path.join(tokensDir, "colors.json"),
      JSON.stringify({ $schema: "https://json-schema.org/draft/2020-12/schema", colors: tokens.colors }, null, 2) + "\n",
      "utf8"
    );
    fs.writeFileSync(
      path.join(tokensDir, "typography.json"),
      JSON.stringify({ $schema: "https://json-schema.org/draft/2020-12/schema", typography: tokens.typography }, null, 2) + "\n",
      "utf8"
    );
    fs.writeFileSync(
      path.join(tokensDir, "spacing.json"),
      JSON.stringify({ $schema: "https://json-schema.org/draft/2020-12/schema", spacing: tokens.spacing }, null, 2) + "\n",
      "utf8"
    );

    const mcpTokens = OpenDesignTokenConverter.toPaperMcpTokens(tokens);
    const tokenCount = Object.keys(mcpTokens).length;

    return {
      appliedUrn: `od:sys/${sysId}`,
      paperTokensCount: tokenCount
    };
  }

  /**
   * Scaffolds una nueva pantalla basada en un template de OpenDesign
   */
  public scaffoldScreen(screenUrnOrId: string, targetScreenId?: string): { specPath: string; templateHtmlPath: string } {
    const screenId = screenUrnOrId.replace(/^od:screen\//, "");
    const screenDir = path.join(this.screensDir, screenId);

    if (!fs.existsSync(screenDir)) {
      throw new Error(`Template de pantalla no encontrado: ${screenUrnOrId} (Ruta: ${screenDir})`);
    }

    const finalScreenId = targetScreenId || `screen-${screenId}`;
    const targetSpecPath = path.join(this.workspaceRoot, "specs", "screens", `${finalScreenId}.spec.ts`);

    const manifest = JSON.parse(fs.readFileSync(path.join(screenDir, "manifest.json"), "utf8"));

    // Generar spec adaptada con import relativo a specs/schemas/screen.schema.ts
    const spec = ScreenSpecGenerator.generateSpec({
      id: finalScreenId,
      title: manifest.name,
      description: manifest.description
    });

    const specCode = ScreenSpecGenerator.toTypeScript(spec, "../schemas/screen.schema.ts");
    fs.writeFileSync(targetSpecPath, specCode, "utf8");

    const templateHtmlPath = path.join(screenDir, "canvas-template.html");

    return {
      specPath: targetSpecPath,
      templateHtmlPath
    };
  }

  /**
   * Convierte un sistema de diseño OpenDesign en una marca registrada formal en brands/
   */
  public exportToBrand(systemUrnOrId: string, customBrandName?: string): string {
    const sysId = systemUrnOrId.replace(/^od:sys\//, "");
    const sysDir = path.join(this.catalogDir, sysId);

    if (!fs.existsSync(sysDir)) {
      throw new Error(`Sistema no encontrado: ${systemUrnOrId}`);
    }

    const manifest = JSON.parse(fs.readFileSync(path.join(sysDir, "manifest.json"), "utf8"));
    const brandId = `od-${sysId}`;
    const brandName = customBrandName || manifest.name;

    // Crear marca usando el BrandManager existente
    this.brandManager.createBrand({
      id: brandId,
      name: brandName,
      description: manifest.description,
      basePreset: "linear"
    });

    // Copiar los tokens y DESIGN.md específicos del sistema OpenDesign a la nueva marca
    const brandPaths = this.brandManager.getBrandPaths(brandId);
    const designMd = fs.readFileSync(path.join(sysDir, "DESIGN.md"), "utf8");
    const tokens = JSON.parse(fs.readFileSync(path.join(sysDir, "tokens.json"), "utf8"));

    fs.writeFileSync(brandPaths.design, designMd, "utf8");
    fs.writeFileSync(
      brandPaths.tokens.colors,
      JSON.stringify({ $schema: "https://json-schema.org/draft/2020-12/schema", colors: tokens.colors }, null, 2) + "\n",
      "utf8"
    );
    fs.writeFileSync(
      brandPaths.tokens.typography,
      JSON.stringify({ $schema: "https://json-schema.org/draft/2020-12/schema", typography: tokens.typography }, null, 2) + "\n",
      "utf8"
    );
    fs.writeFileSync(
      brandPaths.tokens.spacing,
      JSON.stringify({ $schema: "https://json-schema.org/draft/2020-12/schema", spacing: tokens.spacing }, null, 2) + "\n",
      "utf8"
    );

    return brandId;
  }
}

// Ejecución CLI directa
if (process.argv[1] && process.argv[1].endsWith("od-manager.ts")) {
  const manager = new OpenDesignManager();
  const command = process.argv[2];
  const target = process.argv[3];
  const extra = process.argv[4];

  switch (command) {
    case "list": {
      const items = manager.listCatalog();
      console.log("\n📦 Catálogo OpenDesign Disponible:\n");
      for (const item of items) {
        const catBadge = item.category === "system" ? "🎨 [SYS]" : item.category === "screen" ? "📱 [SCREEN]" : "⚡ [ENGINE]";
        console.log(` ${catBadge} ${item.urn.padEnd(28)} - ${item.name}`);
        console.log(`    └─ ${item.description}\n`);
      }
      break;
    }
    case "apply": {
      if (!target) {
        console.error("❌ Uso: node scripts/opendesign/od-manager.ts apply <od:sys/id>");
        process.exit(1);
      }
      const res = manager.applySystem(target);
      console.log(`✅ Sistema ${res.appliedUrn} aplicado con éxito.`);
      console.log(`   └─ ${res.paperTokensCount} tokens normalizados para Paper MCP.`);
      break;
    }
    case "scaffold": {
      if (!target) {
        console.error("❌ Uso: node scripts/opendesign/od-manager.ts scaffold <od:screen/id> [screen-id]");
        process.exit(1);
      }
      const res = manager.scaffoldScreen(target, extra);
      console.log(`✅ Pantalla scaffolded en: ${res.specPath}`);
      console.log(`   └─ Template HTML listo para Paper MCP en: ${res.templateHtmlPath}`);
      break;
    }
    case "brand": {
      if (!target) {
        console.error("❌ Uso: node scripts/opendesign/od-manager.ts brand <od:sys/id> [nombre]");
        process.exit(1);
      }
      const brandId = manager.exportToBrand(target, extra);
      console.log(`✅ Sistema exportado como marca oficial: ${brandId}`);
      break;
    }
    default:
      console.log("Comandos disponibles: list, apply, scaffold, brand");
  }
}
