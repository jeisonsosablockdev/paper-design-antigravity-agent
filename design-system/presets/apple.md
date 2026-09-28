# Preset de Diseño: Apple (HIG Precision & Human Centered)

El preset **Apple** implementa las directrices de las *Human Interface Guidelines* (HIG) para aplicaciones web, móviles (iOS) y de escritorio (macOS). Se caracteriza por la claridad, la deferencia del contenido y la profundidad con materiales translúcidos.

---

## 1. Principios de Diseño HIG
- **Claridad**: El texto es legible en cualquier tamaño, los iconos son precisos y los adornos nunca opacan el contenido.
- **Deferencia**: La interfaz pasa a segundo plano; el foco reside en los datos y la interacción del usuario.
- **Profundidad y Materiales**: Fondos translúcidos con desenfoque de fondo (*frosted glass / blur*) que transmiten jerarquía espacial sin saturar la vista.
- **Esquinas Continuas (*Squircles*)**: Radios de curvatura suaves y continuos.

---

## 2. Paleta de Colores y Tokens

| Token | Light Mode | Dark Mode | Función |
|---|---|---|---|
| `--apple-bg-base` | `#f5f5f7` | `#000000` | Fondo raíz de ventana o pantalla |
| `--apple-bg-surface` | `#ffffff` | `#1c1c1e` | Tarjetas agrupadas, celdas de lista |
| `--apple-bg-elevated` | `rgba(255, 255, 255, 0.8)` | `rgba(44, 44, 46, 0.8)` | Barras de navegación con blur |
| `--apple-label-primary` | `#1d1d1f` | `#ffffff` | Titulares y texto principal |
| `--apple-label-secondary` | `#86868b` | `#8e8e93` | Subtítulos y descripciones |
| `--apple-label-tertiary` | `#a1a1a6` | `#636366` | Placeholders y marcas temporales |
| `--apple-separator` | `rgba(60, 60, 67, 0.12)` | `rgba(84, 84, 88, 0.36)` | Líneas divisorias |
| `--apple-tint-blue` | `#0071e3` | `#0a84ff` | Foco, acciones primarias, toggles |

---

## 3. Escala Tipográfica HIG

- **Familia**: `-apple-system`, `SF Pro Display`, `SF Pro Text`, `system-ui`.
- **Large Title**: `font-size: 34px; font-weight: 700; line-height: 41px; letter-spacing: 0.37px;`
- **Title 1**: `font-size: 28px; font-weight: 600; line-height: 34px; letter-spacing: 0.36px;`
- **Title 2**: `font-size: 22px; font-weight: 600; line-height: 28px; letter-spacing: 0.35px;`
- **Headline**: `font-size: 17px; font-weight: 600; line-height: 22px; letter-spacing: -0.41px;`
- **Body**: `font-size: 17px; font-weight: 400; line-height: 22px; letter-spacing: -0.41px;`
- **Callout**: `font-size: 16px; font-weight: 400; line-height: 21px; letter-spacing: -0.32px;`
- **Footnote**: `font-size: 13px; font-weight: 400; line-height: 18px; letter-spacing: -0.08px;`
- **Caption 1**: `font-size: 12px; font-weight: 400; line-height: 16px; letter-spacing: 0px;`

---

## 4. Dimensiones e Interacción Táctil

- **Área táctil mínima**: `44px x 44px` en todos los controles interactivos.
- **Radios de curvatura**:
  - Contenedor agrupado / Card: `14px` o `18px`
  - Botón de acción: `10px` o `9999px` (Pill estándar de iOS)
  - Modales / Action Sheets: `20px` superior
- **Material Translúcido**:
  - `background: rgba(255, 255, 255, 0.72); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px);`

---

## 5. Receta de Implementación en Paper (`write_html`)

```html
<div style="background-color: #f5f5f7; color: #1d1d1f; font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 24px; min-width: 390px; display: flex; flex-direction: column; gap: 16px;">
  <!-- Barra de Navegación Estilo iOS -->
  <div style="background-color: rgba(255, 255, 255, 0.85); backdrop-filter: blur(20px); border-radius: 16px; padding: 16px 20px; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.03); display: flex; justify-content: space-between; align-items: center;">
    <div>
      <span style="font-size: 13px; color: #86868b; text-transform: uppercase; font-weight: 600; letter-spacing: 0.05em;">Security</span>
      <h2 style="font-size: 22px; font-weight: 600; margin: 2px 0 0 0; letter-spacing: -0.35px;">Face ID & Passcode</h2>
    </div>
    <button style="min-height: 44px; min-width: 44px; background-color: #0071e3; color: #ffffff; border: none; border-radius: 22px; font-size: 14px; font-weight: 600; padding: 0 16px; cursor: pointer;">Enable</button>
  </div>
</div>
```
