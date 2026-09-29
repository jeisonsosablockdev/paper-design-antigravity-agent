import * as fs from "node:fs";
import * as path from "node:path";
import { OpenDesignTokenConverter } from "../../scripts/opendesign/token-converter.ts";
import { PaperHtmlSanitizer } from "../../scripts/opendesign/html-sanitizer.ts";
import { ScreenSpecGenerator } from "../../scripts/opendesign/spec-generator.ts";
import { OpenDesignManager } from "../../scripts/opendesign/od-manager.ts";
import { ScreenSpecSchema } from "../../specs/schemas/screen.schema.ts";

export interface EvalResult {
  suite: string;
  passed: boolean;
  score: number;
  checks: { name: string; passed: boolean; details?: string }[];
}

export function runOpenDesignEval(): EvalResult {
  const checks: { name: string; passed: boolean; details?: string }[] = [];

  // --- 1. Token Converter Test ---
  try {
    const rawTokens = {
      "colors.brand.primary": "#3ECF8E",
      "colors.brand.hover": "#34B27B",
      "colors.background.canvas": "#121212",
      "typography.fontSize.base": "1rem",
      "typography.lineHeight.normal": "1.5rem",
      "typography.letterSpacing.tight": "-0.02em"
    };

    const normalized = OpenDesignTokenConverter.convertFromJson(rawTokens);

    const fontUnitOk = normalized.typography.fontSizes.base === "16px";
    const lhUnitOk = normalized.typography.lineHeights.normal === "24px";
    const lsUnitOk = normalized.typography.letterSpacing.tight === "-0.02em";
    const colorOk = normalized.colors.primary.default === "#3ECF8E";

    checks.push({
      name: "Token Converter: Normalización de unidades (px/em) y colores",
      passed: fontUnitOk && lhUnitOk && lsUnitOk && colorOk,
      details: `fontSize: ${normalized.typography.fontSizes.base}, color: ${normalized.colors.primary.default}`
    });

    // Test CSS Converter
    const cssVars = `
      :root {
        --color-primary: #FF6363;
        --color-bg-canvas: #0D0E11;
        --font-size-lg: 1.125rem;
      }
    `;
    const fromCss = OpenDesignTokenConverter.convertFromCss(cssVars);
    const cssOk = fromCss.colors.primary.default === "#FF6363" && fromCss.typography.fontSizes.lg === "18px";
    checks.push({
      name: "Token Converter: Ingesta de variables CSS :root",
      passed: cssOk,
      details: `primary: ${fromCss.colors.primary.default}, fontSize.lg: ${fromCss.typography.fontSizes.lg}`
    });

    const mcpTokens = OpenDesignTokenConverter.toPaperMcpTokens(normalized);
    checks.push({
      name: "Token Converter: Salida plana para Paper MCP set_tokens",
      passed: Object.keys(mcpTokens).length > 10 && Boolean(mcpTokens["colors.primary.default"]),
      details: `Total keys generadas: ${Object.keys(mcpTokens).length}`
    });
  } catch (err: any) {
    checks.push({ name: "Token Converter Exception", passed: false, details: err.message });
  }

  // --- 2. HTML Sanitizer Test ---
  try {
    const dirtyHtml = `
      <section style="height: 100vh; min-height: 100vh;">
        <script>alert('hack');</script>
        <button onclick="doAction()">Enviar</button>
        <div class="avatar-icon" style="width: 32px;"></div>
        <iframe src="https://example.com"></iframe>
        <span style="font-size: 1.5rem; line-height: 2rem;">Texto</span>
      </section>
    `;

    const sanitized = PaperHtmlSanitizer.sanitize(dirtyHtml);

    const noScript = !sanitized.includes("<script") && !sanitized.includes("alert");
    const noIframe = !sanitized.includes("<iframe");
    const noOnclick = !sanitized.includes("onclick");
    const hasFlexShrinkButton = sanitized.includes('<button style="flex-shrink: 0;"');
    const hasFlexShrinkIcon = sanitized.includes('style="flex-shrink: 0; width: 32px;"') || sanitized.includes('flex-shrink: 0;');
    const heightAdapted = sanitized.includes("height: fit-content;");
    const remToPxAdapted = sanitized.includes("font-size: 24px;") && sanitized.includes("line-height: 32px;");

    checks.push({
      name: "HTML Sanitizer: Eliminación de scripts, iframes y onclick",
      passed: noScript && noIframe && noOnclick
    });

    checks.push({
      name: "HTML Sanitizer: Inyección de flex-shrink: 0 en elementos fijos",
      passed: hasFlexShrinkButton && hasFlexShrinkIcon
    });

    checks.push({
      name: "HTML Sanitizer: Adaptación de 100vh a fit-content y rem a px",
      passed: heightAdapted && remToPxAdapted
    });

    // Test Chunk Splitter
    const multiSectionHtml = `
      <header><h1>Barra</h1></header>
      <main><p>Contenido</p></main>
      <footer><span>Pie</span></footer>
    `;
    const chunks = PaperHtmlSanitizer.splitIntoCohesiveChunks(multiSectionHtml);
    checks.push({
      name: "HTML Sanitizer: Fraccionamiento modular para write_html",
      passed: chunks.length === 3,
      details: `Fragmentos divididos: ${chunks.length}`
    });
  } catch (err: any) {
    checks.push({ name: "HTML Sanitizer Exception", passed: false, details: err.message });
  }

  // --- 3. Spec Generator Test ---
  try {
    const generatedSpec = ScreenSpecGenerator.generateSpec({
      id: "screen-eval-test",
      title: "Pantalla de Evaluación",
      description: "Prueba de generación de especificaciones de pantalla"
    });

    const parsed = ScreenSpecSchema.parse(generatedSpec);
    const tsCode = ScreenSpecGenerator.toTypeScript(parsed);

    checks.push({
      name: "Spec Generator: Validación estricta con ScreenSpecSchema",
      passed: parsed.id === "screen-eval-test" && parsed.components.length > 0 && parsed.acceptanceCriteria.length >= 3
    });

    checks.push({
      name: "Spec Generator: Generación de código TypeScript válido",
      passed: tsCode.includes("templateScreenSpec: ScreenSpec = ScreenSpecSchema.parse")
    });
  } catch (err: any) {
    checks.push({ name: "Spec Generator Exception", passed: false, details: err.message });
  }

  // --- 4. OpenDesign Manager Integration Test ---
  try {
    const manager = new OpenDesignManager();
    const catalog = manager.listCatalog();

    const hasSystems = catalog.some((c) => c.category === "system" && c.id === "supabase");
    const hasScreens = catalog.some((c) => c.category === "screen" && c.id === "dating-web");
    const hasEngines = catalog.some((c) => c.category === "engine" && c.id === "deck-framework");

    checks.push({
      name: "Catalog Manager: Disponibilidad de sistemas, pantallas y motores",
      passed: hasSystems && hasScreens && hasEngines,
      details: `Total activos en catálogo: ${catalog.length}`
    });

    // Test apply system con respaldo y restauración idempotente
    const activeColorsPath = path.join(process.cwd(), "design-system", "tokens", "colors.json");
    const activeTypoPath = path.join(process.cwd(), "design-system", "tokens", "typography.json");
    const activeSpacingPath = path.join(process.cwd(), "design-system", "tokens", "spacing.json");
    const activeDesignPath = path.join(process.cwd(), "design-system", "active", "DESIGN.md");

    const backupColors = fs.readFileSync(activeColorsPath, "utf8");
    const backupTypo = fs.readFileSync(activeTypoPath, "utf8");
    const backupSpacing = fs.readFileSync(activeSpacingPath, "utf8");
    const backupDesign = fs.existsSync(activeDesignPath) ? fs.readFileSync(activeDesignPath, "utf8") : "";

    try {
      const applyRes = manager.applySystem("od:sys/supabase");
      checks.push({
        name: "Catalog Manager: Aplicación de sistema al canvas activo",
        passed: applyRes.paperTokensCount > 20 && applyRes.appliedUrn === "od:sys/supabase",
        details: `Tokens exportados: ${applyRes.paperTokensCount}`
      });
    } finally {
      fs.writeFileSync(activeColorsPath, backupColors, "utf8");
      fs.writeFileSync(activeTypoPath, backupTypo, "utf8");
      fs.writeFileSync(activeSpacingPath, backupSpacing, "utf8");
      if (backupDesign) fs.writeFileSync(activeDesignPath, backupDesign, "utf8");
    }

    // Test scaffold screen
    const scaffoldRes = manager.scaffoldScreen("od:screen/gamified-app", "temp-eval-screen");
    const scaffoldOk = fs.existsSync(scaffoldRes.specPath);
    if (scaffoldOk) {
      fs.unlinkSync(scaffoldRes.specPath); // Limpieza inmediata
    }
    checks.push({
      name: "Catalog Manager: Scaffolding de pantalla a specs/screens/",
      passed: scaffoldOk
    });
  } catch (err: any) {
    checks.push({ name: "Catalog Manager Exception", passed: false, details: err.message });
  }

  const passedCount = checks.filter((c) => c.passed).length;
  const score = (passedCount / checks.length) * 10;
  const passed = score >= 9.0;

  return {
    suite: "OpenDesign Integration Eval",
    passed,
    score: Math.round(score * 10) / 10,
    checks
  };
}

// Ejecución directa
if (process.argv[1] && process.argv[1].endsWith("opendesign.eval.ts")) {
  const result = runOpenDesignEval();
  console.log(`\n[${result.suite}] Pasó: ${result.passed}, Score: ${result.score}/10`);
  for (const c of result.checks) {
    const icon = c.passed ? "  ✅" : "  ❌";
    console.log(`${icon} ${c.name}${c.details ? ` (${c.details})` : ""}`);
  }
  if (!result.passed) {
    process.exit(1);
  }
}
