import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative, resolve, sep } from "node:path";
import { evaluateFreshness } from "./freshness.js";
import { knowledgeIndexEntries, loadKnowledgeNotes, loadProjectMd } from "./load.js";
import { validateNote } from "./validate.js";
import type { KnowledgeDiagnostic, KnowledgeReport } from "./types.js";

function walkMethodrailDirs(root: string): string[] {
  const found: string[] = [];
  const visit = (dir: string): void => {
    if (!existsSync(dir)) return;
    for (const entry of readdirSync(dir)) {
      if ([".git", "dist", "node_modules"].includes(entry)) continue;
      const path = join(dir, entry);
      const rel = relative(root, path).split(sep).join("/");
      if (rel.startsWith("evals/runners/artifacts/")) continue;
      if (!statSync(path).isDirectory()) continue;
      if (entry === ".methodrail") found.push(path);
      else visit(path);
    }
  };
  visit(root);
  return found;
}

export function evaluateProjectKnowledge(projectRoot: string): KnowledgeReport {
  const notes = loadKnowledgeNotes(projectRoot);
  const projectMd = loadProjectMd(projectRoot);
  const errors: KnowledgeDiagnostic[] = [];
  const warnings: KnowledgeDiagnostic[] = [];
  if (projectMd) {
    const methodrailRoot = resolve(projectRoot, ".methodrail");
    for (const entry of knowledgeIndexEntries(projectMd)) {
      let href: string;
      try {
        href = decodeURIComponent(entry.href);
      } catch {
        errors.push({
          level: "error",
          path: join(methodrailRoot, "PROJECT.md"),
          message: `Knowledge index target is not valid URL-encoded text: ${entry.href}`,
        });
        continue;
      }
      const target = resolve(methodrailRoot, href);
      if (target === methodrailRoot || !target.startsWith(methodrailRoot + sep)) {
        errors.push({
          level: "error",
          path: join(methodrailRoot, "PROJECT.md"),
          message: `Knowledge index target escapes .methodrail: ${entry.href}`,
        });
      } else if (!existsSync(target) || !statSync(target).isFile()) {
        errors.push({
          level: "error",
          path: join(methodrailRoot, "PROJECT.md"),
          message: `Knowledge index target does not exist: ${entry.href}`,
        });
      }
    }
  }
  for (const note of notes) {
    for (const diagnostic of validateNote(note, projectRoot, projectMd, notes)) {
      if (diagnostic.level === "error") errors.push(diagnostic);
      else warnings.push(diagnostic);
    }
    if (note.classification === "typed") {
      const freshness = evaluateFreshness(note, projectRoot);
      if (freshness.state !== "fresh") {
        warnings.push({
          level: "warning",
          path: note.absolutePath,
          message: `Freshness ${freshness.state}: ${freshness.evidence}`,
        });
      }
    }
  }
  return { notes, errors, warnings };
}

export function evaluateRepositoryKnowledge(repoRoot: string): KnowledgeReport {
  const dirs = walkMethodrailDirs(repoRoot);
  const notes = [];
  const errors: KnowledgeDiagnostic[] = [];
  const warnings: KnowledgeDiagnostic[] = [];
  const seen = new Set<string>();
  for (const methodrail of dirs) {
    const projectRoot = methodrail.endsWith(`${sep}.methodrail`) || methodrail.endsWith("/.methodrail")
      ? methodrail.slice(0, -".methodrail".length - 1)
      : methodrail;
    if (seen.has(projectRoot)) continue;
    seen.add(projectRoot);
    const report = evaluateProjectKnowledge(projectRoot);
    notes.push(...report.notes);
    errors.push(...report.errors);
    warnings.push(...report.warnings);
  }
  return { notes, errors, warnings };
}
