import { type ScreenSpec, ScreenSpecSchema, type ComponentNode, type AcceptanceCriterion } from "../../specs/schemas/screen.schema.ts";

export interface SpecGeneratorOptions {
  id: string;
  title: string;
  description: string;
  viewport?: {
    width: number;
    height: number;
    device: string;
    orientation?: "portrait" | "landscape";
  };
  components?: ComponentNode[];
  acceptanceCriteria?: AcceptanceCriterion[];
}

export class ScreenSpecGenerator {
  /**
   * Genera un objeto ScreenSpec válido y verificado por ScreenSpecSchema
   */
  public static generateSpec(options: SpecGeneratorOptions): ScreenSpec {
    const viewport = options.viewport || {
      width: 1440,
      height: 900,
      device: "Desktop Safari",
      orientation: "landscape"
    };

    const defaultComponents: ComponentNode[] = options.components || [
      {
        id: "header-navigation",
        role: "header",
        height: "fit-content",
        flexShrink: 0,
        label: "Barra de navegación superior",
        tokens: {
          background: "colors.background.surface",
          color: "colors.text.primary",
          border: "colors.border.subtle"
        }
      },
      {
        id: "main-content-layout",
        role: "container",
        height: "fit-content",
        flexShrink: 0,
        label: "Contenedor de contenido estructurado",
        tokens: {
          background: "colors.background.canvas"
        },
        children: [
          {
            id: "primary-content-card",
            role: "card",
            height: "fit-content",
            flexShrink: 0,
            label: "Tarjeta principal del módulo",
            tokens: {
              background: "colors.background.elevated",
              border: "colors.border.default"
            }
          }
        ]
      },
      {
        id: "primary-action-btn",
        role: "button",
        height: 48,
        flexShrink: 0,
        label: "Acción principal interactiva",
        tokens: {
          background: "colors.primary.default",
          color: "colors.text.inverse"
        }
      }
    ];

    const defaultCriteria: AcceptanceCriterion[] = options.acceptanceCriteria || [
      {
        id: "AC-01",
        description: "Todos los botones de acción deben tener una altura mínima de 44px (tap target accesible).",
        type: "accessibility"
      },
      {
        id: "AC-02",
        description: "La jerarquía tipográfica debe utilizar exclusivamente valores en px y familias del sistema.",
        type: "typography"
      },
      {
        id: "AC-03",
        description: "El contenedor raíz debe evitar alturas fijas arbitrarias y usar height: fit-content para evitar clipping.",
        type: "layout"
      }
    ];

    const specData: ScreenSpec = {
      id: options.id,
      version: "1.0.0",
      status: "draft",
      metadata: {
        title: options.title,
        description: options.description,
        author: "OpenDesign Importer + Spec Interviewer",
        createdAt: new Date().toISOString()
      },
      viewport,
      components: defaultComponents,
      acceptanceCriteria: defaultCriteria
    };

    // Validación estricta con el esquema canónico
    return ScreenSpecSchema.parse(specData);
  }

  /**
   * Genera el código fuente TypeScript ejecutable para guardar en disco
   */
  public static toTypeScript(spec: ScreenSpec, schemaRelativePath = "../../../specs/schemas/screen.schema.ts"): string {
    const json = JSON.stringify(spec, null, 2);
    return `import { type ScreenSpec, ScreenSpecSchema } from "${schemaRelativePath}";

/**
 * Especificación de Pantalla derivada del Catálogo OpenDesign
 * ID: ${spec.id}
 * Generado automáticamente por OpenDesign Integration Engine
 */
export const templateScreenSpec: ScreenSpec = ScreenSpecSchema.parse(${json});
`;
  }
}
