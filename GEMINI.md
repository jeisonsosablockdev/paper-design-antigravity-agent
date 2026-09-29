# Reglas de Proyecto: Paper.Design

Este espacio de trabajo está dedicado al diseño de interfaces y productos utilizando **Paper** y su integración vía **Paper MCP**.

## Protocolo Obligatorio para Paper MCP

Siempre que interactúes con diseños en Paper dentro de este proyecto:

1. **Inicialización de Sesión**:
   - En la primera interacción que involucre diseño en Paper, ejecuta:
     `call_mcp_tool(ServerName="paper", ToolName="get_guide", Arguments={"topic": "paper-mcp-instructions"})`.
   - Consulta el estado del canvas con `get_basic_info` y `get_selection` para conocer el archivo actual, artboards y dimensiones.

2. **Tipografía y Estilos**:
   - Antes de aplicar estilos tipográficos por primera vez en la sesión, llama a `get_font_family_info`.
   - Usa las fuentes indicadas en `get_basic_info` o las acordadas con el usuario.
   - Unidades: `px` para `font-size` y `line-height`, `em` para `letter-spacing`.

3. **Flujo de Diseño y Creación**:
   - Antes de escribir HTML/nodos nuevos, define un brief o consulta la spec en `specs/screens/`.
   - Cada llamada a `write_html` debe corresponder aproximadamente a un grupo visual coherente.
   - Prefiere `duplicate_nodes` combinado con `update_styles` y `set_text_content` cuando sea más rápido que reescribir HTML.
   - En filas repetidas (listas, navbars, cards): usa slots con ancho fijo para iconos y acciones (`flexShrink: 0`).

4. **Calidad y Verificación**:
   - Usa `get_screenshot` para validar visualmente los cambios significativos.
   - Si el contenido se desborda o se corta en un artboard, ajusta `height: "fit-content"` mediante `update_styles` en lugar de calcular alturas fijas arbitrarias.

5. **Finalización y Seguridad**:
   - Al terminar de crear o editar nodos, es OBLIGATORIO invocar `finish_working_on_nodes`.
   - Nunca expongas IDs internos de nodos directamente al usuario en las respuestas de texto.
   - Para exportar al código del usuario (React, CSS, etc.), extrae los valores exactos mediante `get_jsx`, `get_computed_styles` o `get_fill_image`, nunca deduzcas valores de una captura de pantalla.

6. **Comando y Flujo `/revisar`**:
   - Siempre que el usuario escriba `/revisar` o solicite revisar cambios manuales realizados en la app de Paper:
     a) Ejecuta `get_basic_info` y `get_selection` para localizar el foco de trabajo del usuario.
     b) Extrae la estructura y propiedades actualizadas con `get_node_info`, `get_tree_summary` y `get_computed_styles`.
     c) Captura la vista visual con `get_screenshot`.
     d) Ejecuta análisis de deriva (*drift*) contra la especificación tipada en `specs/screens/*.spec.ts`.
     e) Presenta un resumen de cambios detectados y consulta si se debe actualizar el contrato de la spec o proceder con el siguiente paso de diseño.

7. **Estándares de Artesanía Visual (Craft Engine)**:
   - Todo diseño en Paper (`ui-builder`, `flyer-designer`) debe adherirse a los principios en `craft/`:
     - Erradicar AI-slop (`craft/anti-ai-slop.md`): sin fondos morados genéricos ni gradientes flotantes sin semántica.
     - Escala tipográfica matemática y espaciado proporcional (`craft/typography-hierarchy.md`).
     - Accesibilidad básica WCAG AA y tap targets >= 44px (`craft/accessibility-baseline.md`).
     - Cobertura de estados y ergonomía cognitiva (`craft/state-coverage.md`, `craft/laws-of-ux.md`).

8. **Buzón de Entrada y Digestión de Marcas (Brand Inbox & Digestion)**:
   - Toda marca registrada dispone de un directorio `brands/<brand-id>/inbox/` como zona de entrada (*dropzone*) estandarizada.
   - Cuando el usuario mencione haber dejado archivos o solicite asimilar recursos (CSS, JSON, SVG, PNG, MD), el agente debe inspeccionar el buzón de la marca activa (`brands/<activeBrand>/inbox/`) y activar el pipeline de digestión (`pnpm run brand:digest`).
   - Los activos se archivan en `brands/<brand-id>/assets/`, actualizando los tokens y recalculando el `stateHash` de integridad.

