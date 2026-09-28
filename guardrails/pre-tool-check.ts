/**
 * Guardrail: Pre-Tool Check
 * Intercepta y valida los payloads de HTML antes de enviarlos a Paper MCP write_html.
 */

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  sanitizedHtml?: string;
}

const FORBIDDEN_TAGS = ['script', 'iframe', 'object', 'embed', 'style', 'link', 'meta'];

export function preToolCheck(html: string): ValidationResult {
  const errors: string[] = [];

  if (!html || typeof html !== 'string') {
    return { valid: false, errors: ['El HTML no puede estar vacío.'] };
  }

  // Detectar tags prohibidos
  for (const tag of FORBIDDEN_TAGS) {
    const regex = new RegExp(`<${tag}\\b[^>]*>`, 'i');
    if (regex.test(html)) {
      errors.push(`Tag no permitido detectado: <${tag}>.`);
    }
  }

  // Verificar balanceo básico de tags estructurales
  const openDivs = (html.match(/<div\b/gi) || []).length;
  const closeDivs = (html.match(/<\/div>/gi) || []).length;
  if (openDivs !== closeDivs) {
    errors.push(`Desbalance de etiquetas div: ${openDivs} abiertas vs ${closeDivs} cerradas.`);
  }

  return {
    valid: errors.length === 0,
    errors,
    sanitizedHtml: errors.length === 0 ? html.trim() : undefined,
  };
}
