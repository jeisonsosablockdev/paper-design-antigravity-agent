# Biblioteca de Prompt Templates para `paper-gen://`

Paper admite de forma nativa la generación de imágenes mediante el protocolo `paper-gen://` dentro de atributos `src` en `write_html` o en artboards. Esta biblioteca proporciona prompts curados, refinados y probados para evitar AI-slop y asegurar calidad de estudio.

---

## 1. Sintaxis del Protocolo `paper-gen://`

```html
<img 
  src="paper-gen://{model}?prompt={prompt_url_encoded}&aspect_ratio={ratio}" 
  style="width: 100%; height: auto; border-radius: 8px; object-fit: cover;" 
/>
```

### Modelos Soportados en Paper
1. `recraft-v4-1`: Excelente para gráficos vectoriales limpios, texturas de grano fino y estética editorial.
2. `flux-2-pro`: Máxima fidelidad fotorrealista, iluminación cinemática y precisión geométrica.
3. `google-nano-banana-2`: Rápido, ideal para micro-activos 3D, chips y texturas abstractas.

### Aspect Ratios Soportados
`1:1`, `16:9`, `9:16`, `3:4`, `4:3`, `3:2`, `2:3`.

---

## 2. Categorías Disponibles

- **[`hero-imagery.json`](./hero-imagery.json)**: Fondos y cabeceras de alto impacto para dashboards y sitios web.
- **[`3d-assets.json`](./3d-assets.json)**: Iconos 3D limpios, prismas, chips y shields aislados.
- **[`textures.json`](./textures.json)**: Grano fílmico de 35mm, concreto arquitectónico y papel washi artesanal.
