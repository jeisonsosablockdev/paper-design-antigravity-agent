---
name: revisar
description: Inspecciona el lienzo de Paper para sincronizar cambios manuales hechos directamente por el usuario en la app de Paper, auditar selecciones activas, detectar drift contra las specs y adaptar los siguientes pasos de diseño. Disparar siempre que el usuario escriba '/revisar' o pida revisar cambios en Paper.
---

# Workflow: /revisar (Sincronización y Auditoría del Canvas de Paper)

Este workflow se ejecuta cuando el usuario realiza modificaciones manuales directamente en la aplicación de **Paper** y solicita que el sistema agéntico las inspeccione, las absorba y las tome como nueva base de trabajo.

---

## Protocolo de Ejecución Paso a Paso

### Paso 1: Localización del Contexto Activo
1. Ejecuta `get_basic_info` para identificar el archivo abierto, la página activa y las dimensiones de todos los artboards.
2. Ejecuta `get_selection` para verificar si el usuario tiene elementos o artboards específicos seleccionados.
   - Si hay nodos seleccionados: enfoca la inspección en esos nodos.
   - Si no hay selección: toma el artboard activo o más reciente de la página actual.

### Paso 2: Extracción Estructural y Estilística
1. Para el artboard o grupo seleccionado, invoca:
   - `get_node_info` con `includeChildren: true` (o `get_tree_summary`) para mapear la jerarquía de capas.
   - `get_computed_styles` sobre los nodos clave modificados para extraer valores exactos (colores de fondo, bordes, tipografía, paddings).
   - `get_tokens` para comprobar si el usuario creó o reasignó tokens en Paper.

### Paso 3: Inspección Visual Inmediata
1. Llama a `get_screenshot` pasando el `nodeId` del artboard o elemento relevante.
2. Examina la captura para validar visualmente la estética, alineación, contraste y jerarquía implementada por el usuario.

### Paso 4: Detección de Deriva (Drift Analysis contra Specs)
1. Compara las propiedades detectadas en el canvas contra la especificación activa en `specs/screens/*.spec.ts`:
   - ¿Se agregaron nuevos componentes o slots que no estaban en la spec?
   - ¿Se modificaron colores, tamaños o tipografías respecto al design system?
   - ¿Se eliminaron elementos previamente definidos?
2. Si se detecta deriva, genera un reporte timestamped en `specs/drift/<timestamp>_drift_report.json`.

### Paso 5: Reporte Estructurado al Usuario
Presenta al usuario un resumen claro y conciso sin exponer IDs internos crudos:
1. **Elementos detectados**: Pantalla o componentes sobre los que trabajó.
2. **Cambios observados**: Estructura, nuevos slots, ajustes de espaciado o paleta de color.
3. **Validación visual**: Resumen de cómo luce la pantalla tras su intervención.
4. **Acción sugerida / Confirmación**: Preguntar si desea:
   - **Opción A**: Actualizar el contrato en `specs/screens/*.spec.ts` para que refleje fielmente su nuevo diseño manual.
   - **Opción B**: Mantener el diseño tal cual y proceder a construir los siguientes componentes o estados restantes.
