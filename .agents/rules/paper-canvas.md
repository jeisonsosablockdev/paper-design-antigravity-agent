# Reglas de Manipulación del Canvas: Paper

Estas reglas gobiernan las operaciones sobre el canvas de Paper para garantizar estabilidad, consistencia y prevención de artefactos visuales.

## 1. Principios de Layout
- Todo artboard debe comenzar con las dimensiones exactas del viewport especificado (ej. `390x844` para móvil).
- Cuando el contenido vertical crezca más allá de la altura inicial, **NO** calcular alturas fijas arbitrarias. Usar `height: "fit-content"` mediante `update_styles`.
- En filas repetidas (listas, navbars, tarjetas con iconos): aplicar siempre `flexShrink: 0` a los slots de iconos y botones para evitar distorsión o aplastamiento.

## 2. Tipografía y Estilos
- Cargar `get_font_family_info` antes de la primera aplicación de tipografía en una sesión.
- Unidades estrictas: `px` para `font-size` y `line-height`, `em` para `letter-spacing`.
- No usar unidades relativas porcentuales (`rem`, `vh`, `%`) para tipografía.

## 3. Seguridad de Sesión
- Siempre cerrar ciclos de trabajo con `finish_working_on_nodes`.
- Nunca revelar identificadores internos de nodo (*node IDs*) al usuario en las respuestas de texto.
