# Preset de Diseño: Linear (Dark Mode Craftsman)

El preset **Linear** está diseñado para interfaces técnicas de alto rendimiento, herramientas para desarrolladores, paneles de productividad y SaaS moderno.

---

## 1. Filosofía y Atmósfera
- **Tema prioritario**: Dark mode profundo y sobrio (nunca negro puro `#000000` plano para fondos de contenedor; usa `#08090a` con elevaciones graduales).
- **Densidad de información**: Media a alta. Interfaz compacta, precisa y orientada al teclado (*keyboard-first*).
- **Tratamiento de bordes**: Líneas ultra finas con opacidades bajas (`rgba(255, 255, 255, 0.08)` a `0.12`).
- **Glow & Iluminación**: Reflejos de luz direccionales y bordes sutilmente iluminados en lugar de sombras proyectadas difusas.

---

## 2. Paleta de Colores

| Token | Hex / RGBA | Uso |
|---|---|---|
| `--linear-bg-root` | `#08090a` | Fondo del canvas / artboard principal |
| `--linear-bg-surface` | `#0f1011` | Tarjetas, paneles laterales, barras de herramientas |
| `--linear-bg-elevated` | `#161719` | Modales, popovers, menús contextuales |
| `--linear-border-subtle` | `rgba(255, 255, 255, 0.07)` | Divisores de fila, bordes de contenedor |
| `--linear-border-hover` | `rgba(255, 255, 255, 0.16)` | Estados interactivos hover |
| `--linear-text-primary` | `#f7f8f8` | Titulares, texto activo, labels importantes |
| `--linear-text-secondary` | `#8a8f98` | Descripciones breves, metadatos, iconos inactivos |
| `--linear-text-muted` | `#62666d` | Timestamps, placeholders, atajos inactivos |
| `--linear-accent` | `#5e6ad2` | Botón primario, focos activos, badges clave |
| `--linear-accent-hover` | `#6875e5` | Hover en acción primaria |

---

## 3. Tipografía y Escala

- **Familia recomendada**: `Geist Sans`, `Inter` o `-apple-system`.
- **Display / H1**: `font-size: 24px; font-weight: 600; line-height: 32px; letter-spacing: -0.02em;`
- **H2 / Sección**: `font-size: 16px; font-weight: 600; line-height: 22px; letter-spacing: -0.01em;`
- **Body / Item**: `font-size: 13px; font-weight: 400; line-height: 18px; letter-spacing: -0.005em;`
- **Caption / Kbd**: `font-size: 11px; font-weight: 500; line-height: 14px; letter-spacing: 0.02em;`

---

## 4. Radios y Espaciado

- **Radios (`border-radius`)**:
  - Contenedor / Card: `8px`
  - Inputs / Botones: `6px`
  - Badges / Kbd: `4px`
- **Espaciado modular**:
  - Padding de tarjeta: `16px` o `20px`
  - Gap en filas de datos: `8px`
  - Altura estándar de input/botón: `32px` a `36px`

---

## 5. Receta de Implementación en Paper (`write_html`)

```html
<div style="background-color: #08090a; color: #f7f8f8; font-family: 'Inter', sans-serif; padding: 24px; min-width: 480px; display: flex; flex-direction: column; gap: 16px;">
  <!-- Card Elevada -->
  <div style="background-color: #0f1011; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 8px; padding: 20px; display: flex; flex-direction: column; gap: 12px;">
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 14px; font-weight: 600; color: #f7f8f8;">Active Deployment</span>
      <span style="font-size: 11px; background-color: rgba(94, 106, 210, 0.15); color: #5e6ad2; border: 1px solid rgba(94, 106, 210, 0.3); border-radius: 4px; padding: 2px 8px; font-weight: 500;">Production</span>
    </div>
    <p style="font-size: 13px; line-height: 18px; color: #8a8f98; margin: 0;">Automated pipeline sync completed 2 minutes ago across 4 edge regions.</p>
    <div style="display: flex; gap: 8px; margin-top: 4px;">
      <button style="background-color: #5e6ad2; color: #ffffff; border: none; border-radius: 6px; padding: 6px 14px; font-size: 12px; font-weight: 500; cursor: pointer;">View Logs</button>
      <button style="background-color: transparent; color: #8a8f98; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 6px; padding: 6px 14px; font-size: 12px; font-weight: 500; cursor: pointer;">Rollback</button>
    </div>
  </div>
</div>
```
