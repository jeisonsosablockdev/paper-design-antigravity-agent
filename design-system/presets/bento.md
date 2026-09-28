# Preset de Diseño: Bento Grid (Modular Modern UI)

El preset **Bento Grid** está inspirado en las cajas bento japonesas y popularizado por Apple, Linear y Stripe en sus páginas de producto. Organiza información diversa en celdas modulares con bordes sutiles, esquinas suaves y jerarquía de aspecto variable.

---

## 1. Filosofía y Estética
- **Modularidad Asimétrica**: Combina celdas de diferentes tamaños (1x1, 2x1, 2x2, 3x1) en una cuadrícula CSS armónica.
- **Micro-narrativas en cada Celda**: Cada cuadrante es un componente autosuficiente con su propio titular, gráfico o métrica.
- **Bordes Translúcidos y Elevación Mínima**: Borde fino de `1px` con opacidad sutil (`rgba(0,0,0,0.06)` en light, `rgba(255,255,255,0.08)` en dark).
- **Esquinas Generosas**: Radios de `16px` a `24px` que otorgan una sensación táctil y moderna.

---

## 2. Paleta de Tokens (Neutral Bento)

| Token | Light Hex | Dark Hex | Función |
|---|---|---|---|
| `--bento-canvas` | `#fbfbfd` | `#0b0c0e` | Fondo del lienzo principal |
| `--bento-card-bg` | `#ffffff` | `#141619` | Fondo de las celdas bento |
| `--bento-border` | `rgba(0, 0, 0, 0.06)` | `rgba(255, 255, 255, 0.08)` | Bordes exteriores de cada celda |
| `--bento-title` | `#1d1d1f` | `#f0f2f5` | Titulares de celda |
| `--bento-desc` | `#6e6e73` | `#8b949e` | Texto explicativo |
| `--bento-accent` | `#6366f1` | `#818cf8` | Acento en gráficos o badges |

---

## 3. Retícula y Dimensiones

- **Gaps recomendados**: `16px` o `20px` entre celdas.
- **Radios (`border-radius`)**: `18px` o `20px` para las tarjetas bento.
- **Padding interno**: `24px` uniforme en cada tarjeta.

---

## 4. Receta de Implementación en Paper (`write_html`)

```html
<div style="background-color: #0b0c0e; color: #f0f2f5; font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 32px; min-width: 600px; display: flex; flex-direction: column; gap: 20px;">
  <!-- Bento Grid Container -->
  <div style="display: grid; grid-template-columns: 2fr 1fr; gap: 16px;">
    <!-- Celda Grande (2 Columnas) -->
    <div style="background-color: #141619; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 180px;">
      <div>
        <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #818cf8;">Instant Edge Sync</span>
        <h3 style="font-size: 20px; font-weight: 600; margin: 6px 0 0 0; letter-spacing: -0.02em;">Global State Replication</h3>
      </div>
      <p style="font-size: 13px; color: #8b949e; margin: 0; line-height: 18px;">Sub-millisecond writes propagated across 32 regional datacenters automatically.</p>
    </div>

    <!-- Celda Pequeña (1 Columna) -->
    <div style="background-color: #141619; border: 1px solid rgba(255, 255, 255, 0.08); border-radius: 20px; padding: 24px; display: flex; flex-direction: column; justify-content: space-between; min-height: 180px;">
      <span style="font-size: 11px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em; color: #8b949e;">Uptime</span>
      <div>
        <div style="font-size: 36px; font-weight: 700; color: #ffffff; letter-spacing: -0.03em;">99.99%</div>
        <span style="font-size: 12px; color: #34d399;">+0.02% vs last month</span>
      </div>
    </div>
  </div>
</div>
```
