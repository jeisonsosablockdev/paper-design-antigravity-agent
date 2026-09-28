/**
 * Contrato Maestro de Pantallas: ScreenSpec
 * Implementación con validación estricta en tiempo de ejecución (Contract-as-Code)
 * y tipos estáticos de TypeScript con cero dependencias externas.
 */

export interface Viewport {
  width: number;
  height: number;
  device: string;
  orientation?: "portrait" | "landscape";
}

export interface ComponentNode {
  id: string;
  role:
    | "container"
    | "header"
    | "form"
    | "button"
    | "card"
    | "list-item"
    | "slot"
    | "navigation"
    | "badge";
  label?: string;
  flexShrink?: number;
  height?: number | "fit-content";
  tokens?: {
    background?: string;
    color?: string;
    border?: string;
  };
  children?: ComponentNode[];
}

export interface AcceptanceCriterion {
  id: string;
  description: string;
  type: "layout" | "typography" | "accessibility" | "token" | "interaction";
}

export interface ScreenSpec {
  id: string;
  version: string;
  status: "draft" | "in-review" | "frozen";
  metadata: {
    title: string;
    description: string;
    author: string;
    createdAt: string;
  };
  viewport: Viewport;
  components: ComponentNode[];
  acceptanceCriteria: AcceptanceCriterion[];
}

export class ValidationError extends Error {
  public errors: string[];
  constructor(errors: string[]) {
    super(`Fallo de validación de contrato de pantalla:\n - ${errors.join("\n - ")}`);
    this.name = "ValidationError";
    this.errors = errors;
  }
}

/**
 * Validador en tiempo de ejecución para ScreenSpec
 */
export const ScreenSpecSchema = {
  parse(data: unknown): ScreenSpec {
    const errors: string[] = [];

    if (!data || typeof data !== "object") {
      throw new ValidationError(["El contrato debe ser un objeto válido."]);
    }

    const obj = data as Partial<ScreenSpec>;

    // 1. Validar ID y versión
    if (!obj.id || typeof obj.id !== "string" || obj.id.length < 3) {
      errors.push("El campo 'id' debe tener al menos 3 caracteres.");
    }
    if (!obj.version || typeof obj.version !== "string") {
      errors.push("El campo 'version' es obligatorio.");
    }
    if (!obj.status || !["draft", "in-review", "frozen"].includes(obj.status)) {
      errors.push("El campo 'status' debe ser 'draft', 'in-review' o 'frozen'.");
    }

    // 2. Validar Metadata
    if (!obj.metadata || typeof obj.metadata !== "object") {
      errors.push("El objeto 'metadata' es obligatorio.");
    } else {
      if (!obj.metadata.title) errors.push("metadata.title es obligatorio.");
      if (!obj.metadata.description) errors.push("metadata.description es obligatorio.");
    }

    // 3. Validar Viewport
    if (!obj.viewport || typeof obj.viewport !== "object") {
      errors.push("El objeto 'viewport' es obligatorio.");
    } else {
      if (typeof obj.viewport.width !== "number" || obj.viewport.width < 320) {
        errors.push("viewport.width debe ser un número >= 320px.");
      }
      if (typeof obj.viewport.height !== "number" || obj.viewport.height < 480) {
        errors.push("viewport.height debe ser un número >= 480px.");
      }
      if (!obj.viewport.device) {
        errors.push("viewport.device es obligatorio.");
      }
    }

    // 4. Validar Componentes
    if (!Array.isArray(obj.components) || obj.components.length === 0) {
      errors.push("Debe especificarse al menos un componente en 'components'.");
    } else {
      const validateNode = (node: ComponentNode, path: string) => {
        if (!node.id || !/^[a-z0-9-]+$/.test(node.id)) {
          errors.push(`Nodo ${path}: id '${node.id}' debe ser kebab-case.`);
        }
        if (!node.role) {
          errors.push(`Nodo ${path}: 'role' es obligatorio.`);
        }
        if (node.flexShrink !== undefined && (node.flexShrink < 0 || node.flexShrink > 1)) {
          errors.push(`Nodo ${path}: flexShrink debe ser 0 o 1.`);
        }
        if (node.children && Array.isArray(node.children)) {
          node.children.forEach((child, idx) => validateNode(child, `${path}.children[${idx}]`));
        }
      };

      obj.components.forEach((c, idx) => validateNode(c, `components[${idx}]`));
    }

    // 5. Validar Acceptance Criteria
    if (!Array.isArray(obj.acceptanceCriteria) || obj.acceptanceCriteria.length === 0) {
      errors.push("Debe definirse al menos un criterio de aceptación en 'acceptanceCriteria'.");
    } else {
      obj.acceptanceCriteria.forEach((ac, idx) => {
        if (!ac.id || !/^AC-\d{2,}$/.test(ac.id)) {
          errors.push(`Criterio [${idx}]: id '${ac.id}' debe tener formato AC-01, AC-02, etc.`);
        }
        if (!ac.description || ac.description.length < 5) {
          errors.push(`Criterio [${idx}]: 'description' debe tener al menos 5 caracteres.`);
        }
      });
    }

    if (errors.length > 0) {
      throw new ValidationError(errors);
    }

    return obj as ScreenSpec;
  },
};
