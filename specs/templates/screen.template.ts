import { type ScreenSpec, ScreenSpecSchema } from "../schemas/screen.schema.ts";

/**
 * Plantilla Base de Spec (Modo Draft-First)
 * El entrevistador genera este archivo con supuestos iniciales sensatos
 * y marca con comentarios `// TODO: Confirmar con usuario:` las dudas exactas.
 */
export const templateScreenSpec: ScreenSpec = ScreenSpecSchema.parse({
  id: "screen-example-name",
  version: "1.0.0",
  status: "draft", // draft -> in-review -> frozen
  metadata: {
    title: "Nombre de la Pantalla",
    description: "Propósito funcional de la interfaz a diseñar",
    author: "User + Spec Interviewer",
    createdAt: new Date().toISOString(),
  },
  // TODO: Confirmar con usuario: ¿Viewport móvil (iPhone 15 390x844) o desktop (1440x900)?
  viewport: {
    width: 390,
    height: 844,
    device: "iPhone 15",
    orientation: "portrait",
  },
  components: [
    {
      id: "header-navigation",
      role: "header",
      height: "fit-content",
      flexShrink: 0,
      label: "Barra superior de navegación con botón volver",
    },
    {
      id: "main-content-container",
      role: "container",
      height: "fit-content",
      flexShrink: 0,
      children: [
        // TODO: Confirmar con usuario: ¿Qué campos o elementos deben incluirse aquí?
        {
          id: "content-slot-primary",
          role: "slot",
          height: "fit-content",
          label: "Slot de contenido principal",
        },
      ],
    },
    {
      id: "primary-action-button",
      role: "button",
      height: 48,
      flexShrink: 0,
      label: "Acción Principal",
      tokens: {
        background: "colors.primary.default",
        color: "colors.text.inverse",
      },
    },
  ],
  acceptanceCriteria: [
    {
      id: "AC-01",
      description: "El botón de acción debe tener una altura mínima de 48px para tap target accesible.",
      type: "accessibility",
    },
    {
      id: "AC-02",
      description: "Todos los textos deben utilizar tipografía en 'px' y familias autorizadas.",
      type: "typography",
    },
    // TODO: Confirmar con usuario: ¿Criterios específicos de estados de error o loading?
  ],
});
