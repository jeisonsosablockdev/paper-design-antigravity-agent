# Presets de Sistema de Diseño (OpenDesign Heritage)

Esta carpeta contiene presets de dirección de arte y diseño de interfaz probados y optimizados para **Paper.Design**. Cada preset proporciona contratos de tokens, reglas tipográficas y recetas HTML ejecutables con `write_html`.

---

## Presets Disponibles

1. **[`linear.md`](./linear.md)**: Modo oscuro artesanal (*Dark Mode Craftsman*), interfaz técnica densa, bordes de baja opacidad y acento eléctrico.
2. **[`stripe.md`](./stripe.md)**: Modo claro de alta confianza (*Fintech & Clarity Excellence*), sombras compuestas multi-stop y tonos vibrantes.
3. **[`apple.md`](./apple.md)**: Directrices de interfaz humana (*Human Interface Guidelines*), materiales translúcidos (*frosted glass*), squircles y accesibilidad táctil de 44px.
4. **[`swiss.md`](./swiss.md)**: Estilo Tipográfico Internacional (*Swiss Style*), retícula modular pura, esquinas en 0px, titulares monumentales y alto contraste editorial.
5. **[`vercel.md`](./vercel.md)**: Sistema de diseño Geist (*Monochrome Developer First*), contraste puro blanco/negro y Geist Mono.
6. **[`bento.md`](./bento.md)**: Cuadrícula modular asimétrica (*Modern Bento Grid*), micro-narrativas y radios táctiles de 20px.

---

## Cómo Usar un Preset

Los subagentes `spec-interviewer`, `ui-builder` y `flyer-designer` pueden referenciar directamente cualquiera de estos presets durante la entrevista o en el contrato de especificación (`preset: "linear" | "stripe" | "apple" | "swiss"`), asegurando coherencia visual inmediata sin tener que definir tokens desde cero.
