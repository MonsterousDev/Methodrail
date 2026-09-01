import { existsSync, statSync } from "node:fs";
import { dirname, join, resolve, sep } from "node:path";
import { findMethodrailDirs } from "../fs-walk.js";
import { inspectHarnessBinding } from "../harness.js";
import { evaluateFreshness } from "./freshness.js";
import { knowledgeIndexEntries, loadKnowledgeNotes, loadProjectMd } from "./load.js";
import { validateNote } from "./validate.js";
import type { KnowledgeDiagnostic, KnowledgeNote, KnowledgeReport } from "./types.js";

function markdownHrefs(source: string): string[] {
  const hrefs: string[] = [];
  for (const match of source.matchAll(/(?<!!)\[[^\]]*]\(([^)]+)\)/g)) {
    const href = match[1]?.trim().replace(/^<|>$/g, "") ?? "";
    if (href) hrefs.push(href);
  }
  return hrefs;
}

function evidencePointerWarnings(note: KnowledgeNote): KnowledgeDiagnostic[] {
  if (note.classification !== "typed") return [];
  const warnings: KnowledgeDiagnostic[] = [];
  const text = `${note.evidence}\n${note.reuseGuidance}\n${note.refreshTriggers}`;
  const noteDir = dirname(note.absolutePath);
  for (const href of markdownHrefs(text)) {
    if (href.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(href)) continue;
    let local: string;
    try {
      local = decodeURIComponent(href.split("#", 1)[0] ?? "");
    } catch {
      warnings.push({
        level: "warning",
        path: note.relativePath,
        message: `Broken evidence or verification pointer (malformed encoding): ${href}`,
      });
      continue;
    }
    if (!local) continue;
    const resolved = resolve(noteDir, local);
    let missing = false;
    try {
      missing = !existsSync(resolved) || !statSync(resolved).isFile();
    } catch {
      missing = true;
    }
    if (missing) {
      warnings.push({
        level: "warning",
        path: note.relativePath,
        message: `Broken evidence or verification pointer: ${href}`,
      });
    }
  }
  return warnings;
}

export function evaluateProjectKnowledge(projectRoot: string): KnowledgeReport {
  const errors: KnowledgeDiagnostic[] = [];
  const warnings: KnowledgeDiagnostic[] = [];
  const harness = inspectHarnessBinding(projectRoot);
  for (const diagnostic of harness.diagnostics) {
    if (diagnostic.level === "error") errors.push(diagnostic);
    else warnings.push(diagnostic);
  }
  if (errors.length > 0 && !harness.binding) {
    return { notes: [], errors, warnings };
  }
  const notes = loadKnowledgeNotes(projectRoot);
  const projectMd = loadProjectMd(projectRoot);
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
      warnings.push(...evidencePointerWarnings(note));
      const freshness = evaluateFreshness(note, projectRoot);
      if (freshness.state !== "fresh") {
        warnings.push({
          level: "warning",
          path: note.absolutePath,
          message: `Freshness ${freshness.state}: ${freshness.evidence}`,
        });
      }
      if (note.frontmatter?.lifecycle === "disputed") {
        warnings.push({
          level: "warning",
          path: note.absolutePath,
          message: "Note is disputed; present competing claims and do not select a winner",
        });
      }
      if (note.frontmatter?.lifecycle === "retired") {
        warnings.push({
          level: "warning",
          path: note.absolutePath,
          message: "Note is retired; refuse reuse and follow superseded_by when present",
        });
      }
    }
  }
  return { notes, errors, warnings };
}

export function evaluateRepositoryKnowledge(repoRoot: string): KnowledgeReport {
  const dirs = findMethodrailDirs(repoRoot);
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
