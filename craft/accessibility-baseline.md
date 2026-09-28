# Línea Base de Accesibilidad (WCAG 2.2 AA / AAA)

La accesibilidad no es un añadido opcional; es un requisito funcional evaluado en el arnés de pruebas de `visual-qa`.

---

## 1. Ratios de Contraste Obligatorios

| Tipo de Elemento | Nivel AA (Mínimo) | Nivel AAA (Óptimo) | Medición |
| :--- | :--- | :--- | :--- |
| **Texto Normal (< 18pt / 24px)** | **4.5 : 1** | 7.0 : 1 | Texto contra su fondo contenedor inmediato. |
| **Texto Grande ($\ge$ 18pt / 24px o $\ge$ 14pt negrita)** | **3.0 : 1** | 4.5 : 1 | Titulares y números clave de KPIs. |
| **Componentes de UI y Bordes Activos** | **3.0 : 1** | 3.0 : 1 | Bordes de inputs, checkboxes, toggles y botones. |

> [!WARNING] Cuidado con los Grises Muted
> Un error clásico de los agentes es usar textos secundarios como `#94A3B8` sobre fondos blancos `#FFFFFF`, lo cual produce un contraste de apenas **2.6:1** (reprobando WCAG). Usa al menos `#64748B` sobre blanco para alcanzar `4.6:1`.

---

## 2. Áreas de Toque Mínimas (*Tap Targets*)
- **Móvil (iOS / Android)**:
  - Todo elemento interactivo (botones, enlaces, iconos de navegación, checkboxes) debe tener una dimensión mínima de **`44px x 44px`** (o `48px x 48px` en web móvil).
  - Si el icono mide visualmente `20px x 20px`, el contenedor o slot circundante debe tener padding para garantizar el área táctil mínima sin que se encimen elementos adyacentes.

---

## 3. Estados de Formulario y Error
- **Nunca depender únicamente del color**: Un campo en error no debe distinguirse únicamente por el borde rojo `#DC2626`. Debe incluir obligatoriamente:
  1. Icono de advertencia o error.
  2. Mensaje textual descriptivo (`12px` debajo del input).
  3. Etiqueta persistente visible (no depender solo de placeholders que desaparecen al escribir).
