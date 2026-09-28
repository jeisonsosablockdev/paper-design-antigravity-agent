# Guía de Componentes: Paper.Design

Esta guía define las reglas de construcción de componentes para el agente `ui-builder` y las validaciones de `visual-qa`.

---

## 1. Botones (Buttons)
- **Altura Mínima**: `48px` en móvil para cumplir con tap targets WCAG.
- **Border Radius**: `8px` (`radii.md`).
- **Estados**:
  - *Primary*: Fondo `colors.primary.default`, texto `colors.text.inverse`.
  - *Secondary*: Borde `1px` sólido `colors.border.default`, fondo `transparent`.
- **Flexibility**: `flexShrink: 0` siempre.

## 2. Formularios e Inputs (Inputs & Fields)
- **Altura**: `44px` a `48px`.
- **Padding Horizontal**: `16px` (`spacing.base`).
- **Tipografía de Texto**: `14px` o `16px` (`Inter`, regular).
- **Mensajes de Error**: Debajo del input con tamaño `12px` y color `colors.status.danger`.

## 3. Tarjetas y Contenedores (Cards & Containers)
- **Fondo**: `colors.background.surface`.
- **Borde**: `1px` sólido `colors.border.subtle`.
- **Padding Interno**: `16px` o `24px`.
- **Altura**: Preferir `height: "fit-content"` cuando contenga listas o textos variables.

## 4. Filas y Listas (Row Items & Navbars)
- **Slots Fijos**: Iconos a la izquierda y botones de acción a la derecha deben tener ancho fijo (`24px`, `32px` o `40px`) y `flexShrink: 0`.
- **Espaciado**: Usar `gap: 12px` o `16px` entre elementos de la fila.
