---
name: color-expert
description: Genera y valida paletas cromáticas armónicas, escalas tonales (50-950) accesibles bajo WCAG AA/AAA y las sincroniza con los tokens de Paper.
---

# Workflow: /color-expert

Este skill dota al sistema de capacidades avanzadas de colorimetría perceptualmente uniforme, generación de escalas tonales y verificación matemática de contraste para interfaces y diseño gráfico en Paper.

---

## 1. Generación de Escalas Tonales (50 a 950)

A partir de un color semilla (*brand seed color*), calcula una escala matemática armónica basada en luminancia perceptiva:

| Tono | Rango de Luminancia (L) | Función Semántica Habitual |
|---|---|---|
| `50` | 96% - 98% | Fondo sutil, hover en modo claro, acento tenue |
| `100` | 90% - 94% | Borde tenue, fondo de tarjeta secundaria |
| `200` | 82% - 88% | Bordes de inputs inactivos |
| `300` | 70% - 78% | Bordes interactivos |
| `400` | 55% - 65% | Iconos secundarios, texto muted en dark mode |
| `500` | 45% - 50% | Color primario base / acento de marca |
| `600` | 38% - 42% | Hover del color primario en modo claro |
| `700` | 28% - 34% | Estados activos/pressed, texto sobre tonos claros |
| `800` | 18% - 24% | Bordes en dark mode |
| `900` | 12% - 16% | Superficie elevada en dark mode, texto oscuro |
| `950` | 6% - 8% | Fondo raíz en dark mode |

---

## 2. Validación de Contraste WCAG 2.1

Todo par de colores interactivo o tipográfico generado debe superar:
- **Texto Normal (< 18px o < 14px bold)**: Contraste $\ge 4.5:1$ (Nivel AA) o $\ge 7:1$ (Nivel AAA).
- **Texto Grande / Display ($\ge 18px$ o $\ge 14px$ bold)**: Contraste $\ge 3:1$ (Nivel AA) o $\ge 4.5:1$ (Nivel AAA).
- **Componentes de UI y Estados (Bordes, Iconos clave)**: Contraste $\ge 3:1$ respecto a su fondo adyacente.

---

## 3. Protocolo de Sincronización con Paper MCP

1. **Definir tokens semánticos**:
   Mapear la escala a roles de producto:
   ```json
   {
     "brand": {
       "primary": "#635bff",
       "primary-hover": "#544dc9",
       "surface": "#f6f9fc",
       "text-on-primary": "#ffffff"
     }
   }
   ```
2. **Actualizar localmente**:
   Sobrescribir o fusionar en `design-system/tokens/colors.json`.
3. **Inyectar en Paper Canvas**:
   - Consultar tokens existentes con `get_tokens`.
   - Registrar los nuevos tokens en Paper mediante `create_tokens` o actualizar los existentes con `set_tokens`.
4. **Verificación visual**:
   - Generar un artboard de muestra o paleta swatches en Paper para verificación rápida con `get_screenshot`.
