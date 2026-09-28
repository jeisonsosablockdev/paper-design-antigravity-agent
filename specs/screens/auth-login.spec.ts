import { type ScreenSpec, ScreenSpecSchema } from "../schemas/screen.schema.ts";

export const authLoginSpec: ScreenSpec = ScreenSpecSchema.parse({
  id: "screen-auth-login",
  version: "1.0.0",
  status: "frozen",
  metadata: {
    title: "Inicio de Sesión Móvil",
    description: "Flujo principal de acceso con email, password y autenticación social",
    author: "User + Spec Interviewer",
    createdAt: "2026-09-27T23:30:00Z",
  },
  viewport: {
    width: 390,
    height: 844,
    device: "iPhone 15",
    orientation: "portrait",
  },
  components: [
    {
      id: "brand-header",
      role: "header",
      height: "fit-content",
      flexShrink: 0,
      label: "Logotipo y bienvenida",
    },
    {
      id: "credentials-form",
      role: "form",
      height: "fit-content",
      flexShrink: 0,
      children: [
        { id: "email-field", role: "slot", label: "Campo de correo electrónico" },
        { id: "password-field", role: "slot", label: "Campo de contraseña" },
      ],
    },
    {
      id: "primary-login-button",
      role: "button",
      height: 48,
      flexShrink: 0,
      label: "Iniciar Sesión",
      tokens: {
        background: "colors.primary.default",
        color: "colors.text.inverse",
      },
    },
    {
      id: "social-login-actions",
      role: "slot",
      height: "fit-content",
      flexShrink: 0,
      label: "Botones de inicio rápido Apple y Google",
    },
  ],
  acceptanceCriteria: [
    {
      id: "AC-01",
      description: "El botón de login debe tener altura fija de 48px para tap target mínimo WCAG.",
      type: "accessibility",
    },
    {
      id: "AC-02",
      description: "Los contenedores y slots deben utilizar flexShrink: 0 para evitar desalineaciones.",
      type: "layout",
    },
    {
      id: "AC-03",
      description: "Todos los textos deben utilizar tipografía en 'px' y la familia Inter.",
      type: "typography",
    },
  ],
});
