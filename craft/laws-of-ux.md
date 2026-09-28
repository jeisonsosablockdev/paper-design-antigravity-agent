# Leyes de UX y Ergonomía Cognitiva en Paper.Design

Esta guía define las leyes de experiencia de usuario y ergonomía cognitiva que todo agente (`ui-builder`, `flyer-designer`, `design-architect`) debe aplicar al componer interfaces o piezas gráficas en Paper.

---

## 1. Ley de Fitts (Fitts's Law)
> *El tiempo necesario para alcanzar un objetivo depende de la distancia y el tamaño del objetivo.*

### Reglas de Diseño:
- **Áreas interactivas mínimas**:
  - Táctil (Mobile): `min-height: 44px; min-width: 44px;`
  - Cursor (Desktop): `min-height: 36px; padding: 8px 16px;`
- **Ubicación de acciones críticas**:
  - En móviles: barra inferior (*bottom action bar*) o esquina inferior derecha para accesibilidad con el pulgar.
  - En modales/diálogos: acciones de avance ("Guardar", "Confirmar") en el extremo final natural del flujo de lectura.
- **Ampliar el área de click**:
  - En inputs con icono o links sutiles, asegurar que el contenedor padre capture el evento o tenga suficiente padding interno.

---

## 2. Ley de Hick (Hick's Law)
> *El tiempo necesario para tomar una decisión se incrementa logarítmicamente con el número y la complejidad de las alternativas.*

### Reglas de Diseño:
- **Una acción principal clara por vista**: Solo un botón con estilo `solid` / `primary`. El resto deben ser `outline`, `ghost` o texto.
- **División de formularios largos**: Formularios con más de 5 campos deben agruparse en pasos (*steppers* o tarjetas conceptuales).
- **Menús y desplegables**: Máximo 5 a 7 opciones directas. Si hay más, categorizar con subencabezados o buscador integrado.
- **Filtros**: Ocultar filtros avanzados tras un botón "Filtros" o *disclosure panel*.

---

## 3. Ley de Miller y Chunking (Miller's Law)
> *La persona promedio sólo puede mantener en su memoria de trabajo 7 (± 2) elementos a la vez.*

### Reglas de Diseño:
- **Chunking de datos**:
  - Tarjetas de crédito en grupos de 4 (`•••• •••• •••• 1234`).
  - Teléfonos con código de área separado (`+57 300 123 4567`).
  - Números de serie y tokens con guiones o espacios.
- **Listas y feeds**: Máximo 5-7 elementos visibles antes de requerir scroll, paginación o botón "Cargar más".
- **Tableros / Dashboards**: Agrupar KPIs en bloques de 3 o 4 métricas clave, no una pared infinita de números sueltos.

---

## 4. Ley de Jakob (Jakob's Law)
> *Los usuarios pasan la mayor parte de su tiempo en otros sitios y esperan que tu producto funcione de la misma manera que los sitios que ya conocen.*

### Reglas de Diseño:
- **Ubicaciones estándar**:
  - Logo / Home: Esquina superior izquierda.
  - Barra de búsqueda: Centro o derecha del header.
  - Perfil / Notificaciones / Carrito: Esquina superior derecha.
  - Navegación principal: Barra superior en Desktop; barra inferior de 4-5 tabs en Mobile.
- **Comportamiento predecible**:
  - La 'X' en la esquina superior derecha siempre cierra el modal o panel.
  - Los botones de confirmación van a la derecha del botón de cancelar (o agrupados con jerarquía visual distintiva).

---

## 5. Principios de la Gestalt (Percepción Visual)

### A. Ley de Proximidad (*Proximity*)
- Elementos relacionados deben estar visualmente más cerca entre sí que de elementos no relacionados.
- **Escala de Espaciado Relativo**:
  - Entre label e input: `gap: 6px` o `8px`.
  - Entre campos de un mismo grupo: `gap: 16px`.
  - Entre secciones distintas: `gap: 32px` o `48px`.

### B. Ley de Región Común (*Common Region*)
- Elementos encerrados dentro de un mismo límite visual (card, borde, fondo diferenciado) se perciben como un grupo unificado.
- Usar tarjetas con `background` sutil y `border: 1px solid var(--border)` para aislar módulos lógicos.

### C. Ley de Similitud (*Similarity*)
- Elementos que comparten el mismo estilo visual (color, forma, tipografía) se perciben con la misma función.
- Si un tag o chip es clickeable/filtrable, debe tener un indicador visual o hover distintivo versus un tag de solo lectura.

---

## 6. Checklist de Validación Cognitiva antes de `finish_working_on_nodes`

- [ ] ¿Hay una única acción primaria visible inmediatamente en el primer pliegue?
- [ ] ¿Los botones y campos táctiles cumplen con el mínimo de 44x44px en móviles y 36px en escritorio?
- [ ] ¿Los inputs y textos relacionados respetan la Ley de Proximidad con espaciados proporcionales?
- [ ] ¿Los formularios o dashboards largos están divididos en bloques (*chunks*) de 3 a 5 elementos?
- [ ] ¿La interfaz respeta las convenciones familiares de navegación e interacción (Ley de Jakob)?
