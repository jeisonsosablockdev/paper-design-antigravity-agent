# Preset de Diseño: Stripe (Fintech & Clarity Excellence)

El preset **Stripe** está optimizado para interfaces financieras, pasarelas de pago, paneles analíticos B2B, checkout e interfaces orientadas a la máxima confianza y conversión.

---

## 1. Filosofía y Atmósfera
- **Tema prioritario**: Light mode hiper pulido y luminoso (base `#f6f9fc` con tarjetas blancas puras `#ffffff`).
- **Jerarquía y Confianza**: Máxima legibilidad, contraste tipográfico estricto, micro-etiquetas nítidas y estados visuales amigables.
- **Tratamiento de Sombras (Multi-stop Shadows)**: En lugar de bordes marcados, Stripe utiliza elevación suave con sombras difusas compuestas para separar planos.
- **Acentos Vivos**: El icónico Blurple (`#635bff`) acompañado de tonos semánticos vibrantes (Cyan, Esmeralda, Coral).

---

## 2. Paleta de Colores

| Token | Hex / RGBA | Uso |
|---|---|---|
| `--stripe-bg-root` | `#f6f9fc` | Lienzo principal de la aplicación |
| `--stripe-bg-surface` | `#ffffff` | Tarjetas de contenido, tablas, modales |
| `--stripe-text-primary` | `#0a2540` | Títulos, cantidades numéricas, etiquetas principales |
| `--stripe-text-secondary` | `#425466` | Párrafos descriptivos, labels de formularios |
| `--stripe-text-muted` | `#8898aa` | Placeholders, marcas secundarias, tooltips |
| `--stripe-border` | `#e6ebf1` | Bordes sutiles de inputs y tablas |
| `--stripe-accent` | `#635bff` | Botón primario, links clave, switches activos |
| `--stripe-success` | `#00d924` | Estados completados, cobros exitosos |
| `--stripe-info` | `#00d4b2` | Tasa de conversión, indicadores positivos |
| `--stripe-danger` | `#df1b41` | Errores de validación, pagos fallidos |

---

## 3. Tipografía y Escala

- **Familia recomendada**: `Inter`, `-apple-system`, `system-ui`.
- **Display / Monto Principal**: `font-size: 32px; font-weight: 700; line-height: 40px; letter-spacing: -0.025em;`
- **H1 / Título de Página**: `font-size: 20px; font-weight: 600; line-height: 28px; letter-spacing: -0.015em;`
- **H2 / Título de Card**: `font-size: 15px; font-weight: 600; line-height: 20px; letter-spacing: -0.01em;`
- **Body / Label**: `font-size: 14px; font-weight: 400; line-height: 20px; color: #425466;`
- **Micro / Tag**: `font-size: 12px; font-weight: 500; line-height: 16px;`

---

## 4. Radios y Sombras

- **Radios (`border-radius`)**:
  - Contenedor / Card: `8px` o `12px`
  - Inputs / Controles: `6px`
  - Botones de acción / Pill: `6px` o `9999px`
- **Sombras de Elevación (Stripe Multi-stop Shadow)**:
  - Card estándar: `box-shadow: 0 13px 27px -5px rgba(50, 50, 93, 0.08), 0 8px 16px -8px rgba(0, 0, 0, 0.06);`
  - Card flotante / Hover: `box-shadow: 0 30px 60px -12px rgba(50, 50, 93, 0.15), 0 18px 36px -18px rgba(0, 0, 0, 0.15);`

---

## 5. Receta de Implementación en Paper (`write_html`)

```html
<div style="background-color: #f6f9fc; color: #0a2540; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; padding: 32px; min-width: 480px; display: flex; flex-direction: column; gap: 20px;">
  <!-- Tarjeta de Pago / Resumen -->
  <div style="background-color: #ffffff; border-radius: 10px; padding: 24px; box-shadow: 0 13px 27px -5px rgba(50, 50, 93, 0.08), 0 8px 16px -8px rgba(0, 0, 0, 0.06); display: flex; flex-direction: column; gap: 16px;">
    <div style="display: flex; justify-content: space-between; align-items: baseline;">
      <span style="font-size: 13px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; color: #8898aa;">Monthly Volume</span>
      <span style="font-size: 12px; font-weight: 600; color: #00d924; background-color: rgba(0, 217, 36, 0.1); padding: 2px 8px; border-radius: 9999px;">+18.4%</span>
    </div>
    <div style="font-size: 32px; font-weight: 700; color: #0a2540; letter-spacing: -0.025em;">
      $128,430.00 <span style="font-size: 14px; font-weight: 400; color: #425466;">USD</span>
    </div>
    <div style="height: 1px; background-color: #e6ebf1; margin: 4px 0;"></div>
    <div style="display: flex; justify-content: space-between; align-items: center;">
      <span style="font-size: 13px; color: #425466;">Payout scheduled for tomorrow</span>
      <button style="background-color: #635bff; color: #ffffff; border: none; border-radius: 6px; padding: 8px 16px; font-size: 13px; font-weight: 600; box-shadow: 0 2px 4px rgba(0, 0, 0, 0.07); cursor: pointer;">Manage Payouts</button>
    </div>
  </div>
</div>
```
