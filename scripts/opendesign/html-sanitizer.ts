/**
 * HTML Sanitizer & Adapter para Paper MCP
 * Transforma el HTML web/iframe de OpenDesign en marcado compatible
 * con el motor de renderizado y reglas del canvas de Paper.
 */

export interface SanitizeOptions {
  viewportWidth?: number;
  viewportHeight?: number;
  ensureFlexShrinkOnFixed?: boolean;
  normalizeUnitsToPx?: boolean;
  replaceImagesWithPaperGen?: boolean;
}

export class PaperHtmlSanitizer {
  /**
   * Sanitiza y transforma un documento HTML o fragmento de OpenDesign
   */
  public static sanitize(rawHtml: string, options: SanitizeOptions = {}): string {
    let html = rawHtml;

    // 1. Eliminar etiquetas <script> y sus contenidos
    html = html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");

    // 2. Eliminar iframes y embebidos inseguros
    html = html.replace(/<iframe\b[^<]*(?:(?!<\/iframe>)<[^<]*)*<\/iframe>/gi, "");
    html = html.replace(/<embed\b[^>]*>/gi, "");
    html = html.replace(/<object\b[^<]*(?:(?!<\/object>)<[^<]*)*<\/object>/gi, "");

    // 3. Eliminar manejadores de eventos inline (onclick, onload, onerror, etc.)
    html = html.replace(/\s+on[a-zA-Z]+\s*=\s*(?:'[^']*'|"[^"]*"|[^\s>]+)/gi, "");

    // 4. Adaptar alturas 100vh / min-h-screen a fit-content para prevenir clipping en Paper artboards
    html = html.replace(/min-height:\s*100vh;?/gi, "min-height: fit-content;");
    html = html.replace(/height:\s*100vh;?/gi, "height: fit-content;");
    html = html.replace(/class="([^"]*)\bh-screen\b([^"]*)"/gi, 'class="$1h-auto$2"');
    html = html.replace(/class="([^"]*)\bmin-h-screen\b([^"]*)"/gi, 'class="$1min-h-0$2"');

    // 5. Inyectar flex-shrink: 0 en elementos interactivos y slots fijos (iconos, botones, avatares)
    if (options.ensureFlexShrinkOnFixed !== false) {
      // Inyectar en etiquetas <button>
      html = html.replace(/<button\b([^>]*)>/gi, (match, attrs) => {
        if (/style="[^"]*flex-shrink/i.test(attrs)) return match;
        if (/style="/i.test(attrs)) {
          return `<button ${attrs.replace(/style="/i, 'style="flex-shrink: 0; ')}>`;
        }
        return `<button style="flex-shrink: 0;" ${attrs}>`;
      });

      // Inyectar en elementos con clases de icono o avatar
      html = html.replace(/<(div|span|img|svg)\b([^>]*class="[^"]*(?:icon|avatar|badge|badge-item)[^"]*"[^>]*)>/gi, (match, tag, attrs) => {
        if (/style="[^"]*flex-shrink/i.test(attrs)) return match;
        if (/style="/i.test(attrs)) {
          return `<${tag} ${attrs.replace(/style="/i, 'style="flex-shrink: 0; ')}>`;
        }
        return `<${tag} style="flex-shrink: 0;" ${attrs}>`;
      });
    }

    // 6. Normalizar unidades rem a px en estilos inline
    if (options.normalizeUnitsToPx !== false) {
      html = html.replace(/(font-size|line-height|padding|margin|gap|width|height|border-radius)\s*:\s*([0-9.]+)rem/gi, (match, prop, val) => {
        const px = Math.round(parseFloat(val) * 16);
        return `${prop}: ${px}px`;
      });
    }

    // 7. Sustituir placeholders externos o rotos por directivas de prompt templates paper-gen://
    if (options.replaceImagesWithPaperGen) {
      html = html.replace(/<img\b([^>]*src=["'])(https?:\/\/(?:images\.unsplash\.com|via\.placeholder\.com|picsum\.photos)[^"']*)(["'][^>]*)>/gi, (match, pre, src, post) => {
        const encodedPrompt = encodeURIComponent("Minimalist clean architectural studio texture neutral modern high craft");
        return `<img ${pre}paper-gen://recraft-v4-1?prompt=${encodedPrompt}&aspect_ratio=16:9${post}>`;
      });
    }

    return html.trim();
  }

  /**
   * Divide un documento HTML grande en fragmentos visuales coherentes
   * para cumplir con la Regla 3 de Paper MCP ("Cada llamada a write_html
   * debe corresponder aproximadamente a un grupo visual coherente").
   */
  public static splitIntoCohesiveChunks(html: string): string[] {
    const chunks: string[] = [];

    // Busca secciones principales como <header>, <nav>, <main>, <section>, <footer>, <aside>
    const sectionRegex = /<(header|nav|main|section|aside|footer|div\s+class="[^"]*(?:container|grid|card|wrapper)[^"]*")\b[\s\S]*?<\/\1>/gi;
    let match;
    let lastIndex = 0;

    while ((match = sectionRegex.exec(html)) !== null) {
      const chunk = match[0].trim();
      if (chunk.length > 0) {
        chunks.push(chunk);
      }
      lastIndex = sectionRegex.lastIndex;
    }

    // Si no encontró secciones semánticas o solo hay un contenedor general, devuelve el bloque sanitizado completo
    if (chunks.length === 0) {
      return [html.trim()];
    }

    return chunks;
  }
}
