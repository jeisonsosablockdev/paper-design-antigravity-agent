# Brand Inbox: Swiss Studio

Esta carpeta es la zona de entrada (*dropzone*) oficial para suministrar activos, hojas de estilo y referencias a esta marca.

## ¿Qué puedes soltar aquí?
- **Hojas de estilo y Tokens (`.css`, `.scss`, `.json`)**: Archivos con variables CSS (`--primary`, etc.), tokens en formato W3C o JSON con paletas cromáticas.
- **Logotipos e Iconografía (`.svg`)**: Vectores SVG con colores oficiales o isotipos.
- **Imágenes y Moodboards (`.png`, `.jpg`, `.webp`)**: Capturas de pantalla, banners o gráficos para extracción de paleta y atmósfera.
- **Manuales y Briefs (`.md`, `.txt`)**: Directrices de marca, pilares de voz y tono o notas editoriales.

## ¿Cómo procesar los archivos?
Ejecuta en tu terminal:
```bash
pnpm run brand:digest swiss-studio
```
O simplemente pide al asistente: *"Digiere los archivos que dejé en la carpeta de la marca"*.

El motor de digestión procesará los activos, actualizará los tokens (`colors.json`, `typography.json`), enriquecerá `DESIGN.md` y archivará los recursos en `assets/`.
