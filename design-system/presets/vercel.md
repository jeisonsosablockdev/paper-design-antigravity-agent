# Preset de Diseño: Vercel (Geist Design System)

El preset **Vercel** está basado en el sistema de diseño **Geist**. Representa el pináculo del diseño de herramientas para desarrolladores en la web moderna: monocromático estricto, contraste sin compromisos, tipografía monoespaciada quirúrgica y micro-interacciones de alta velocidad.

---

## 1. Filosofía y Estética
- **Monocromatismo Puro**: La estructura visual vive en la escala de grises absoluta (`#000000`, `#111111`, `#666666`, `#888888`, `#eaeaea`, `#fafafa`, `#ffffff`).
- **El Acento es la Acción**: A diferencia de otras marcas con colores corporativos saturados, en Vercel el acento es negro sobre blanco (o blanco sobre negro en dark mode).
- **Tipografía Geist**: Emparejamiento perfecto de Geist Sans para titulares/interfaz y Geist Mono para código, hashes, métricas y rutas.
- **Bordes de Precisión**: Bordes milimétricos `1px solid #333` (en dark) o `1px solid #eaeaea` (en light). Cero sombras difusas innecesarias.

---

## 2. Paleta de Tokens (Dual Mode)

| Token | Light Mode | Dark Mode | Función |
|---|---|---|---|
| `--vercel-bg-root` | `#ffffff` | `#000000` | Fondo raíz del lienzo |
| `--vercel-bg-surface` | `#fafafa` | `#0a0a0a` | Paneles, cards y filas de tabla |
| `--vercel-bg-hover` | `#f2f2f2` | `#171717` | Estado hover en listas y botones ghost |
| `--vercel-border` | `#eaeaea` | `#333333` | Bordes divisorios estándar |
| `--vercel-text-primary` | `#000000` | `#ffffff` | Títulos principales, valores numéricos |
| `--vercel-text-secondary` | `#666666` | `#a1a1a1` | Descripciones, labels secundarios |
| `--vercel-text-tertiary` | `#888888` | `#707070` | Timestamps, placeholders |
| `--vercel-accent-action` | `#000000` | `#ffffff` | Botón primario de despliegue / acción |
| `--vercel-success` | `#0070f3` | `#0070f3` | Links y estado activo |
| `--vercel-warning` | `#f5a623` | `#f5a623` | Alertas de build y deprecación |
| `--vercel-error` | `#ee0000` | `#ff0000` | Errores de despliegue y validación |

---

## 3. Tipografía Geist

- **Familias**: `Geist Sans`, `Geist Mono`, `ui-monospace`, `sans-serif`.
- **H1 / Display**: `font-size: 24px; font-weight: 600; line-height: 32px; letter-spacing: -0.03em;`
- **H2 / Subsección**: `font-size: 16px; font-weight: 600; line-height: 24px; letter-spacing: -0.02em;`
- **Body / Item**: `font-size: 14px; font-weight: 400; line-height: 20px; letter-spacing: -0.01em;`
- **Code / Metrics (Mono)**: `font-size: 12px; font-family: 'Geist Mono', monospace; font-weight: 500; letter-spacing: -0.01em;`

---

## 4. Radios y Controles

- **Radios (`border-radius`)**:
  - Botones e Inputs: `6px`
  - Cards y Contenedores: `8px`
  - Badges de estado: `9999px` (Pill)
- **Área y Dimensiones**:
  - Altura estándar de botón / input: `36px` o `40px`
  - Padding de botón primario: `0 16px`

---

## 5. Receta de Implementación en Paper (`write_html`)

```html
<div style="background-color: #000000; color: #ffffff; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; min-width: 500px; display: flex; flex-direction: column; gap: 20px;">
  <!-- Header de Proyecto Vercel -->
  <div style="display: flex; justify-content: space-between; align-items: center; border-bottom: 1px solid #222222; padding-bottom: 16px;">
    <div style="display: flex; align-items: center; gap: 12px;">
      <div style="width: 28px; height: 28px; background: #ffffff; clip-path: polygon(50% 0%, 0% 100%, 100% 100%);"></div>
      <span style="font-size: 15px; font-weight: 600; letter-spacing: -0.02em;">paper-design-system</span>
      <span style="font-size: 12px; border: 1px solid #333333; color: #a1a1a1; border-radius: 9999px; padding: 2px 10px;">Production</span>
    </div>
    <button style="background-color: #ffffff; color: #000000; border: none; border-radius: 6px; padding: 8px 16px; font-size: 13px; font-weight: 500; cursor: pointer;">Deploy</button>
  </div>

  <!-- Card de Despliegue -->
  <div style="background-color: #0a0a0a; border: 1px solid #222222; border-radius: 8px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; justify-content: space-between;">
      <span style="font-size: 12px; font-family: monospace; color: #888888;">commit 7f3b89a · main</span>
      <span style="font-size: 12px; color: #0070f3;">● Ready (42s)</span>
    </div>
    <div style="font-size: 14px; font-weight: 500; color: #ffffff;">feat(canvas): add zero-runtime spec validator</div>
    <div style="display: flex; gap: 16px; font-size: 12px; color: #666666; font-family: monospace;">
      <span>dpl_987xYz...</span>
      <span>preview-paper.vercel.app</span>
    </div>
  </div>
</div>
```
