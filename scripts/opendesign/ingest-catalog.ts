import * as fs from "node:fs";
import * as path from "node:path";
import { OpenDesignTokenConverter, type NormalizedPaperTokens } from "./token-converter.ts";
import { PaperHtmlSanitizer } from "./html-sanitizer.ts";
import { ScreenSpecGenerator } from "./spec-generator.ts";

export interface CatalogItemMeta {
  id: string;
  name: string;
  category: "system" | "screen" | "engine";
  urn: string;
  description: string;
  sourceUrl?: string;
}

export class OpenDesignCatalogIngestor {
  private workspaceRoot: string;
  private catalogDir: string;
  private screensDir: string;
  private enginesDir: string;

  constructor(workspaceRoot = process.cwd()) {
    this.workspaceRoot = workspaceRoot;
    this.catalogDir = path.join(this.workspaceRoot, "design-system", "catalog");
    this.screensDir = path.join(this.workspaceRoot, "templates", "screens");
    this.enginesDir = path.join(this.workspaceRoot, "templates", "engines");
    this.ensureDirectories();
  }

  private ensureDirectories(): void {
    if (!fs.existsSync(this.catalogDir)) fs.mkdirSync(this.catalogDir, { recursive: true });
    if (!fs.existsSync(this.screensDir)) fs.mkdirSync(this.screensDir, { recursive: true });
    if (!fs.existsSync(this.enginesDir)) fs.mkdirSync(this.enginesDir, { recursive: true });
  }

  /**
   * Ingesta un Design System en design-system/catalog/{id}
   */
  public ingestDesignSystem(
    id: string,
    data: {
      name: string;
      description: string;
      designMd: string;
      tokens?: Record<string, any>;
      tokensCss?: string;
      componentsHtml?: string;
    }
  ): void {
    const sysDir = path.join(this.catalogDir, id);
    if (!fs.existsSync(sysDir)) fs.mkdirSync(sysDir, { recursive: true });

    // Normalizar tokens
    let normalizedTokens: NormalizedPaperTokens;
    if (data.tokens) {
      normalizedTokens = OpenDesignTokenConverter.convertFromJson(data.tokens);
    } else if (data.tokensCss) {
      normalizedTokens = OpenDesignTokenConverter.convertFromCss(data.tokensCss);
    } else {
      normalizedTokens = OpenDesignTokenConverter.convertFromJson({});
    }

    // Sanitizar componentes si existen
    const sanitizedHtml = data.componentsHtml
      ? PaperHtmlSanitizer.sanitize(data.componentsHtml)
      : "<!-- Componentes del sistema -->";

    // Guardar archivos
    fs.writeFileSync(path.join(sysDir, "DESIGN.md"), data.designMd.trim() + "\n", "utf8");
    fs.writeFileSync(path.join(sysDir, "tokens.json"), JSON.stringify(normalizedTokens, null, 2) + "\n", "utf8");
    fs.writeFileSync(path.join(sysDir, "components.html"), sanitizedHtml + "\n", "utf8");

    const manifest: CatalogItemMeta = {
      id,
      name: data.name,
      category: "system",
      urn: `od:sys/${id}`,
      description: data.description,
      sourceUrl: `https://github.com/nexu-io/open-design/tree/main/design-systems/${id}`
    };
    fs.writeFileSync(path.join(sysDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
  }

  /**
   * Ingesta un Template de Pantalla en templates/screens/{id}
   */
  public ingestScreenTemplate(
    id: string,
    data: {
      name: string;
      description: string;
      skillMd: string;
      rawHtml: string;
      viewport?: { width: number; height: number; device: string };
    }
  ): void {
    const screenDir = path.join(this.screensDir, id);
    if (!fs.existsSync(screenDir)) fs.mkdirSync(screenDir, { recursive: true });

    // 1. Guardar SKILL.md
    fs.writeFileSync(path.join(screenDir, "SKILL.md"), data.skillMd.trim() + "\n", "utf8");

    // 2. Guardar example.html original
    fs.writeFileSync(path.join(screenDir, "example.html"), data.rawHtml.trim() + "\n", "utf8");

    // 3. Sanitizar y adaptar para Paper MCP canvas
    const canvasHtml = PaperHtmlSanitizer.sanitize(data.rawHtml, {
      ensureFlexShrinkOnFixed: true,
      normalizeUnitsToPx: true,
      replaceImagesWithPaperGen: true
    });
    fs.writeFileSync(path.join(screenDir, "canvas-template.html"), canvasHtml + "\n", "utf8");

    // 4. Generar contrato Spec-Driven Development (template.spec.ts)
    const spec = ScreenSpecGenerator.generateSpec({
      id: `screen-od-${id}`,
      title: data.name,
      description: data.description,
      viewport: data.viewport
    });
    const specTs = ScreenSpecGenerator.toTypeScript(spec);
    fs.writeFileSync(path.join(screenDir, "template.spec.ts"), specTs, "utf8");

    // 5. Manifest
    const manifest: CatalogItemMeta = {
      id,
      name: data.name,
      category: "screen",
      urn: `od:screen/${id}`,
      description: data.description,
      sourceUrl: `https://github.com/nexu-io/open-design/tree/main/design-templates/${id}`
    };
    fs.writeFileSync(path.join(screenDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
  }

  /**
   * Ingesta un Motor de Templates en templates/engines/{id}
   */
  public ingestEngine(
    id: string,
    data: {
      name: string;
      description: string;
      templateHtml: string;
      rulesMd?: string;
    }
  ): void {
    const engDir = path.join(this.enginesDir, id);
    if (!fs.existsSync(engDir)) fs.mkdirSync(engDir, { recursive: true });

    fs.writeFileSync(path.join(engDir, "framework.html"), data.templateHtml.trim() + "\n", "utf8");
    if (data.rulesMd) {
      fs.writeFileSync(path.join(engDir, "README.md"), data.rulesMd.trim() + "\n", "utf8");
    }

    const manifest: CatalogItemMeta = {
      id,
      name: data.name,
      category: "engine",
      urn: `od:engine/${id}`,
      description: data.description,
      sourceUrl: `https://github.com/nexu-io/open-design/tree/main/templates/${id}`
    };
    fs.writeFileSync(path.join(engDir, "manifest.json"), JSON.stringify(manifest, null, 2) + "\n", "utf8");
  }

  /**
   * Carga e instala los conjuntos iniciales de sistemas y plantillas
   */
  public seedCoreCatalog(): void {
    // 1. Ingestar Sistemas de Diseño Clave
    this.ingestDesignSystem("supabase", {
      name: "Supabase Design System",
      description: "Estética técnica developer-first, fondo obsidian profundo, acento verde esmeralda y alto contraste de código.",
      designMd: `# Supabase Design System (od:sys/supabase)

## 1. Principios Visuales
- **Modo Oscuro Técnico**: Fondo obsidian (#121212) con superficies elevadas (#1C1C1C) y bordes de precisión (#2E2E2E).
- **Acento Esmeralda**: Color primario #3ECF8E, energizante y enfocado en acciones de bases de datos.
- **Tipografía**: Inter para UI y JetBrains Mono para fragmentos SQL y claves API.
`,
      tokens: {
        "colors.primary.default": "#3ECF8E",
        "colors.primary.hover": "#34B27B",
        "colors.primary.subtle": "rgba(62, 207, 142, 0.15)",
        "colors.background.canvas": "#121212",
        "colors.background.surface": "#1C1C1C",
        "colors.background.elevated": "#242424",
        "colors.text.primary": "#EDEDED",
        "colors.text.secondary": "#A0A0A0",
        "colors.text.muted": "#707070",
        "colors.text.inverse": "#121212",
        "colors.border.subtle": "rgba(255, 255, 255, 0.08)",
        "colors.border.default": "rgba(255, 255, 255, 0.14)",
        "colors.border.strong": "#3ECF8E"
      }
    });

    this.ingestDesignSystem("notion", {
      name: "Notion Editorial System",
      description: "Estética documental clara, paleta cálida, bordes ultra sutiles y enfoque en legibilidad de texto largo.",
      designMd: `# Notion Editorial System (od:sys/notion)

## 1. Principios Visuales
- **Minimalismo Documental**: Fondos cálidos marfil (#FFFFFF / #F7F6F3), texto oscuro (#37352F).
- **Acentos Neutros**: Menús y llamadas con colores tierra pastel (rojo suave, azul hielo, ámbar).
- **Tipografía**: Sans limpio para organización y Serif para artículos.
`,
      tokens: {
        "colors.primary.default": "#2EAADC",
        "colors.primary.hover": "#1F89B5",
        "colors.primary.subtle": "#EDF7FB",
        "colors.background.canvas": "#FFFFFF",
        "colors.background.surface": "#F7F6F3",
        "colors.background.elevated": "#FFFFFF",
        "colors.text.primary": "#37352F",
        "colors.text.secondary": "#787774",
        "colors.text.muted": "#9B9A97",
        "colors.text.inverse": "#FFFFFF",
        "colors.border.subtle": "rgba(55, 53, 47, 0.09)",
        "colors.border.default": "rgba(55, 53, 47, 0.16)",
        "colors.border.strong": "#37352F"
      }
    });

    this.ingestDesignSystem("shadcn", {
      name: "Shadcn Neutral Craft",
      description: "Diseño minimalista zinc/neutral, bordes nítidos de 1px, badges compactos y accesibilidad nativa Radix.",
      designMd: `# Shadcn UI System (od:sys/shadcn)

## 1. Principios Visuales
- **Zinc Palette**: Escala neutral de grises balanceados (zinc-900 a zinc-50).
- **Bordes Nítidos**: Separadores de 1px con opacidades calculadas.
`,
      tokens: {
        "colors.primary.default": "#18181B",
        "colors.primary.hover": "#27272A",
        "colors.primary.subtle": "#F4F4F5",
        "colors.background.canvas": "#FFFFFF",
        "colors.background.surface": "#FAFAFA",
        "colors.background.elevated": "#FFFFFF",
        "colors.text.primary": "#09090B",
        "colors.text.secondary": "#71717A",
        "colors.text.muted": "#A1A1AA",
        "colors.text.inverse": "#FFFFFF",
        "colors.border.subtle": "#F4F4F5",
        "colors.border.default": "#E4E4E7",
        "colors.border.strong": "#18181B"
      }
    });

    this.ingestDesignSystem("raycast", {
      name: "Raycast Command Palette",
      description: "Paleta ultra rápida, fondos carbón, acento carmesí neón y atajos de teclado visuales.",
      designMd: `# Raycast Design System (od:sys/raycast)

## 1. Principios Visuales
- **Carbón Profundo**: Fondo #0D0E11 con modales translúcidos #1A1C22.
- **Acento Rojo Raycast**: #FF6363 de alto impacto para selecciones activas.
`,
      tokens: {
        "colors.primary.default": "#FF6363",
        "colors.primary.hover": "#FF7A7A",
        "colors.primary.subtle": "rgba(255, 99, 99, 0.15)",
        "colors.background.canvas": "#0D0E11",
        "colors.background.surface": "#1A1C22",
        "colors.background.elevated": "#23262E",
        "colors.text.primary": "#FFFFFF",
        "colors.text.secondary": "#8B909A",
        "colors.text.muted": "#565A64",
        "colors.text.inverse": "#0D0E11",
        "colors.border.subtle": "rgba(255, 255, 255, 0.08)",
        "colors.border.default": "rgba(255, 255, 255, 0.15)",
        "colors.border.strong": "#FF6363"
      }
    });

    // 2. Ingestar Plantillas de Pantalla (Screen Templates)
    this.ingestScreenTemplate("dating-web", {
      name: "Dating Web Experience",
      description: "Layout editorial de citas con scroll horizontal, perfiles ricos, badges de compatibilidad e interacción táctil.",
      skillMd: `# Dating Web Screen Skill (od:screen/dating-web)

## Anatomía
1. **Header Minimalista**: Logo de marca, avatar de usuario y selector de filtros.
2. **Tarjeta de Perfil**: Foto principal a sangre con ratio 3:4, overlay degradado y detalles biográficos.
3. **Barra de Acciones Flotante**: Botones de rechazar, super-like y match con alturas táctiles >= 56px.
`,
      rawHtml: `<section class="dating-screen" style="display: flex; flex-direction: column; width: 390px; height: 100vh; background: #0A0A0C; color: #FFFFFF; font-family: Inter, sans-serif;">
  <header style="display: flex; align-items: center; justify-content: space-between; padding: 16px 20px;">
    <span style="font-weight: 700; font-size: 1.25rem;">Flame</span>
    <div class="avatar" style="width: 36px; height: 36px; border-radius: 50%; background: #333;"></div>
  </header>
  <main style="flex: 1; padding: 10px 20px; display: flex; flex-direction: column;">
    <div class="card" style="flex: 1; border-radius: 20px; background: #18181B; position: relative; overflow: hidden;">
      <div style="position: absolute; bottom: 0; left: 0; right: 0; padding: 20px; background: linear-gradient(transparent, rgba(0,0,0,0.85));">
        <h2 style="font-size: 1.5rem; margin: 0;">Elena, 26</h2>
        <p style="font-size: 0.875rem; color: #A1A1AA; margin: 4px 0 12px;">Diseñadora UI · San Francisco</p>
      </div>
    </div>
  </main>
  <footer style="display: flex; justify-content: center; gap: 20px; padding: 16px 20px 24px;">
    <button style="width: 56px; height: 56px; border-radius: 50%; border: 1px solid #333; background: #141416; color: #EF4444; font-size: 20px;">✕</button>
    <button style="width: 56px; height: 56px; border-radius: 50%; border: none; background: #EC4899; color: #FFFFFF; font-size: 20px;">♥</button>
  </footer>
</section>`,
      viewport: { width: 390, height: 844, device: "iPhone 15" }
    });

    this.ingestScreenTemplate("gamified-app", {
      name: "Gamified Learning App",
      description: "Interfaz lúdica de aprendizaje con barras de XP, rachas de días, misiones completadas y avatares 3D.",
      skillMd: `# Gamified Learning Screen (od:screen/gamified-app)

## Anatomía
1. **Barra de Progreso**: Indicador de nivel, gemas y racha activa en píxeles.
2. **Módulos de Misión**: Lista de retos interactivos con check accesible y estados desbloqueados.
3. **Botón de Continuar**: Tap target mínimo de 52px con estado pressed responsivo.
`,
      rawHtml: `<section class="gamified-container" style="display: flex; flex-direction: column; width: 390px; height: 100vh; background: #0F172A; color: #F8FAFC; font-family: Inter, sans-serif; padding: 20px;">
  <header style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
    <div style="display: flex; align-items: center; gap: 8px;">
      <span class="badge" style="background: #F59E0B; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">🔥 14 Días</span>
    </div>
    <div style="display: flex; align-items: center; gap: 8px;">
      <span class="badge" style="background: #3B82F6; padding: 4px 10px; border-radius: 12px; font-size: 12px; font-weight: 700;">💎 450 XP</span>
    </div>
  </header>
  <main style="display: flex; flex-direction: column; gap: 16px; flex: 1;">
    <div class="card" style="background: #1E293B; border-radius: 16px; padding: 18px; border: 1px solid rgba(255,255,255,0.08);">
      <h3 style="margin: 0 0 8px; font-size: 1.125rem;">Misión Diaria: CSS Flexbox</h3>
      <p style="margin: 0 0 12px; color: #94A3B8; font-size: 0.875rem;">Completa 3 ejercicios prácticos de alineación</p>
      <div style="height: 8px; background: #334155; border-radius: 4px; overflow: hidden;">
        <div style="width: 66%; height: 100%; background: #10B981;"></div>
      </div>
    </div>
  </main>
  <button style="height: 52px; background: #22C55E; color: #052E16; border: none; border-radius: 14px; font-weight: 700; font-size: 1rem; width: 100%;">
    Continuar Aprendizaje
  </button>
</section>`,
      viewport: { width: 390, height: 844, device: "iPhone 15" }
    });

    this.ingestScreenTemplate("live-dashboard", {
      name: "Live Operations Dashboard",
      description: "Tablero de métricas en tiempo real con tarjetas de KPI, gráficos de tendencia, estado de servidores y lista de eventos.",
      skillMd: `# Live Dashboard Screen (od:screen/live-dashboard)

## Anatomía
1. **Sidebar / Nav**: Navegación lateral con accesos rápidos y estado del sistema.
2. **KPI Grid**: 4 métricas clave con valor numérico en titulares mono, porcentaje de cambio y badge de estado.
3. **Panel de Eventos**: Lista de transacciones y logs con marcas de tiempo relativas.
`,
      rawHtml: `<div class="dashboard-wrapper" style="display: flex; width: 1440px; min-height: 100vh; background: #0B0F17; color: #E2E8F0; font-family: Inter, sans-serif;">
  <aside style="width: 240px; border-right: 1px solid #1E293B; padding: 24px; display: flex; flex-direction: column; gap: 20px;">
    <h2 style="font-size: 18px; font-weight: 700; color: #38BDF8; margin: 0;">PulseOps</h2>
    <nav style="display: flex; flex-direction: column; gap: 8px;">
      <a href="#" style="color: #F8FAFC; text-decoration: none; padding: 8px 12px; background: #1E293B; border-radius: 8px; font-size: 14px;">Métricas</a>
      <a href="#" style="color: #94A3B8; text-decoration: none; padding: 8px 12px; border-radius: 8px; font-size: 14px;">Servidores</a>
      <a href="#" style="color: #94A3B8; text-decoration: none; padding: 8px 12px; border-radius: 8px; font-size: 14px;">Incidentes</a>
    </nav>
  </aside>
  <main style="flex: 1; padding: 32px; display: flex; flex-direction: column; gap: 24px;">
    <header style="display: flex; justify-content: space-between; align-items: center;">
      <div>
        <h1 style="font-size: 24px; font-weight: 700; margin: 0;">Centro de Operaciones</h1>
        <p style="color: #64748B; margin: 4px 0 0; font-size: 14px;">Telemetría en vivo del clúster de producción</p>
      </div>
      <button style="height: 40px; padding: 0 16px; background: #0284C7; color: #FFFFFF; border: none; border-radius: 8px; font-weight: 600;">Descargar Reporte</button>
    </header>
    <div class="kpi-grid" style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px;">
      <div class="card" style="background: #111827; border: 1px solid #1F2937; border-radius: 12px; padding: 18px;">
        <span style="font-size: 12px; color: #9CA3AF;">Tiempo de Respuesta</span>
        <div style="font-size: 24px; font-weight: 700; margin-top: 6px; font-family: monospace;">42ms</div>
      </div>
      <div class="card" style="background: #111827; border: 1px solid #1F2937; border-radius: 12px; padding: 18px;">
        <span style="font-size: 12px; color: #9CA3AF;">Uptime Mensual</span>
        <div style="font-size: 24px; font-weight: 700; margin-top: 6px; font-family: monospace; color: #10B981;">99.98%</div>
      </div>
      <div class="card" style="background: #111827; border: 1px solid #1F2937; border-radius: 12px; padding: 18px;">
        <span style="font-size: 12px; color: #9CA3AF;">Peticiones / seg</span>
        <div style="font-size: 24px; font-weight: 700; margin-top: 6px; font-family: monospace;">18.4K</div>
      </div>
      <div class="card" style="background: #111827; border: 1px solid #1F2937; border-radius: 12px; padding: 18px;">
        <span style="font-size: 12px; color: #9CA3AF;">Tasa de Error</span>
        <div style="font-size: 24px; font-weight: 700; margin-top: 6px; font-family: monospace; color: #F59E0B;">0.012%</div>
      </div>
    </div>
  </main>
</div>`,
      viewport: { width: 1440, height: 900, device: "Desktop Monitor" }
    });

    // 3. Ingestar Motores de Decks / Templates
    this.ingestEngine("deck-framework", {
      name: "Presentation Deck Framework",
      description: "Framework base para presentaciones de diapositivas en formato 16:9 con soporte para miniaturas y notas.",
      rulesMd: `# Deck Framework (od:engine/deck-framework)

## Reglas para Paper MCP
- Cada diapositiva corresponde a un artboard independiente de 1920x1080 o 1440x810.
- La tipografía debe mantener proporciones legibles desde proyectores (titulares >= 48px).
`,
      templateHtml: `<div class="slide" style="width: 1920px; height: 1080px; background: #0A0A0C; color: #FFFFFF; display: flex; flex-direction: column; justify-content: center; padding: 120px; font-family: Inter, sans-serif;">
  <span style="color: #6366F1; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-size: 20px; margin-bottom: 24px;">Keynote 2026</span>
  <h1 style="font-size: 80px; font-weight: 800; line-height: 1.1; margin: 0 0 32px; max-width: 1200px;">El Futuro del Diseño Autónomo con Agentes de Código</h1>
  <p style="font-size: 32px; color: #94A3B8; max-width: 900px; line-height: 1.4; margin: 0;">Sincronización en tiempo real entre especificaciones tipadas y el lienzo nativo de Paper.</p>
</div>`
    });

    this.ingestEngine("kami-deck", {
      name: "Kami Editorial Deck",
      description: "Plantilla de diapositivas con maquetación de revista editorial de lujo, grillas suizas y contrastes fotográficos.",
      rulesMd: `# Kami Deck (od:engine/kami-deck)

## Reglas Visuales
- Basado en asimetría elegante y tipografía de alto contraste (Sans bold + Serif subtítulos).
`,
      templateHtml: `<div class="kami-slide" style="width: 1920px; height: 1080px; background: #FFFFFF; color: #111111; display: grid; grid-template-columns: 1fr 1fr; padding: 100px; gap: 80px; font-family: 'Helvetica Neue', Helvetica, sans-serif;">
  <div style="display: flex; flex-direction: column; justify-content: space-between;">
    <span style="font-size: 16px; font-weight: 700; letter-spacing: 0.2em; text-transform: uppercase;">01 / VISIÓN EDITORIAL</span>
    <div>
      <h2 style="font-size: 64px; font-weight: 900; line-height: 1.05; margin: 0 0 24px;">REDEFINIENDO EL LIENZO DIGITAL</h2>
      <p style="font-size: 20px; line-height: 1.6; color: #555555; margin: 0;">La artesanía tipográfica y la precisión modular convergen para entregar interfaces que desafían la mediocridad algorítmica.</p>
    </div>
    <div style="font-size: 14px; color: #888888;">EDICIÓN ESPECIAL · OTOÑO 2026</div>
  </div>
  <div style="background: #F4F4F4; border-radius: 12px; display: flex; align-items: center; justify-content: center;">
    <img src="paper-gen://recraft-v4-1?prompt=Minimalist%20architectural%20geometry%20concrete%20pure%20light&aspect_ratio=1:1" style="width: 80%; height: auto; border-radius: 8px;" alt="Visual editorial" />
  </div>
</div>`
    });

    this.ingestEngine("live-brief", {
      name: "Live Operations Brief Artifact",
      description: "Artefacto dinámico de sala de decisiones para revisiones ejecutivas y KPIs clave.",
      templateHtml: `<div class="live-brief" style="width: 100%; max-width: 1200px; padding: 32px; background: #161B22; border: 1px solid #30363D; border-radius: 12px; color: #C9D1D9; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;">
  <header style="border-bottom: 1px solid #30363D; padding-bottom: 20px; margin-bottom: 24px; display: flex; justify-content: space-between; align-items: center;">
    <div>
      <h2 style="color: #F0F6FC; margin: 0 0 6px; font-size: 22px;">Brief Ejecutivo de Operaciones</h2>
      <span style="font-size: 13px; color: #8B949E;">Sincronizado hace 2 minutos · Estado Nominal</span>
    </div>
    <span style="background: rgba(46, 160, 67, 0.15); color: #3FB950; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 600; border: 1px solid rgba(46, 160, 67, 0.4);">OPERATIVO</span>
  </header>
  <div style="display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px;">
    <div style="background: #0D1117; padding: 16px; border-radius: 8px; border: 1px solid #21262D;">
      <div style="font-size: 12px; color: #8B949E;">Presupuesto de Error</div>
      <div style="font-size: 28px; font-weight: 700; color: #58A6FF; margin: 8px 0 4px;">99.4%</div>
      <span style="font-size: 12px; color: #3FB950;">+0.2% vs objetivo</span>
    </div>
    <div style="background: #0D1117; padding: 16px; border-radius: 8px; border: 1px solid #21262D;">
      <div style="font-size: 12px; color: #8B949E;">Incidencias Abiertas</div>
      <div style="font-size: 28px; font-weight: 700; color: #F0F6FC; margin: 8px 0 4px;">0</div>
      <span style="font-size: 12px; color: #8B949E;">Ninguna activa</span>
    </div>
    <div style="background: #0D1117; padding: 16px; border-radius: 8px; border: 1px solid #21262D;">
      <div style="font-size: 12px; color: #8B949E;">Flujo de Despliegues</div>
      <div style="font-size: 28px; font-weight: 700; color: #3FB950; margin: 8px 0 4px;">42</div>
      <span style="font-size: 12px; color: #8B949E;">Últimas 24 horas</span>
    </div>
  </div>
</div>`
    });
  }

  /**
   * Descarga un Design System directamente desde el repositorio oficial de GitHub de OpenDesign
   */
  public async fetchRemoteDesignSystem(systemId: string): Promise<boolean> {
    const cleanId = systemId.replace(/^od:sys\//, "");
    const baseUrl = `https://raw.githubusercontent.com/nexu-io/open-design/main/design-systems/${cleanId}`;
    try {
      console.log(`📡 Conectando con OpenDesign para descargar: od:sys/${cleanId}...`);
      const designRes = await fetch(`${baseUrl}/DESIGN.md`);
      if (!designRes.ok) {
        console.error(`❌ No se encontró DESIGN.md para el sistema '${cleanId}' en OpenDesign (HTTP ${designRes.status}).`);
        return false;
      }
      const designMd = await designRes.text();

      // Intentar obtener tokens.css o design-tokens.json
      let tokensCss: string | undefined;
      let tokensJson: Record<string, any> | undefined;

      const cssRes = await fetch(`${baseUrl}/tokens.css`);
      if (cssRes.ok) {
        tokensCss = await cssRes.text();
      } else {
        const jsonRes = await fetch(`${baseUrl}/design-tokens.json`);
        if (jsonRes.ok) {
          tokensJson = await jsonRes.json();
        }
      }

      // Intentar obtener components.html
      let componentsHtml: string | undefined;
      const compRes = await fetch(`${baseUrl}/components.html`);
      if (compRes.ok) {
        componentsHtml = await compRes.text();
      }

      // Extraer nombre legible del título en DESIGN.md
      const nameMatch = designMd.match(/^#\s+(.+)$/m);
      const name = nameMatch
        ? nameMatch[1].replace(/^(Design System Inspired by|Sistema de Diseño)\s*/i, "").trim() + " System"
        : `${cleanId} System`;

      this.ingestDesignSystem(cleanId, {
        name,
        description: `Sistema de diseño ${cleanId} importado directamente desde el catálogo oficial de OpenDesign.`,
        designMd,
        tokens: tokensJson,
        tokensCss,
        componentsHtml
      });

      console.log(`✅ Sistema od:sys/${cleanId} descargado e importado con éxito.`);
      return true;
    } catch (err: any) {
      console.error(`❌ Error al descargar od:sys/${cleanId}:`, err.message);
      return false;
    }
  }

  /**
   * Descarga una Plantilla de Pantalla directamente desde OpenDesign
   */
  public async fetchRemoteScreenTemplate(templateId: string): Promise<boolean> {
    const cleanId = templateId.replace(/^od:screen\//, "");
    const baseUrl = `https://raw.githubusercontent.com/nexu-io/open-design/main/design-templates/${cleanId}`;
    try {
      console.log(`📡 Conectando con OpenDesign para descargar: od:screen/${cleanId}...`);
      const skillRes = await fetch(`${baseUrl}/SKILL.md`);
      if (!skillRes.ok) {
        console.error(`❌ No se encontró SKILL.md para la plantilla '${cleanId}' en OpenDesign (HTTP ${skillRes.status}).`);
        return false;
      }
      const skillMd = await skillRes.text();

      const htmlRes = await fetch(`${baseUrl}/example.html`);
      if (!htmlRes.ok) {
        console.error(`❌ No se encontró example.html para la plantilla '${cleanId}' en OpenDesign (HTTP ${htmlRes.status}).`);
        return false;
      }
      const rawHtml = await htmlRes.text();

      const nameMatch = skillMd.match(/^#\s+(.+)$/m);
      const name = nameMatch ? nameMatch[1].replace(/Screen Skill/i, "").trim() : `${cleanId} Template`;

      this.ingestScreenTemplate(cleanId, {
        name,
        description: `Plantilla de pantalla ${cleanId} importada directamente desde el catálogo oficial de OpenDesign.`,
        skillMd,
        rawHtml
      });

      console.log(`✅ Plantilla od:screen/${cleanId} descargada e importada con éxito.`);
      return true;
    } catch (err: any) {
      console.error(`❌ Error al descargar od:screen/${cleanId}:`, err.message);
      return false;
    }
  }
}

// Ejecución CLI directa
if (process.argv[1] && process.argv[1].endsWith("ingest-catalog.ts")) {
  const ingestor = new OpenDesignCatalogIngestor();
  const args = process.argv.slice(2);

  const systemArg = args.find((a) => a.startsWith("--system="))?.replace("--system=", "");
  const templateArg = args.find((a) => a.startsWith("--template="))?.replace("--template=", "");

  (async () => {
    if (systemArg) {
      await ingestor.fetchRemoteDesignSystem(systemArg);
    } else if (templateArg) {
      await ingestor.fetchRemoteScreenTemplate(templateArg);
    } else {
      console.log("🚀 Iniciando semillero e ingesta del Catálogo OpenDesign...");
      ingestor.seedCoreCatalog();
      console.log("✅ Catálogo OpenDesign poblado con éxito en design-system/catalog, templates/screens y templates/engines.");
    }
  })();
}
