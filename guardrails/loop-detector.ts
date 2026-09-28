/**
 * Guardrail: Loop Detector
 * Detecta bucles infinitos, acciones idénticas consecutivas o patrones oscilatorios en llamadas a herramientas.
 */

export interface ToolCallSignature {
  toolName: string;
  argumentsHash: string;
  timestamp: number;
}

export class LoopDetector {
  private history: ToolCallSignature[] = [];
  private maxConsecutiveDuplicates: number;

  constructor(maxConsecutiveDuplicates = 3) {
    this.maxConsecutiveDuplicates = maxConsecutiveDuplicates;
  }

  public recordAndCheck(toolName: string, args: Record<string, unknown>): { isLoop: boolean; message?: string } {
    const hash = this.hashArguments(args);
    const signature: ToolCallSignature = {
      toolName,
      argumentsHash: hash,
      timestamp: Date.now(),
    };

    this.history.push(signature);
    if (this.history.length > 20) {
      this.history.shift();
    }

    // 1. Chequeo de duplicados idénticos consecutivos
    let consecutiveCount = 0;
    for (let i = this.history.length - 1; i >= 0; i--) {
      if (this.history[i].toolName === toolName && this.history[i].argumentsHash === hash) {
        consecutiveCount++;
      } else {
        break;
      }
    }

    if (consecutiveCount >= this.maxConsecutiveDuplicates) {
      return {
        isLoop: true,
        message: `Bucle detectado: La herramienta '${toolName}' fue llamada ${consecutiveCount} veces consecutivas con argumentos idénticos.`,
      };
    }

    return { isLoop: false };
  }

  private hashArguments(args: Record<string, unknown>): string {
    return JSON.stringify(args, Object.keys(args).sort());
  }

  public reset(): void {
    this.history = [];
  }
}
