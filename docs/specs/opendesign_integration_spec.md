# Especificación Técnica: Integración del Catálogo OpenDesign en Paper.Design

**Versión:** 1.0.0  
**Estado:** Propuesta de Arquitectura (RFC / Spec)  
**Autor:** Antigravity Architect  
**Repositorio Fuente:** [https://github.com/nexu-io/open-design](https://github.com/nexu-io/open-design)

---

## 1. Resumen Ejecutivo

OpenDesign alberga una biblioteca de activos de diseño creada para agentes de código:
1. **`design-systems/`**: ~130+ sistemas de diseño con `DESIGN.md`, `design-tokens.json`, `components.html`, `tailwind-v4.css` y `tokens.css`.
2. **`design-templates/`**: Pantallas y arquetipos funcionales (ej. `dating-web`, `gamified-app`, dashboards, presentaciones) con directivas de diseño en `SKILL.md` y maquetas en `example.html`.
3. **`templates/`**: Motores estructurales para presentaciones de diapositivas (`deck-framework.html`, `kami-deck.html`) y tableros interactivos (`live-artifacts/`).

Esta especificación detalla la ubicación, pipeline de ingesta, normalización para Paper MCP, contratos de nomenclatura y la orquestación multi-agente para consumir este catálogo de forma nativa dentro de **Paper.Design**.

---

## 2. Ubicación en el Repositorio (En dónde irían)

Para evitar inflar el repositorio con activos no utilizados y mantener compatibilidad con el sistema de tokens y marcas existente (`brands/` y `design-system/`), se define la siguiente jerarquía de carpetas:

```text
Paper.Design/
├── design-system/
│   ├── catalog/                          # [NUEVO] Catálogo completo de sistemas OpenDesign
│   │   ├── linear-app/
│   │   │   ├── DESIGN.md                 # Reglas de voz visual, bordes y layout
│   │   │   ├── tokens.json               # Tokens normalizados a formato Paper
│   │   │   ├── components.html           # Recetas HTML de componentes
│   │   │   └── manifest.json             # Metadatos del sistema
│   │   ├── supabase/
│   │   ├── notion/
│   │   └── ... (hasta 130+)
│   ├── presets/                          # Presets curados de primer nivel (Linear, Stripe, etc.)
│   └── active/                           # Sistema de diseño activo en el canvas
│
├── templates/                            # [NUEVO] Catálogo de plantillas y motores OpenDesign
│   ├── screens/                          # Procedentes de `design-templates/`
│   │   ├── dating-web/
│   │   │   ├── SKILL.md                  # Instrucciones de anatomía y UX para el agente
│   │   │   ├── template.spec.ts          # Contrato SDD (ScreenSpecSchema)
│   │   │   └── canvas-template.html      # HTML adaptado a Paper MCP (write_html)
│   │   ├── gamified-app/
│   │   └── live-dashboard/
│   │
│   └── engines/                          # Procedentes de `templates/`
│       ├── deck-framework/               # Motor de diapositivas multi-artboard
│       │   ├── framework.html
│       │   └── deck-rules.md
│       ├── kami-deck/                    # Motor editorial para presentaciones tipo revista
│       │   └── template.html
│       └── live-artifacts/               # Tableros ejecutables con tweaks panel
│           └── otd-operations-brief/
│
├── scripts/
│   └── opendesign/                       # Scripts de ingesta y sincronización
│       ├── ingest-catalog.ts             # Descarga y parseo desde GitHub/tarball
│       ├── token-converter.ts            # Conversor W3C/Tailwind Tokens -> Paper Tokens
│       └── html-sanitizer.ts             # Adaptador HTML iframe -> Paper MCP Canvas
```

### Estrategia de Almacenamiento
* **Almacenamiento Local Seleccionable (Sparse / Hybrid)**: No todos los 130 sistemas necesitan vivir en el repositorio si el usuario desea un repo ligero. El CLI de ingesta (`ingest-catalog.ts`) permitirá:
  - `pnpm run od:pull --all`: Descarga el catálogo completo offline.
  - `pnpm run od:pull --system=<id>`: Descarga sistemas específicos bajo demanda desde la API de GitHub o sparse-checkout.

---

## 3. Arquitectura de Integración (Cómo se integrarían)

OpenDesign está diseñado para renderizar en **iframes web aislados** con Tailwind v4 o CSS arbitrario. **Paper.Design**, en cambio, opera sobre un canvas nativo mediante **Paper MCP** (`write_html`, `update_styles`, `create_artboard`).

La integración requiere 4 capas de adaptación:

```mermaid
flowchart TD
    OD[OpenDesign Repository] --> Ingest[Ingestion Engine: scripts/opendesign/ingest-catalog.ts]
    
    subgraph Ingestion & Transformation
        Ingest -->|Tokens JSON / CSS| TC[Token Normalizer: token-converter.ts]
        Ingest -->|example.html| HS[HTML Sanitizer: html-sanitizer.ts]
        Ingest -->|SKILL.md + Layout| SG[SDD Spec Generator: screen.schema.ts]
    end
    
    subgraph Paper.Design Core
        TC --> PaperTokens[design-system/catalog/{id}/tokens.json]
        HS --> CanvasTemplates[templates/screens/{id}/canvas-template.html]
        SG --> ScreenSpecs[templates/screens/{id}/template.spec.ts]
    end
    
    subgraph Multi-Agent Execution
        PaperTokens --> CD[creative-director / color-expert]
        CanvasTemplates --> UB[ui-builder]
        ScreenSpecs --> SI[spec-interviewer & visual-qa]
    end
    
    UB -->|Paper MCP write_html| Canvas[(Paper Canvas)]
    Canvas -->|get_screenshot & drift-detector| QA[(Visual QA & Audit)]
```

### 3.1. Normalización de Tokens (`token-converter.ts`)
* **Entrada**: `design-tokens.json` y `tokens.css` de OpenDesign (variables CSS `:root { --color-brand: #...; }`).
* **Transformación**:
  - Extrae escalas tonales completas (50 a 950).
  - Mapea roles semánticos a las claves canónicas de Paper: `colors.primary`, `colors.surface`, `colors.border`, `colors.text`.
  - Normaliza tipografía: convierte `rem` y `clamp()` a valores exactos en `px` para `fontSize` y `lineHeight`, y `em` para `letterSpacing` (regla estricta de Paper MCP).
* **Salida**: Genera `tokens.json` estructurado para Paper y ejecuta `set_tokens` en el canvas activo.

### 3.2. Adaptación de HTML para Paper Canvas (`html-sanitizer.ts`)
* **Reto**: `write_html` de Paper MCP no admite JavaScript interactivo en el DOM del canvas, etiquetas `<script>` externas complejas o estilos no computables.
* **Transformación**:
  - Inlining y compatibilidad flexbox: asegura `flexShrink: 0` en iconos, botones y avatares para evitar clipping.
  - Conversión de clases Tailwind v4 a CSS en línea o bloques `<style>` estables soportados por Paper.
  - Auto-ajuste de alturas: reemplaza `height: 100vh` por `height: "fit-content"` o dimensiones exactas del viewport fijado en la spec.
  - Protocolo `paper-gen://`: si el template incluye imágenes externas no persistentes, se reemplazan por directivas curadas de [`prompt-templates/`](../../prompt-templates/).

### 3.3. Contrato Spec-Driven Development (SDD)
Cada template importado genera automáticamente un contrato TypeScript tipado con `ScreenSpecSchema`:
- Declara la jerarquía de componentes (`header`, `container`, `slot`, `button`, etc.).
- Define criterios de aceptación accesibles (WCAG AA, tap targets de 44px).
- Permite que `drift-detector.ts` compare el canvas resultante contra la intención original.

---

## 4. Convención de Nombres (Cómo se llamarían)

Se establece un espacio de nombres uniforme basado en prefijos **`od:`** (OpenDesign) para identificar inequívocamente el origen de cada activo:

### 4.1. Esquema de Identificadores (URNs)

| Categoría | Formato de URN | Ejemplo | Descripción |
|---|---|---|---|
| **Design Systems** | `od:sys/{name}` | `od:sys/supabase`<br>`od:sys/linear-app`<br>`od:sys/raycast` | Sistema visual completo, paleta tonal, tokens y voz de diseño. |
| **Screen Templates** | `od:screen/{name}` | `od:screen/dating-web`<br>`od:screen/gamified-app`<br>`od:screen/live-dashboard` | Plantilla de interfaz funcional con `SKILL.md` y maquetación de pantalla. |
| **Framework Engines** | `od:engine/{name}` | `od:engine/deck-framework`<br>`od:engine/kami-deck`<br>`od:engine/live-brief` | Motores estructurales para slides, presentaciones y artefactos dinámicos. |

### 4.2. Comandos de Script y CLI

```bash
# Ingesta y sincronización del catálogo
pnpm run od:import --all                      # Importa todos los design systems y templates
pnpm run od:import --systems=supabase,notion   # Importa sistemas puntuales
pnpm run od:import --templates=dating-web      # Importa un template específico

# Aplicación y Scaffolding
pnpm run od:apply od:sys/supabase             # Activa el sistema en design-system/active y Paper tokens
pnpm run od:scaffold od:screen/dating-web     # Crea una nueva spec en specs/screens/ basada en el template
```

---

## 5. Matriz de Agentes y Responsabilidades (Qué agente los invocaría)

Dentro de la arquitectura multi-agente de Paper.Design, cada agente asume un rol específico sobre estos activos:

```text
┌─────────────────────────┐
│     Usuario / Chat      │
└────────────┬────────────┘
             │ Solicita pantalla o estilo
             ▼
┌─────────────────────────┐
│     spec-interviewer    │ ◄─── Consulta catálogo od:screen/* y sugiere layouts
└────────────┬────────────┘
             │ Redacta ScreenSpec (draft)
             ▼
┌─────────────────────────┐
│    creative-director    │ ◄─── Selecciona od:sys/*, aplica tokens y valida anti-slop
└────────────┬────────────┘
             │ Contrato congelado (frozen)
             ▼
┌─────────────────────────┐
│     design-architect    │ ◄─── Descompone layout del template en grupos de componentes
└────────────┬────────────┘
             │ Plan de nodos
             ▼
┌─────────────────────────┐
│  ui-builder / flyer-des.│ ◄─── Consume canvas-template.html y ejecuta write_html en Paper MCP
└────────────┬────────────┘
             │ Nodos renderizados
             ▼
┌─────────────────────────┐
│        visual-qa        │ ◄─── Valida visualmente con get_screenshot contra example original
└─────────────────────────┘
```

### 5.1. `spec-interviewer`
* **Trigger**: Durante el comando `/create-screen` o al recibir un nuevo brief.
* **Acción**: Consulta los metadatos de `templates/screens/` (`od:screen/*`).
* **Comportamiento**: Si el usuario dice *"Quiero crear una aplicación gamificada"* o *"Un dashboard de métricas"*, el agente sugiere:  
  *«He localizado la plantilla canónica `od:screen/gamified-app`. ¿Deseas usar esta arquitectura de navegación y adaptarla a tu marca?»*
* **Resultado**: Inicializa la spec con la estructura base de componentes definida en `template.spec.ts`.

### 5.2. `creative-director`
* **Trigger**: Definición de identidad visual, cambio de estilo o invocación de marca.
* **Acción**: Lee `design-system/catalog/{name}/DESIGN.md` y `tokens.json` (`od:sys/*`).
* **Comportamiento**: 
  - Aplica los tokens del sistema seleccionado mediante `color-expert` y actualiza `design-system/active/DESIGN.md`.
  - Asegura que el sistema cumpla con [`craft/anti-ai-slop.md`](../../craft/anti-ai-slop.md) y [`craft/accessibility-baseline.md`](../../craft/accessibility-baseline.md).
  - Invoca `set_tokens` en Paper MCP para refrescar las variables del canvas.

### 5.3. `design-architect`
* **Trigger**: Al pasar de la spec congelada a la fase de construcción de componentes.
* **Acción**: Analiza el `SKILL.md` del template (`od:screen/*`) y desglosa el `canvas-template.html` en grupos visuales coherentes.
* **Comportamiento**: Evita llamadas gigantescas a `write_html`; fracciona la vista en sub-bloques modulares (Header, KPI Cards, Content Grid, Bottom Nav).

### 5.4. `ui-builder`
* **Trigger**: Construcción de interfaces de producto (Web, Mobile, Desktop).
* **Acción**: Renderiza los bloques adaptados de `canvas-template.html`.
* **Comportamiento**:
  - Aplica las reglas obligatorias de Paper MCP: tipografías en `px`, slots flexibles, `flexShrink: 0`.
  - Finaliza siempre con `finish_working_on_nodes`.

### 5.5. `flyer-designer`
* **Trigger**: Creación de presentaciones, decks corporativos, posters o documentos multi-página.
* **Acción**: Invoca los motores de `templates/engines/` (`od:engine/deck-framework` y `od:engine/kami-deck`).
* **Comportamiento**:
  - Crea artboards secuenciales en Paper (`create_artboard`).
  - Utiliza los grids editoriales de `kami-deck` para afiches y diapositivas de alta fidelidad.

### 5.6. `visual-qa`
* **Trigger**: Post-construcción o ejecución de `/revisar`.
* **Acción**: Compara la captura de Paper (`get_screenshot`) con la referencia canónica `example.html` del template original.
* **Comportamiento**:
  - Audita contraste cromático WCAG AA.
  - Verifica ausencia de desbordamientos (overflow) en artboards mediante `get_node_info`.
  - Emite el reporte de deriva (*drift report*).

---

## 6. Plan de Implementación por Fases

1. **Fase 1: Motor de Ingesta y Normalizador de Tokens (`scripts/opendesign/`)**:
   - Desarrollar `token-converter.ts` para mapear tokens de OpenDesign a Paper.
   - Probar con 5 sistemas representativos: `od:sys/linear-app`, `od:sys/supabase`, `od:sys/notion`, `od:sys/stripe`, `od:sys/shadcn`.
2. **Fase 2: Adaptador HTML Canvas (`html-sanitizer.ts`)**:
   - Filtro de compatibilidad para convertir layouts web a directivas nativas de Paper MCP.
   - Ingesta de las primeras 3 plantillas de pantalla: `od:screen/dating-web`, `od:screen/gamified-app`, `od:screen/live-dashboard`.
3. **Fase 3: Motores de Decks (`od:engine/*`)**:
   - Adaptación de `deck-framework.html` y `kami-deck.html` a flujos multi-artboard de Paper.
4. **Fase 4: Integración Agéntica y Catálogo Completo**:
   - Registro de habilidades en `.agents/skills/opendesign-catalog/SKILL.md`.
   - Exposición al `spec-interviewer` y `creative-director`.
