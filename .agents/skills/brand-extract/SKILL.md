---
name: brand-extract
description: Extrae y sintetiza la identidad visual, colores dominantes, tipografía y estilo de una marca a partir de una URL o imagen de referencia para alimentar el sistema de diseño en Paper.
---

# Workflow: /brand-extract

Este workflow automatiza la extracción de ADN visual de cualquier producto, sitio web o asset de referencia para clonar o adaptar su lenguaje gráfico dentro de **Paper.Design**.

---

## 1. Métodos de Ingesta

### A. Extracción desde URL
1. Inspecciona el contenido o estilos del sitio web objetivo usando herramientas web o de lectura de URL.
2. Extrae las variables CSS (`--primary`, `--font-family`, `--radius`, etc.) del DOM.
3. Detecta las fuentes web activas (Google Fonts, fuentes del sistema o tipografías personalizadas).
4. Captura los 3 colores estructurales clave:
   - **Color de Fondo (*Canvas/Surface*)**: Tono del body o tarjetas principales.
   - **Color de Tinta (*Text/Ink*)**: Color del texto de mayor contraste.
   - **Acento Primario (*Brand Accent*)**: Color de botones primarios y llamadas a la acción.

### B. Extracción desde Imagen o Captura
1. Analiza visualmente la pieza o captura de pantalla provista.
2. Identifica el arquetipo visual:
   - *Technical SaaS* (ej. Linear, Vercel): Modo oscuro, bordes finos, acento saturado puntual.
   - *Fintech / Enterprise* (ej. Stripe): Modo claro, sombras de elevación compuestas, contrastes altos.
   - *Human Centered* (ej. Apple): Squircles, translucidez, azul del sistema, tipografía neutral.
   - *Editorial / Swiss* (ej. Braun, Balenciaga): Sin bordes redondeados, alto contraste blanco y negro, rojo/naranja suizo.

---

## 2. Generación del Contrato de Marca

A partir de la extracción, produce un resumen estructurado:

```json
{
  "brandName": "Ejemplo Brand",
  "archetype": "Technical SaaS",
  "colors": {
    "background": "#0b0d0e",
    "surface": "#141719",
    "border": "rgba(255, 255, 255, 0.1)",
    "textPrimary": "#ffffff",
    "textSecondary": "#8b949e",
    "accent": "#00f0ff"
  },
  "typography": {
    "fontFamily": "Inter",
    "headingWeight": 700,
    "bodyWeight": 400
  },
  "radius": "6px"
}
```

---

## 3. Despliegue en Paper

1. **Tokens**: Escribe o actualiza los archivos locales en `design-system/tokens/` y ejecuta `sync-tokens` con Paper MCP.
2. **Muestrario de Identidad**: Opcionalmente, crea un artboard `Brand / Identity Kit` en Paper con `create_artboard` y plasma los swatches cromáticos y muestras tipográficas usando `write_html`.
3. **Cierre**: Finaliza la sesión invocando `finish_working_on_nodes`.
