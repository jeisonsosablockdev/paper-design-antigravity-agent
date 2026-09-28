import * as fs from "node:fs";
import * as path from "node:path";

export interface SnapshotMetadata {
  timestamp: string;
  action: string;
  phase: "before" | "after";
  nodeTree: Record<string, unknown>;
}

export class Snapshotter {
  private baseDir: string;

  constructor(baseDir = path.resolve(process.cwd(), ".debug/snapshots")) {
    this.baseDir = baseDir;
    if (!fs.existsSync(this.baseDir)) {
      fs.mkdirSync(this.baseDir, { recursive: true });
    }
  }

  public takeSnapshot(action: string, phase: "before" | "after", nodeTree: Record<string, unknown>): string {
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `${timestamp}_${action}_${phase}.json`;
    const filePath = path.join(this.baseDir, filename);

    const data: SnapshotMetadata = {
      timestamp: new Date().toISOString(),
      action,
      phase,
      nodeTree,
    };

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), "utf-8");
    return filePath;
  }

  public diffSnapshots(beforePath: string, afterPath: string): { changedKeys: string[] } {
    if (!fs.existsSync(beforePath) || !fs.existsSync(afterPath)) {
      return { changedKeys: ["Uno de los snapshots no existe."] };
    }

    const before = JSON.parse(fs.readFileSync(beforePath, "utf-8")) as SnapshotMetadata;
    const after = JSON.parse(fs.readFileSync(afterPath, "utf-8")) as SnapshotMetadata;

    const changedKeys: string[] = [];
    const allKeys = new Set([...Object.keys(before.nodeTree), ...Object.keys(after.nodeTree)]);

    for (const key of allKeys) {
      if (JSON.stringify(before.nodeTree[key]) !== JSON.stringify(after.nodeTree[key])) {
        changedKeys.push(key);
      }
    }

    return { changedKeys };
  }
}
