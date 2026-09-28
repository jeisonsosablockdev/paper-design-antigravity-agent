---
name: audit-screen
description: Audita un artboard o pantalla existente en Paper evaluando reglas tipográficas, contraste WCAG, overflow/clipping y adherencia a tokens de diseño.
---

# Workflow: /audit-screen

Este workflow ejecuta una auditoría profunda de calidad sobre un artboard seleccionado en **Paper**.

---

## Pasos de Auditoría

1. **Obtener Selección**: Llama a `get_selection` y `get_basic_info`.
2. **Inspección de Nodos**: Llama a `get_node_info` con `includeChildren: true` para el artboard objetivo.
3. **Captura Visual**: Ejecuta `get_screenshot` para análisis de contraste y alineación.
4. **Batería de Pruebas**:
   - `typography.eval.ts`: Chequeo de unidades `px`/`em` y fuentes autorizadas.
   - `overflow.eval.ts`: Chequeo de texto truncado o contenedores con altura rígida que cortan contenido.
   - `tokens.eval.ts`: Chequeo de colores contra la paleta semántica.
5. **Reporte de Calidad**:
   - Puntuación de 0 a 10.
   - Lista detallada de fallos detectados con recomendaciones de ajuste (`update_styles`).
