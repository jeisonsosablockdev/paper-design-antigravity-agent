---
name: brand-digest
description: Digiere, clasifica y asimila automáticamente archivos, hojas de estilo, logos SVG, tokens o imágenes que el usuario deposite en el buzón de entrada (brands/<brand-id>/inbox/) de cualquier marca.
---

# Workflow: /brand-digest (Buzón de Entrada y Digestión de Marca)

Este workflow automatiza la ingesta, análisis y asimilación de recursos gráficos o técnicos depositados por el usuario directamente en la carpeta buzón de una marca (`brands/<brand-id>/inbox/`).

---

## 1. La Carpeta Buzón (`inbox/`)

Cada marca registrada en `brands.json` cuenta con un directorio dedicado de entrada:

```text
brands/<brand-id>/
├── inbox/                  <-- [ZONA DE ENTRADA / DROPZONE]
│   ├── theme.css           (Hojas de estilo con variables CSS o colores)
│   ├── logo-brand.svg      (Vectores SVG con paleta o isotipos)
│   ├── tokens.json         (Definiciones de color, tipografía o espaciado)
│   ├── moodboard.png       (Imágenes o capturas de pantalla de referencia)
│   └── guidelines.md       (Manual de identidad, tono de voz o reglas)
├── assets/                 (Recursos clasificados y archivados)
│   ├── logos/              (SVGs oficiales de la marca)
│   ├── images/             (Imágenes y capturas)
│   └── digested/           (Historial timestamped de archivos digeridos)
├── tokens/                 (Tokens activos de la marca)
├── brand.json              (Metadatos y stateHash)
└── DESIGN.md               (Contrato de diseño y directrices)
```

---

## 2. Tipos de Archivos Soportados

| Formato | Procesamiento del Motor de Digestión | Destino / Impacto |
| :--- | :--- | :--- |
| **`.css` / `.scss`** | Extrae variables (`--primary`, `--bg`, etc.) y códigos hexadecimales. | Actualiza `tokens/colors.json` y `tokens/typography.json`. |
| **`.json`** | Mapea estructuras de `colors`, `typography`, `spacing` o arrays de paleta. | Sobreescribe o enriquece los tokens de la marca. |
| **`.svg`** | Parsea atributos `fill` y `stroke` para capturar colores de marca. | Archiva el vector en `assets/logos/` y sincroniza color primario. |
| **`.png` / `.jpg` / `.webp`** | Indexa capturas o banners de referencia visual. | Archiva en `assets/images/` y registra en manifiesto. |
| **`.md` / `.txt`** | Extrae lineamientos editoriales, directrices y valores. | Enriquece y anexa secciones en `DESIGN.md`. |

---

## 3. Protocolo de Ejecución

Siempre que el usuario indique que colocó archivos en la carpeta de la marca o invoque `/brand-digest`:

1. **Localizar la Marca Objetivo**:
   - Consultar `brands.json` para determinar la `activeBrand` o el ID especificado por el usuario.
   - Ruta del buzón: `brands/<targetBrand>/inbox/`.

2. **Ejecutar el Motor de Digestión**:
   ```bash
   pnpm run brand:digest [brand-id]
   ```

3. **Verificación de Integridad**:
   - El motor archiva copias en `assets/digested/<timestamp>/`.
   - Limpia los archivos procesados del `inbox/`.
   - Recalcula el `stateHash` criptográfico SHA-256 en `brands.json`.
   - Si la marca es la activa, refresca automáticamente `design-system/tokens/`.

4. **Resumen al Usuario**:
   - Informar de los colores, fuentes o directrices asimilados.
   - Preguntar si desea sincronizar las nuevas variables al canvas de Paper mediante `/sync-tokens`.
