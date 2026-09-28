# Brief Sintético: Pantalla de Autenticación Móvil (Login)

- **Pantalla**: `Auth_Login`
- **Dispositivo objetivo**: iPhone 15 (`390x844px`)
- **Público**: Usuarios de la aplicación móvil de productividad

## Requerimientos Funcionales
1. **Encabezado**: Logotipo de la marca con saludo de bienvenida conciso.
2. **Formulario**:
   - Campo de correo electrónico con validación visual.
   - Campo de contraseña con opción de alternar visibilidad.
3. **Acción Principal**:
   - Botón de "Iniciar Sesión" con fondo `colors.primary.default`, tap target mínimo de `48px`.
4. **Acciones Secundarias**:
   - Enlace "¿Olvidaste tu contraseña?".
   - Botón de inicio rápido con Apple ID.

## Criterios de Calidad
- Tipografía exclusivamente en `px` con la familia `Inter`.
- Contraste WCAG AA en botones y textos secundarios.
- Alturas dinámicas `fit-content` para evitar clipping en pantallas pequeñas.
