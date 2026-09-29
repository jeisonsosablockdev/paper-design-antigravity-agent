import * as fs from "node:fs";
import * as path from "node:path";
import { computeBrandStateHash } from "./brand-hasher.ts";

export interface BrandMeta {
  id: string;
  name: string;
  description: string;
  basePreset: string;
  paperPage: string;
  stateHash: string;
  createdAt: string;
  updatedAt: string;
}

export interface BrandsRegistry {
  $schema: string;
  activeBrand: string;
  brands: Record<string, BrandMeta>;
}

export interface BrandPaths {
  dir: string;
  meta: string;
  design: string;
  inbox: string;
  assets: string;
  tokens: {
    colors: string;
    typography: string;
    spacing: string;
  };
}

export class BrandManager {
  private workspaceRoot: string;
  private registryPath: string;

  constructor(workspaceRoot = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
    this.registryPath = path.join(this.workspaceRoot, "brands.json");
  }

  // Carga el registro maestro brands.json
  public loadRegistry(): BrandsRegistry {
    if (!fs.existsSync(this.registryPath)) {
      throw new Error(`Registro de marcas no encontrado en: ${this.registryPath}`);
    }
    return JSON.parse(fs.readFileSync(this.registryPath, "utf8"));
  }

  // Guarda el registro maestro brands.json
  public saveRegistry(registry: BrandsRegistry): void {
    fs.writeFileSync(this.registryPath, JSON.stringify(registry, null, 2) + "\n", "utf8");
  }

  // Resuelve las rutas absolutas para una marca
  public getBrandPaths(brandId: string): BrandPaths {
    const brandDir = path.join(this.workspaceRoot, "brands", brandId);
    return {
      dir: brandDir,
      meta: path.join(brandDir, "brand.json"),
      design: path.join(brandDir, "DESIGN.md"),
      inbox: path.join(brandDir, "inbox"),
      assets: path.join(brandDir, "assets"),
      tokens: {
        colors: path.join(brandDir, "tokens", "colors.json"),
        typography: path.join(brandDir, "tokens", "typography.json"),
        spacing: path.join(brandDir, "tokens", "spacing.json")
      }
    };
  }

  // Lista los archivos pendientes de digestión en el inbox de una marca
  public getInboxFiles(brandId: string): string[] {
    const paths = this.getBrandPaths(brandId);
    if (!fs.existsSync(paths.inbox)) return [];
    return fs.readdirSync(paths.inbox).filter(f => f !== ".gitkeep" && f !== "README.md" && !f.startsWith("."));
  }

  // Obtiene los metadatos de la marca activa
  public getActiveBrand(): { meta: BrandMeta; paths: BrandPaths } {
    const registry = this.loadRegistry();
    const activeId = registry.activeBrand;
    const meta = registry.brands[activeId];
    if (!meta) {
      throw new Error(`La marca activa '${activeId}' no está registrada en brands.json`);
    }
    return { meta, paths: this.getBrandPaths(activeId) };
  }

  // Lista todas las marcas registradas
  public listBrands(): BrandMeta[] {
    const registry = this.loadRegistry();
    return Object.values(registry.brands);
  }

  /**
   * Conmuta la marca activa de forma IDEMPOTENTE.
   * Si la marca ya está activa y su stateHash en disco no ha cambiado, retorna noop: true.
   */
  public switchBrand(brandId: string, options: { force?: boolean } = {}): {
    changed: boolean;
    noop: boolean;
    brand: BrandMeta;
    previousBrand?: string;
  } {
    const registry = this.loadRegistry();
    const targetBrand = registry.brands[brandId];

    if (!targetBrand) {
      const available = Object.keys(registry.brands).join(", ");
      throw new Error(`Marca '${brandId}' no encontrada. Disponibles: ${available}`);
    }

    const paths = this.getBrandPaths(brandId);
    const currentHash = computeBrandStateHash(paths.dir);

    // Verificación de Idempotencia
    const isAlreadyActive = registry.activeBrand === brandId;
    const isHashUnchanged = targetBrand.stateHash === currentHash;

    if (isAlreadyActive && isHashUnchanged && !options.force) {
      return {
        changed: false,
        noop: true,
        brand: targetBrand
      };
    }

    const previousBrand = registry.activeBrand;

    // Actualizar registro
    targetBrand.stateHash = currentHash;
    targetBrand.updatedAt = new Date().toISOString();
    registry.activeBrand = brandId;
    this.saveRegistry(registry);

    // Sincronizar tokens activos en design-system/tokens/ para observabilidad directa
    this.mirrorActiveTokens(paths);

    return {
      changed: true,
      noop: false,
      brand: targetBrand,
      previousBrand
    };
  }

  /**
   * Crea una nueva marca de forma IDEMPOTENTE.
   * Si ya existe, falla de forma segura para evitar sobreescritura accidental.
   */
  public createBrand(options: {
    id: string;
    name: string;
    description?: string;
    basePreset?: string;
    paperPage?: string;
  }): BrandMeta {
    const { id, name, description = "", basePreset = "linear", paperPage } = options;

    if (!/^[a-z0-9-]+$/.test(id)) {
      throw new Error(`ID de marca inválido '${id}'. Debe ser kebab-case (letras minúsculas, números y guiones).`);
    }

    const registry = this.loadRegistry();
    if (registry.brands[id]) {
      throw new Error(`La marca '${id}' ya existe en brands.json. Usa switchBrand para seleccionarla.`);
    }

    const paths = this.getBrandPaths(id);
    if (fs.existsSync(paths.dir)) {
      throw new Error(`El directorio brands/${id} ya existe en disco.`);
    }

    // Crear directorios de marca
    fs.mkdirSync(path.join(paths.dir, "tokens"), { recursive: true });
    fs.mkdirSync(path.join(paths.dir, "assets", "logos"), { recursive: true });
    fs.mkdirSync(path.join(paths.dir, "assets", "images"), { recursive: true });
    fs.mkdirSync(path.join(paths.dir, "inbox"), { recursive: true });
    fs.writeFileSync(path.join(paths.dir, "inbox", ".gitkeep"), "");
    fs.writeFileSync(path.join(paths.dir, "assets", "logos", ".gitkeep"), "");
    fs.writeFileSync(path.join(paths.dir, "assets", "images", ".gitkeep"), "");
    fs.writeFileSync(
      path.join(paths.dir, "inbox", "README.md"),
      `# Brand Inbox: ${name}\n\nZona de entrada (*dropzone*) para soltar hojas de estilo (.css, .scss), tokens (.json), logos (.svg), manuales (.md, .txt) o imágenes de referencia.\n\nEjecuta \`pnpm run brand:digest ${id}\` para procesar y asimilar los archivos automáticamente.\n`
    );

    // Cargar tokens base de un preset existente o defaults
    const presetTokens = this.resolvePresetTokens(basePreset);

    // 1. brand.json
    const meta: BrandMeta = {
      id,
      name,
      description,
      basePreset,
      paperPage: paperPage || `${name} Canvas`,
      stateHash: "",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    fs.writeFileSync(paths.meta, JSON.stringify(meta, null, 2) + "\n");

    // 2. DESIGN.md
    const designMd = `# Manifiesto de Diseño: ${name}\n\n${description}\n\n---\n\n## 1. Principios Visuales\n- Preset base: \`${basePreset}\`\n- Página en Paper: \`${meta.paperPage}\`\n`;
    fs.writeFileSync(paths.design, designMd);

    // 3. Tokens
    fs.writeFileSync(paths.tokens.colors, JSON.stringify(presetTokens.colors, null, 2) + "\n");
    fs.writeFileSync(paths.tokens.typography, JSON.stringify(presetTokens.typography, null, 2) + "\n");
    fs.writeFileSync(paths.tokens.spacing, JSON.stringify(presetTokens.spacing, null, 2) + "\n");

    // Calcular hash final
    const stateHash = computeBrandStateHash(paths.dir);
    meta.stateHash = stateHash;

    // Actualizar meta en disco y en registro
    fs.writeFileSync(paths.meta, JSON.stringify(meta, null, 2) + "\n");
    registry.brands[id] = meta;
    this.saveRegistry(registry);

    return meta;
  }

  // Valida la integridad completa del sistema multi-marca
  public validateBrands(): { valid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];
    const registry = this.loadRegistry();

    if (!registry.activeBrand || !registry.brands[registry.activeBrand]) {
      errors.push(`activeBrand '${registry.activeBrand}' no existe en brands.json`);
    }

    for (const [id, brand] of Object.entries(registry.brands)) {
      const paths = this.getBrandPaths(id);

      if (!fs.existsSync(paths.dir)) {
        errors.push(`Marca '${id}': Directorio ${paths.dir} no existe.`);
        continue;
      }
      if (!fs.existsSync(paths.meta)) {
        errors.push(`Marca '${id}': brand.json no existe.`);
      }
      if (!fs.existsSync(paths.design)) {
        errors.push(`Marca '${id}': DESIGN.md no existe.`);
      }
      for (const [tokenName, tokenPath] of Object.entries(paths.tokens)) {
        if (!fs.existsSync(tokenPath)) {
          errors.push(`Marca '${id}': Token ${tokenName} no existe en ${tokenPath}.`);
        } else {
          try {
            JSON.parse(fs.readFileSync(tokenPath, "utf8"));
          } catch {
            errors.push(`Marca '${id}': Token ${tokenName} tiene formato JSON inválido.`);
          }
        }
      }

      // Validar hash
      try {
        const computedHash = computeBrandStateHash(paths.dir);
        if (brand.stateHash && brand.stateHash !== computedHash) {
          warnings.push(`Marca '${id}': Desfase de hash detectado. Registrado: ${brand.stateHash}, Actual: ${computedHash}`);
        }
      } catch (err: unknown) {
        errors.push(`Marca '${id}': Error al calcular hash (${(err as Error).message})`);
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      warnings
    };
  }

  // Prepara los tokens de una marca con espacio de nombres para Paper MCP
  public getScopedTokensForPaper(brandId?: string) {
    const targetId = brandId || this.loadRegistry().activeBrand;
    const paths = this.getBrandPaths(targetId);
    const colors = JSON.parse(fs.readFileSync(paths.tokens.colors, "utf8"));

    const flatTokens: Array<{ name: string; value: string; type: string }> = [];
    function flatten(obj: Record<string, unknown>, prefix = "") {
      for (const [key, value] of Object.entries(obj)) {
        if (typeof value === "string") {
          flatTokens.push({
            name: `brand/${targetId}/${prefix}${key}`,
            value,
            type: "color"
          });
        } else if (typeof value === "object" && value !== null) {
          flatten(value as Record<string, unknown>, `${prefix}${key}/`);
        }
      }
    }

    flatten(colors.colors || colors);
    return flatTokens;
  }

  // Refleja tokens en design-system/tokens/ para visibilidad directa
  private mirrorActiveTokens(paths: BrandPaths) {
    const targetTokensDir = path.join(this.workspaceRoot, "design-system", "tokens");
    fs.mkdirSync(targetTokensDir, { recursive: true });

    fs.copyFileSync(paths.tokens.colors, path.join(targetTokensDir, "colors.json"));
    fs.copyFileSync(paths.tokens.typography, path.join(targetTokensDir, "typography.json"));
    fs.copyFileSync(paths.tokens.spacing, path.join(targetTokensDir, "spacing.json"));
  }

  // Resuelve tokens iniciales a partir de presets existentes
  private resolvePresetTokens(presetKey: string) {
    const defaultSpacing = {
      $schema: "https://json-schema.org/draft/2020-12/schema",
      spacing: { "1": "4px", "2": "8px", "3": "12px", "4": "16px", "6": "24px", "8": "32px", "12": "48px" },
      radii: { sm: "4px", md: "6px", lg: "8px", xl: "12px", pill: "9999px" }
    };

    const presetPath = path.join(this.workspaceRoot, "brands", "linear-tech", "tokens");
    if (fs.existsSync(presetPath)) {
      return {
        colors: JSON.parse(fs.readFileSync(path.join(presetPath, "colors.json"), "utf8")),
        typography: JSON.parse(fs.readFileSync(path.join(presetPath, "typography.json"), "utf8")),
        spacing: defaultSpacing
      };
    }

    return {
      colors: { colors: { primary: { default: "#2563eb" } } },
      typography: { typography: { fontFamilies: { sans: "Inter, sans-serif" } } },
      spacing: defaultSpacing
    };
  }
}

// Ejecución CLI
if (process.argv[1]?.endsWith("brand-manager.ts")) {
  const manager = new BrandManager();
  const command = process.argv[2] || "list";

  try {
    if (command === "list") {
      const registry = manager.loadRegistry();
      console.log("\n\x1b[36m=== GESTOR MULTI-MARCA: PAPER.DESIGN ===\x1b[0m\n");
      console.log(`Marca Activa: \x1b[32m${registry.activeBrand}\x1b[0m\n`);
      for (const brand of Object.values(registry.brands)) {
        const isActive = brand.id === registry.activeBrand ? "● ACTIVA" : "○ inactiva";
        console.log(`  [${isActive}] \x1b[1m${brand.name}\x1b[0m (${brand.id})`);
        console.log(`     Preset: ${brand.basePreset} | Página Paper: "${brand.paperPage}"`);
        console.log(`     Hash: ${brand.stateHash.slice(0, 16)}...\n`);
      }
    } else if (command === "switch") {
      const brandId = process.argv[3];
      if (!brandId) {
        console.error("\x1b[31m[ERROR]\x1b[0m Debes especificar el ID de la marca. Ej: pnpm run brand:switch lumina-pay");
        process.exit(1);
      }
      const force = process.argv.includes("--force");
      const result = manager.switchBrand(brandId, { force });
      if (result.noop) {
        console.log(`\x1b[33m[NO-OP IDEMPOTENTE]\x1b[0m La marca '${brandId}' ya está activa y su hash es idéntico. Cero reescrituras.`);
      } else {
        console.log(`\x1b[32m[MARCA CONMUTADA]\x1b[0m Ahora trabajando con '${result.brand.name}' (${brandId}).`);
        console.log(`- Página en Paper: "${result.brand.paperPage}"`);
        console.log(`- Hash de estado: ${result.brand.stateHash}`);
      }
    } else if (command === "create") {
      const brandId = process.argv[3];
      const brandName = process.argv[4] || brandId;
      const basePreset = process.argv[5] || "linear";
      if (!brandId) {
        console.error("\x1b[31m[ERROR]\x1b[0m Uso: pnpm run brand:create <id> [nombre] [preset]");
        process.exit(1);
      }
      const created = manager.createBrand({ id: brandId, name: brandName, basePreset });
      console.log(`\x1b[32m[MARCA CREADA]\x1b[0m '${created.name}' (${created.id}) inicializada en brands/${created.id}.`);
    } else if (command === "validate") {
      const validation = manager.validateBrands();
      if (!validation.valid) {
        console.error("\x1b[31m[VALIDACIÓN FALLIDA]\x1b[0m Errores encontrados:");
        validation.errors.forEach(e => console.error(`  ❌ ${e}`));
        process.exit(1);
      } else {
        console.log("\x1b[32m[VALIDACIÓN EXITOSA]\x1b[0m Todas las marcas están íntegras.");
        if (validation.warnings.length > 0) {
          validation.warnings.forEach(w => console.warn(`  ⚠️ ${w}`));
        }
      }
    } else {
      console.log("Comandos disponibles: list, switch <id>, create <id> [nombre] [preset], validate");
    }
  } catch (err: unknown) {
    console.error(`\x1b[31m[ERROR]\x1b[0m ${(err as Error).message}`);
    process.exit(1);
  }
}
