# Paper.Design

Workspace local para diseño de interfaces digitales conectado directamente a **Paper** mediante **Paper MCP** y gobernado por un sistema agéntico autónomo basado en especificaciones (**Spec-Driven Development**).

## Configuración del Entorno

- **Gestor de Paquetes Exclusivo**: `pnpm` (v10.33.2+)
- **Paper CLI Binary**: `/Applications/Paper.app/Contents/Resources/app.asar.unpacked/dist/cli-bin/darwin-arm64/paper`
- **Configuración MCP Global**: `~/.gemini/config/mcp_config.json`
- **Reglas del Asistente**: [`GEMINI.md`](./GEMINI.md)
- **Especificación de Arquitectura**: [`docs/agentic_system_architecture_paper_design.md`](./docs/agentic_system_architecture_paper_design.md)

## Comandos y Workflows del Sistema Agéntico

- **`/revisar`** ([`.agents/skills/revisar/SKILL.md`](./.agents/skills/revisar/SKILL.md)):
  Inspecciona el lienzo de Paper, detecta cambios manuales del usuario, audita la selección activa, genera un análisis de deriva (*drift*) contra `specs/screens/*.spec.ts` y sincroniza el estado.
- **`/create-screen`** ([`.agents/skills/create-screen/SKILL.md`](./.agents/skills/create-screen/SKILL.md)):
  Pipeline completo: Entrevista Draft-First $\to$ Contrato TypeScript Congelado $\to$ Renderizado en Paper $\to$ QA Visual.
- **`/color-expert`** ([`.agents/skills/color-expert/SKILL.md`](./.agents/skills/color-expert/SKILL.md)):
  Genera escalas tonales (50-950) accesibles WCAG AA/AAA y sincroniza paletas con tokens de diseño.
- **`/brand-extract`** ([`.agents/skills/brand-extract/SKILL.md`](./.agents/skills/brand-extract/SKILL.md)):
  Extrae y sintetiza identidad visual, paleta cromática y tipografía a partir de URLs o imágenes.
- **`/sync-tokens`** ([`.agents/skills/sync-tokens/SKILL.md`](./.agents/skills/sync-tokens/SKILL.md)):
  Sincronización bidireccional entre `design-system/tokens/` y las variables de Paper.
- **`/audit-screen`** ([`.agents/skills/audit-screen/SKILL.md`](./.agents/skills/audit-screen/SKILL.md)):
  Auditoría visual de contraste WCAG, clipping y reglas tipográficas.

## Craft Engine & Estándares OpenDesign

El sistema incorpora los principios de diseño de alta artesanía ubicados en [`craft/`](./craft/):
- **Anti AI-Slop** ([`craft/anti-ai-slop.md`](./craft/anti-ai-slop.md)): Erradica gradientes morados genéricos y fondos sin intención de marca.
- **Jerarquía Tipográfica** ([`craft/typography-hierarchy.md`](./craft/typography-hierarchy.md)): Escalas proporcionales y métricas matemáticas en `px`/`em`.
- **Accesibilidad WCAG AA** ([`craft/accessibility-baseline.md`](./craft/accessibility-baseline.md)): Contraste mínimo 4.5:1 y tap targets $\ge 44\text{px}$.
- **Cobertura de Estados** ([`craft/state-coverage.md`](./craft/state-coverage.md)) y **Leyes de UX** ([`craft/laws-of-ux.md`](./craft/laws-of-ux.md)).

### Presets de Diseño OpenDesign (`design-system/presets/`)
Sistemas visuales completos intercambiables (`pnpm run preset:apply <nombre>`):
- **Linear**: Modo oscuro profundo, densidad técnica, bordes sutiles y acento violeta eléctrico.
- **Stripe**: Fondos claros, elevaciones multicapa y acento índigo de alta conversión.
- **Vercel**: Monocromático de alta fidelidad, contraste extremo y estética Geist.
- **Apple**: Vidrio translúcido, bordes de 0.5px y tipografía humana SF Pro.
- **Bento**: Grillas modulares de contenido, tarjetas redondeadas y micro-etiquetas.
- **Swiss**: Tipografía protagonista, asimetría estructurada y acento rojo internacional.

## Sistema Multi-Marca (Multi-Brand Architecture)

El workspace soporta gestión concurrente y conmutación atómica de marcas mediante [`brands.json`](./brands.json) y el gestor [`scripts/brands/brand-manager.ts`](./scripts/brands/brand-manager.ts):
- **Aislamiento Total**: Cada marca reside en [`brands/<brand-id>/`](./brands/) con sus propios tokens (`colors.json`, `typography.json`, `spacing.json`), contrato visual [`DESIGN.md`](./brands/linear-tech/DESIGN.md) y página dedicada en Paper Canvas.
- **Idempotencia y Checksums**: Validación mediante SHA-256 (`brand-hasher.ts`) para garantizar que la conmutación de marcas no corrompa estados ni genere mutaciones redundantes.
- **Marcas Iniciales**:
  - `linear-tech`: Estética dark mode técnica y alta densidad (Preset Linear).
  - `lumina-pay`: Pasarela de pagos B2B de alta confianza (Preset Stripe).
  - `swiss-studio`: Diseño editorial asimétrico de impacto (Preset Swiss).

## Scripts y Herramientas (PNPM)

```bash
pnpm test                  # Ejecuta la suite completa de pruebas evaluadoras (7 tests)
pnpm run test:multibrand   # Valida integridad, hashes e idempotencia del sistema multi-marca
pnpm run test:typography   # Valida unidades px/em y fuentes autorizadas
pnpm run test:tokens       # Valida coincidencia con tokens de color
pnpm run test:overflow     # Detecta desbordes y alturas fijas conflictivas
pnpm run test:contract     # Valida fidelidad de componentes contra la spec
pnpm run test:flyer        # Valida jerarquía gráfica y titular display en flyers
pnpm run test:color        # Valida generación de escalas tonales y contraste WCAG
pnpm run drift             # Analiza divergencias entre el canvas y la spec activa
pnpm run brand:list        # Lista las marcas registradas y la activeBrand
pnpm run brand:switch <id> # Conmuta atómicamente la marca activa y sincroniza tokens
pnpm run brand:create      # Registra una nueva marca con aislamiento de directorio
pnpm run brand:validate    # Audita la consistencia de marcas y checksums SHA-256
pnpm run preset:apply <id> # Aplica un preset de diseño (linear, stripe, vercel, apple, bento, swiss)
pnpm run color:scale <hex> # Genera una escala tonal 50-950 accesible WCAG
pnpm run brand:extract     # Extrae identidad visual y paleta desde imagen o URL
```


## Herramientas MCP Principales

- `get_guide`: Carga guías detalladas (`paper-mcp-instructions`, `mobile-status-bar`, `figma-import`, `image-generation`).
- `list_files` / `open_file` / `create_file`: Gestión de archivos en Paper.
- `get_basic_info` / `get_selection`: Inspección del estado actual del canvas y selecciones activas.
- `create_artboard` / `write_html` / `update_styles`: Generación y modificación de layouts y componentes.
- `get_tokens` / `create_tokens` / `set_tokens`: Gestión de tokens de diseño.
- `get_screenshot`: Previsualización y validación visual del diseño.
- `finish_working_on_nodes`: Consolidación y cierre de modificaciones.
