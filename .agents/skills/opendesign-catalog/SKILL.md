---
name: opendesign-catalog
description: Permite descubrir, sugerir, aplicar e instanciar sistemas de diseño (od:sys/*), plantillas de pantalla (od:screen/*) y motores de presentaciones (od:engine/*) desde el catálogo OpenDesign en Paper.Design.
---

# Habilidad: Catálogo OpenDesign en Paper.Design

Esta habilidad gobierna la interacción de los subagentes con el catálogo integrado de **OpenDesign** (`design-system/catalog/`, `templates/screens/` y `templates/engines/`).

---

## 1. Identificadores Uniformes (URNs)

Los subagentes deben utilizar exclusivamente las siguientes convenciones:

1. **Sistemas de Diseño (`od:sys/{id}`)**:
   - `od:sys/supabase`: Modo oscuro de alta precisión, verde esmeralda (#3ECF8E), fondo obsidian (#121212).
   - `od:sys/notion`: Minimalismo editorial documental, tonos cálidos marfil (#F7F6F3), texto oscuro (#37352F).
   - `od:sys/shadcn`: Escala neutra de grises zinc, bordes de 1px nítidos, estética moderna Radix.
   - `od:sys/raycast`: Fondo carbón profundo (#0D0E11) con acento rojo carmesí neón (#FF6363).
   - *Más de 130 sistemas disponibles bajo demanda en el catálogo.*

2. **Plantillas de Pantalla (`od:screen/{id}`)**:
   - `od:screen/dating-web`: Experiencia editorial de citas, tarjetas de perfil ricas, badges y botones táctiles flotantes.
   - `od:screen/gamified-app`: Aplicación lúdica con barras de progreso de XP, contadores de racha y retos diarios.
   - `od:screen/live-dashboard`: Tablero de telemetría y operaciones en vivo con grid de 4 KPIs y lista de eventos.

3. **Motores de Presentación y Decks (`od:engine/{id}`)**:
   - `od:engine/deck-framework`: Framework para diapositivas 16:9 multi-artboard con proporciones para proyección.
   - `od:engine/kami-deck`: Diapositivas editoriales asimétricas estilo revista de alta costura y contrastes fotográficos.
   - `od:engine/live-brief`: Artefacto interactivo para salas de decisiones ejecutivas y KPIs clave.

---

## 2. Protocolo de Invocación por Subagente

### A. `spec-interviewer` (Fase de Entrevista y Brief)
- Al recibir una solicitud de nueva pantalla (ej. *"crea una app de gamificación"* o *"un dashboard de métricas"*), consulta el catálogo:
  `node scripts/opendesign/od-manager.ts list`
- Sugiere proactivamente al usuario:
  > *"He localizado la plantilla canónica `od:screen/gamified-app`. ¿Deseas que use este scaffold base para generar la especificación de componentes y criterios de aceptación?"*
- Si el usuario acepta, ejecuta el scaffolding:
  `node scripts/opendesign/od-manager.ts scaffold od:screen/<id> <screen-id>`

### B. `creative-director` (Dirección de Arte y Tokens)
- Cuando el usuario solicita una identidad visual específica de una empresa o estilo reconocido:
  `node scripts/opendesign/od-manager.ts apply od:sys/<id>`
- Verifica que los tokens aplicados cumplan:
  1. Contraste mínimo WCAG AA (4.5:1 para texto normal, 3:1 para titulares).
  2. Todas las dimensiones tipográficas en `px`, line-heights en `px`, letter-spacing en `em`.
  3. Ejecuta `set_tokens` en Paper MCP para actualizar el canvas activo.

### C. `design-architect` (Análisis de Estructura)
- Abre el archivo `templates/screens/<id>/SKILL.md` para extraer la anatomía de componentes y reglas de espaciado.
- Descompone `templates/screens/<id>/canvas-template.html` en bloques lógicos modulares para `ui-builder`.

### D. `ui-builder` (Renderizado en Paper MCP)
- Consume el HTML sanitizado de `templates/screens/<id>/canvas-template.html`.
- Realiza llamadas a `write_html` agrupadas visualmente (Header, Main, Actions).
- Verifica que los botones y avatares mantengan `flexShrink: 0`.
- Invoca `finish_working_on_nodes` obligatoriamente al culminar.

### E. `flyer-designer` (Decks y Posters)
- Consume `templates/engines/deck-framework/` o `templates/engines/kami-deck/`.
- Crea artboards secuenciales en Paper (`create_artboard`) para cada diapositiva (1920x1080).

### F. `visual-qa` (Auditoría Visual)
- Compara la captura de pantalla (`get_screenshot`) contra el archivo de referencia original `templates/screens/<id>/example.html`.
- Ejecuta `drift-detector.ts` contra la spec generada para verificar conformidad de nodos y ausencia de desbordamiento.
