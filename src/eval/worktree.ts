import { cpSync, existsSync, mkdtempSync, readFileSync, readdirSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, resolve, sep } from "node:path";

const SKIP = new Set(["expected.yaml", "task.md", "task-a.md", "README.md"]);
export const OVERLAY_MANIFEST = ".methodrail-overlay.json";

function applyDeletions(dest: string): void {
  const manifestPath = join(dest, OVERLAY_MANIFEST);
  if (!existsSync(manifestPath)) return;
  const parsed: unknown = JSON.parse(readFileSync(manifestPath, "utf8"));
  const deletions =
    parsed !== null && typeof parsed === "object" && Array.isArray((parsed as { deletions?: unknown }).deletions)
      ? (parsed as { deletions: unknown[] }).deletions
      : [];
  const root = resolve(dest);
  for (const item of deletions) {
    if (typeof item !== "string" || item.length === 0) throw new Error("Overlay deletion paths must be nonempty strings");
    const target = resolve(dest, item);
    if (target === root || !target.startsWith(root + sep)) {
      throw new Error(`Overlay deletion escapes worktree: ${item}`);
    }
    rmSync(target, { recursive: true, force: true });
  }
  rmSync(manifestPath, { force: true });
}

export function materializeFixture(fixtureDir: string, overlayDir: string | undefined): string {
  const dest = mkdtempSync(join(tmpdir(), "methodrail-eval-"));
  if (existsSync(fixtureDir)) {
    for (const name of readdirSync(fixtureDir)) {
      if (SKIP.has(name)) continue;
      cpSync(join(fixtureDir, name), join(dest, name), { recursive: true });
    }
  }
  if (overlayDir && existsSync(overlayDir)) {
    cpSync(overlayDir, dest, { recursive: true });
    applyDeletions(dest);
  }
  return dest;
}

export function removeWorktree(dir: string): void {
  rmSync(dir, { recursive: true, force: true });
}

export function readIfExists(path: string): string | null {
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}
