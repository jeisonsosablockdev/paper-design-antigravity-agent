import * as fs from "node:fs";
import * as path from "node:path";

export interface SpanRecord {
  traceId: string;
  spanId: string;
  timestamp: string;
  agentRole: string;
  model: string;
  latencyMs: number;
  tokens: {
    prompt: number;
    completion: number;
    total: number;
  };
  toolCall?: {
    name: string;
    arguments: Record<string, unknown>;
    outputSnippet?: string;
  };
}

export class AgentTracer {
  private tracesDir: string;
  private metricsDir: string;

  constructor() {
    this.tracesDir = path.resolve(process.cwd(), ".observability/traces");
    this.metricsDir = path.resolve(process.cwd(), ".observability/metrics");

    if (!fs.existsSync(this.tracesDir)) fs.mkdirSync(this.tracesDir, { recursive: true });
    if (!fs.existsSync(this.metricsDir)) fs.mkdirSync(this.metricsDir, { recursive: true });
  }

  public recordSpan(span: SpanRecord): void {
    const traceFile = path.join(this.tracesDir, `${span.traceId}.jsonl`);
    const line = JSON.stringify(span) + "\n";
    fs.appendFileSync(traceFile, line, "utf-8");

    this.updateMetrics(span);
  }

  private updateMetrics(span: SpanRecord): void {
    const metricsFile = path.join(this.metricsDir, "session_metrics.json");
    let currentMetrics = {
      totalSpans: 0,
      totalPromptTokens: 0,
      totalCompletionTokens: 0,
      totalLatencyMs: 0,
    };

    if (fs.existsSync(metricsFile)) {
      try {
        currentMetrics = JSON.parse(fs.readFileSync(metricsFile, "utf-8"));
      } catch {
        // fallback a valores por defecto
      }
    }

    currentMetrics.totalSpans += 1;
    currentMetrics.totalPromptTokens += span.tokens.prompt;
    currentMetrics.totalCompletionTokens += span.tokens.completion;
    currentMetrics.totalLatencyMs += span.latencyMs;

    fs.writeFileSync(metricsFile, JSON.stringify(currentMetrics, null, 2), "utf-8");
  }
}
