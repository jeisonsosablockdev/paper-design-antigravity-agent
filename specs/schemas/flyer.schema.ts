/**
 * Contrato Maestro de Flyers y Posters Gráficos: FlyerSpec
 * Implementación con validación estricta en tiempo de ejecución (Contract-as-Code)
 * y tipos estáticos de TypeScript con cero dependencias externas.
 */

export type FlyerFormat = "square" | "portrait-feed" | "story" | "poster";

export type FlyerStyle =
  | "editorial-swiss"
  | "tech-neon"
  | "warm-artisan"
  | "bold-festival"
  | "minimal";

export interface FlyerDimensions {
  width: number;
  height: number;
}

export const FORMAT_PRESETS: Record<FlyerFormat, FlyerDimensions> = {
  square: { width: 1080, height: 1080 },
  "portrait-feed": { width: 1080, height: 1350 },
  story: { width: 1080, height: 1920 },
  poster: { width: 1200, height: 1800 },
};

export interface EventDetailItem {
  icon?: string;
  label: string;
  value: string;
}

export interface FlyerContent {
  eyebrow?: string;
  headline: string;
  subheadline?: string;
  eventDetails?: EventDetailItem[];
  cta?: {
    text: string;
    subtext?: string;
    linkOrHandle?: string;
  };
  heroImage?: {
    prompt?: string;
    model?: string;
    aspectRatio?: string;
  };
  sponsors?: string[];
}

export interface FlyerColors {
  background: string;
  surface?: string;
  primaryText: string;
  secondaryText?: string;
  accent: string;
}

export interface FlyerSpec {
  id: string;
  version: string;
  status: "draft" | "in-review" | "frozen";
  metadata: {
    title: string;
    description: string;
    author: string;
    createdAt: string;
  };
  format: FlyerFormat;
  dimensions: FlyerDimensions;
  style: FlyerStyle;
  colors: FlyerColors;
  content: FlyerContent;
  acceptanceCriteria: Array<{
    id: string;
    description: string;
  }>;
}

export class FlyerValidationError extends Error {
  public errors: string[];
  constructor(errors: string[]) {
    super(`Fallo de validación de contrato de flyer:\n - ${errors.join("\n - ")}`);
    this.name = "FlyerValidationError";
    this.errors = errors;
  }
}

/**
 * Validador en tiempo de ejecución para FlyerSpec
 */
export const FlyerSpecSchema = {
  parse(data: unknown): FlyerSpec {
    const errors: string[] = [];

    if (!data || typeof data !== "object") {
      throw new FlyerValidationError(["El contrato de flyer debe ser un objeto válido."]);
    }

    const obj = data as Partial<FlyerSpec>;

    // 1. Validar ID y estado
    if (!obj.id || typeof obj.id !== "string" || obj.id.length < 3) {
      errors.push("El campo 'id' debe tener al menos 3 caracteres.");
    }
    if (!obj.status || !["draft", "in-review", "frozen"].includes(obj.status)) {
      errors.push("El campo 'status' debe ser 'draft', 'in-review' o 'frozen'.");
    }

    // 2. Validar Formato y Dimensiones
    const validFormats: FlyerFormat[] = ["square", "portrait-feed", "story", "poster"];
    if (!obj.format || !validFormats.includes(obj.format)) {
      errors.push(`'format' debe ser uno de: ${validFormats.join(", ")}.`);
    }

    if (!obj.dimensions || typeof obj.dimensions !== "object") {
      errors.push("El objeto 'dimensions' es obligatorio.");
    } else {
      if (typeof obj.dimensions.width !== "number" || obj.dimensions.width < 500) {
        errors.push("dimensions.width debe ser un número >= 500px.");
      }
      if (typeof obj.dimensions.height !== "number" || obj.dimensions.height < 500) {
        errors.push("dimensions.height debe ser un número >= 500px.");
      }
    }

    // 3. Validar Estilo
    const validStyles: FlyerStyle[] = [
      "editorial-swiss",
      "tech-neon",
      "warm-artisan",
      "bold-festival",
      "minimal",
    ];
    if (!obj.style || !validStyles.includes(obj.style)) {
      errors.push(`'style' debe ser uno de: ${validStyles.join(", ")}.`);
    }

    // 4. Validar Colores
    if (!obj.colors || typeof obj.colors !== "object") {
      errors.push("El objeto 'colors' es obligatorio.");
    } else {
      if (!obj.colors.background) errors.push("colors.background es obligatorio.");
      if (!obj.colors.primaryText) errors.push("colors.primaryText es obligatorio.");
      if (!obj.colors.accent) errors.push("colors.accent es obligatorio.");
    }

    // 5. Validar Contenido Gráfico
    if (!obj.content || typeof obj.content !== "object") {
      errors.push("El objeto 'content' es obligatorio.");
    } else {
      if (!obj.content.headline || typeof obj.content.headline !== "string" || obj.content.headline.trim().length === 0) {
        errors.push("content.headline es obligatorio para un flyer gráfico.");
      }
    }

    if (errors.length > 0) {
      throw new FlyerValidationError(errors);
    }

    return obj as FlyerSpec;
  },
};
