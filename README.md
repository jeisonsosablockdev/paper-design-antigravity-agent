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
- **`/sync-tokens`** ([`.agents/skills/sync-tokens/SKILL.md`](./.agents/skills/sync-tokens/SKILL.md)):
  Sincronización bidireccional entre `design-system/tokens/` y las variables de Paper.
- **`/audit-screen`** ([`.agents/skills/audit-screen/SKILL.md`](./.agents/skills/audit-screen/SKILL.md)):
  Auditoría visual de contraste WCAG, clipping y reglas tipográficas.

## Scripts de Validación (PNPM)

```bash
pnpm run test:typography   # Valida unidades px/em y fuentes autorizadas
pnpm run test:tokens       # Valida coincidencia con tokens de color
pnpm run test:overflow     # Detecta desbordes y alturas fijas conflictivas
pnpm run test:contract     # Valida fidelidad de componentes contra la spec
pnpm run test:flyer        # Valida jerarquía gráfica y titular display en flyers
pnpm run drift             # Analiza divergencias entre el canvas y la spec activa
```

## Herramientas MCP Principales

- `get_guide`: Carga guías detalladas (`paper-mcp-instructions`, `mobile-status-bar`, `figma-import`, `image-generation`).
- `list_files` / `open_file` / `create_file`: Gestión de archivos en Paper.
- `get_basic_info` / `get_selection`: Inspección del estado actual del canvas y selecciones activas.
- `create_artboard` / `write_html` / `update_styles`: Generación y modificación de layouts y componentes.
- `get_tokens` / `create_tokens` / `set_tokens`: Gestión de tokens de diseño.
- `get_screenshot`: Previsualización y validación visual del diseño.
- `finish_working_on_nodes`: Consolidación y cierre de modificaciones.
