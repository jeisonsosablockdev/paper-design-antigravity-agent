# Jerarquía Tipográfica y Ritmo Visual

La tipografía representa más del 80% de una interfaz digital. En Paper, donde las unidades son estrictamente en `px` y `em`, se aplican las siguientes reglas matemáticas:

---

## 1. Escala Modular (Ratio 1.25x - Major Third)

Usa exclusivamente los siguientes escalones para garantizar armonía visual:

| Nivel | Tamaño (`px`) | Interlineado (`line-height`) | Interletrado (`letter-spacing`) | Peso | Uso Típico |
| :--- | :--- | :--- | :--- | :--- | :--- |
| **Display / Hero** | `48px` – `64px` | `1.1x` (`56px` – `72px`) | `-0.03em` a `-0.05em` | `700` / `800` | Portadas, flyers, cifras gigantes de KPIs. |
| **H1 (Título de Página)** | `32px` – `36px` | `1.15x` (`40px` – `44px`) | `-0.025em` | `700` | Encabezado principal de pantalla. |
| **H2 (Sección)** | `24px` | `1.25x` (`30px` – `32px`) | `-0.02em` | `600` | Títulos de tarjetas principales y grupos. |
| **H3 (Subsección)** | `18px` – `20px` | `1.3x` (`24px` – `26px`) | `-0.01em` | `600` | Títulos de listas, modales, widgets. |
| **Body (Cuerpo)** | `14px` – `16px` | `1.5x` (`22px` – `24px`) | `0em` | `400` | Párrafos, descripciones, contenido. |
| **Small / Meta** | `12px` – `13px` | `1.4x` (`16px` – `18px`) | `0em` | `400` / `500` | Fechas, badges secundarios, tooltips. |
| **Eyebrow / Overline** | `11px` – `12px` | `1.2x` (`14px` – `16px`) | `+0.05em` a `+0.08em` | `600` / `700` | Categorías en MAYÚSCULAS sobre títulos. |

---

## 2. Reglas Cruciales de Interletrado (`letterSpacing`)
- **Regla Inversa de Tracking**: A mayor tamaño de fuente, **menor** debe ser el interletrado (más negativo). En textos gigantes (`>= 32px`), las letras tienden a separarse visualmente; contrarréstalo con `-0.02em` a `-0.04em`.
- **Textos en Mayúsculas (*All-Caps*)**: Todo texto en mayúsculas (badges, eyebrows, tags) **debe** llevar un interletrado positivo (`+0.05em` a `+0.1em`) para permitir que el ojo distinga los caracteres en bloque.

---

## 3. Ancho de Línea (*Measure*)
- Nunca permitas que un párrafo de texto corrido supere los **65 a 75 caracteres** de ancho (aproximadamente `580px` a `640px`). Las líneas excesivamente largas agotan la vista del usuario y rompen la comprensión lectora.
