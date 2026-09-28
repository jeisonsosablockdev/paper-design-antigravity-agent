# Preset de Diseño: Swiss Style (International Typographic Style)

El preset **Swiss** rinde homenaje al Estilo Tipográfico Internacional (Müller-Brockmann, Hofmann, Rams). Es el estilo supremo para cartelería, posters de eventos de alto impacto (`flyer-designer`), editoriales y aplicaciones web con estética minimalista brutalista.

---

## 1. Filosofía y Estética
- **Retícula Matemática (*Grid-driven*)**: Todo elemento se alinea estrictamente a una retícula modular de 8, 12 o 16 columnas.
- **Asimetría Dinámica**: La tensión visual se logra mediante equilibrio asimétrico y pesos contrastantes, nunca mediante simetría estática.
- **Tipografía como Estructura**: Las letras y los bloques de texto no son relleno; son la arquitectura gráfica principal.
- **Cero Artificio**:
  - `border-radius: 0px` (Esquinas estrictamente rectas y filosas).
  - Cero sombras difusas (`box-shadow: none`).
  - Líneas de división de 1px a 2px sólidas de alto contraste.

---

## 2. Paleta de Colores

| Token | Hex | Función |
|---|---|---|
| `--swiss-canvas` | `#f4f4f4` / `#ffffff` | Fondo puro y limpio |
| `--swiss-ink` | `#0a0a0a` | Tinta tipográfica principal |
| `--swiss-accent-red` | `#d90429` | Punto focal suizo de máximo impacto |
| `--swiss-rule` | `#0a0a0a` | Líneas y filetes separadores de 1px |
| `--swiss-subtext` | `#4a4a4a` | Notas técnicas y números de serie |

---

## 3. Tipografía y Jerarquía Extrema

- **Familia**: `Helvetica Neue`, `Helvetica`, `Arial`, `sans-serif`.
- **Mega Display (Headline)**: `font-size: 64px; font-weight: 800; line-height: 60px; letter-spacing: -0.04em; text-transform: uppercase;`
- **Sub-headline**: `font-size: 20px; font-weight: 700; line-height: 24px; letter-spacing: -0.01em;`
- **Data / Eyebrow**: `font-size: 11px; font-weight: 600; line-height: 14px; letter-spacing: 0.12em; text-transform: uppercase;`
- **Body**: `font-size: 14px; font-weight: 400; line-height: 20px; letter-spacing: 0em;`

---

## 4. Retícula y Reglas Constructivas

- **Esquinas**: `border-radius: 0px;` estricto en todos los contenedores y botones.
- **Líneas divisorias**: `border-bottom: 2px solid #0a0a0a;`
- **Botones**: Bloques sólidos negros con texto blanco, o cajas blancas con borde negro sólido de 2px.

---

## 5. Receta de Implementación en Paper (`write_html`)

```html
<div style="background-color: #f4f4f4; color: #0a0a0a; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; padding: 40px; min-width: 500px; display: flex; flex-direction: column; gap: 24px; border: 2px solid #0a0a0a;">
  <!-- Eyebrow con Filete Suizo -->
  <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #0a0a0a; padding-bottom: 8px;">
    <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; text-transform: uppercase;">ZÜRICH DESIGN ARCHIVE</span>
    <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.15em; color: #d90429;">SERIES № 04</span>
  </div>

  <!-- Titular Monumental Asimétrico -->
  <div style="font-size: 56px; font-weight: 900; line-height: 52px; letter-spacing: -0.03em; text-transform: uppercase; margin: 12px 0;">
    FORM<br>FOLLOWS<br><span style="color: #d90429;">PURPOSE.</span>
  </div>

  <!-- Retícula de Datos de 2 Columnas -->
  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px; border-top: 1px solid #0a0a0a; padding-top: 16px;">
    <div>
      <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #4a4a4a;">DIMENSION</span>
      <p style="font-size: 14px; font-weight: 500; margin: 4px 0 0 0;">Modular 12-Column Grid with proportional gutter ratios.</p>
    </div>
    <div>
      <span style="font-size: 11px; font-weight: 700; letter-spacing: 0.1em; text-transform: uppercase; color: #4a4a4a;">SPECIFICATION</span>
      <p style="font-size: 14px; font-weight: 500; margin: 4px 0 0 0;">Strictly 0px corner radius and pure chromatic contrast.</p>
    </div>
  </div>
</div>
```
