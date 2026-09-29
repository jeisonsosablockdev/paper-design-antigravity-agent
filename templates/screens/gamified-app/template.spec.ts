import { type ScreenSpec, ScreenSpecSchema } from "../../../specs/schemas/screen.schema.ts";

/**
 * Especificación de Pantalla derivada del Catálogo OpenDesign
 * ID: screen-od-gamified-app
 * Generado automáticamente por OpenDesign Integration Engine
 */
export const templateScreenSpec: ScreenSpec = ScreenSpecSchema.parse({
  "id": "screen-od-gamified-app",
  "version": "1.0.0",
  "status": "draft",
  "metadata": {
    "title": "Gamified Learning App",
    "description": "Interfaz lúdica de aprendizaje con barras de XP, rachas de días, misiones completadas y avatares 3D.",
    "author": "OpenDesign Importer + Spec Interviewer",
    "createdAt": "2026-09-28T05:57:07.325Z"
  },
  "viewport": {
    "width": 390,
    "height": 844,
    "device": "iPhone 15"
  },
  "components": [
    {
      "id": "header-navigation",
      "role": "header",
      "height": "fit-content",
      "flexShrink": 0,
      "label": "Barra de navegación superior",
      "tokens": {
        "background": "colors.background.surface",
        "color": "colors.text.primary",
        "border": "colors.border.subtle"
      }
    },
    {
      "id": "main-content-layout",
      "role": "container",
      "height": "fit-content",
      "flexShrink": 0,
      "label": "Contenedor de contenido estructurado",
      "tokens": {
        "background": "colors.background.canvas"
      },
      "children": [
        {
          "id": "primary-content-card",
          "role": "card",
          "height": "fit-content",
          "flexShrink": 0,
          "label": "Tarjeta principal del módulo",
          "tokens": {
            "background": "colors.background.elevated",
            "border": "colors.border.default"
          }
        }
      ]
    },
    {
      "id": "primary-action-btn",
      "role": "button",
      "height": 48,
      "flexShrink": 0,
      "label": "Acción principal interactiva",
      "tokens": {
        "background": "colors.primary.default",
        "color": "colors.text.inverse"
      }
    }
  ],
  "acceptanceCriteria": [
    {
      "id": "AC-01",
      "description": "Todos los botones de acción deben tener una altura mínima de 44px (tap target accesible).",
      "type": "accessibility"
    },
    {
      "id": "AC-02",
      "description": "La jerarquía tipográfica debe utilizar exclusivamente valores en px y familias del sistema.",
      "type": "typography"
    },
    {
      "id": "AC-03",
      "description": "El contenedor raíz debe evitar alturas fijas arbitrarias y usar height: fit-content para evitar clipping.",
      "type": "layout"
    }
  ]
});
