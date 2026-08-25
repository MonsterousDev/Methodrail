import { existsSync } from "node:fs";
import { isAbsolute, join, normalize, resolve, sep } from "node:path";
import { knowledgeIndexEntries } from "./load.js";
import type { KnowledgeDiagnostic, KnowledgeNote } from "./types.js";
import { MAX_NOTE_CHARS, MAX_NOTE_LINES } from "./types.js";

const SHA = /^[0-9a-f]{40}$/i;
const UNVERSIONED = /^unversioned:.+/;

export function isValidValidatedAt(value: string): boolean {
  return SHA.test(value) || UNVERSIONED.test(value);
}

export function isGitSha(value: string): boolean {
  return SHA.test(value);
}

function lineCount(source: string): number {
  return source.length === 0 ? 0 : source.split(/\r?\n/).length;
}

function meaningful(text: string): boolean {
  const trimmed = text.replace(/[-*]\s+/g, "").trim();
  return trimmed.length >= 24;
}

function pathEscapes(projectRoot: string, declared: string): boolean {
  if (declared.includes("\0") || isAbsolute(declared)) return true;
  const normalized = normalize(declared);
  if (normalized.startsWith(`..${sep}`) || normalized === "..") return true;
  const resolved = resolve(projectRoot, declared);
  const root = resolve(projectRoot);
  return resolved === root || !resolved.startsWith(root + sep);
}

function hrefMatchesNote(href: string, note: KnowledgeNote): boolean {
  const normalized = href.replace(/^\.\//, "");
  return (
    note.relativePath === normalized ||
    note.relativePath.endsWith(`/${normalized}`) ||
    note.relativePath === `.methodrail/${normalized}` ||
    note.relativePath.endsWith(normalized.replace(/^knowledge\//, "/knowledge/"))
  );
}

export function validateNote(
  note: KnowledgeNote,
  projectRoot: string,
  projectMd: string | null,
  siblings: KnowledgeNote[],
): KnowledgeDiagnostic[] {
  const diagnostics: KnowledgeDiagnostic[] = [];
  const path = note.absolutePath;

  if (note.classification === "decision") return diagnostics;

  if (note.classification === "legacy") {
    diagnostics.push({
      level: "warning",
      path,
      message: "Legacy knowledge note has no typed frontmatter; treat with reduced confidence",
    });
    return diagnostics;
  }

  const fm = note.frontmatter;
  if (note.classification === "invalid-typed" || !fm) {
    diagnostics.push({
      level: "error",
      path,
      message: "Typed note requires kind, status, validated_at, and relevant_paths",
    });
    return diagnostics;
  }

  if (!isValidValidatedAt(fm.validated_at)) {
    diagnostics.push({
      level: "error",
      path,
      message: "validated_at must be a 40-character Git SHA or unversioned:<reason>",
    });
  }

  if (UNVERSIONED.test(fm.validated_at)) {
    diagnostics.push({
      level: "warning",
      path,
      message: "Git revision cannot be resolved; unversioned provenance has reduced confidence",
    });
  }

  if (fm.kind === "hypothesis" && fm.status !== "provisional") {
    diagnostics.push({ level: "error", path, message: "A hypothesis must be provisional" });
  }
  if (fm.status === "verified" && fm.kind === "hypothesis") {
    diagnostics.push({ level: "error", path, message: "A verified hypothesis is not allowed" });
  }
  if (!meaningful(note.claim)) {
    diagnostics.push({ level: "error", path, message: "Claim must be present and non-empty" });
  }
  if (fm.status === "verified" && !meaningful(note.evidence)) {
    diagnostics.push({
      level: "error",
      path,
      message: "A verified note must contain meaningful evidence",
    });
  }
  if (!note.reuseGuidance.trim() || !note.refreshTriggers.trim()) {
    diagnostics.push({
      level: "error",
      path,
      message: "Typed notes require Reuse guidance and Refresh triggers sections",
    });
  }

  if (lineCount(note.source) > MAX_NOTE_LINES || note.source.length > MAX_NOTE_CHARS) {
    diagnostics.push({
      level: "error",
      path,
      message: `Typed note must stay at or below ${MAX_NOTE_LINES} lines and ${MAX_NOTE_CHARS} characters`,
    });
  }

  for (const declared of fm.relevant_paths) {
    if (pathEscapes(projectRoot, declared)) {
      diagnostics.push({
        level: "error",
        path,
        message: `relevant_paths entry escapes the repository: ${declared}`,
      });
      continue;
    }
    const target = join(projectRoot, declared);
    if (!existsSync(target)) {
      diagnostics.push({
        level: "warning",
        path,
        message: `Relevant path is missing on this tree: ${declared}`,
      });
    }
  }

  if (projectMd) {
    const entries = knowledgeIndexEntries(projectMd);
    const indexed = entries.some((entry) => hrefMatchesNote(entry.href, note));
    if (!indexed) {
      diagnostics.push({
        level: "error",
        path,
        message: "Managed typed note is not indexed from .methodrail/PROJECT.md",
      });
    }
    const titles = entries.map((entry) => entry.title.toLowerCase());
    const duplicateTitle = titles.filter((title) => title === note.title.toLowerCase()).length > 1;
    if (duplicateTitle) {
      diagnostics.push({
        level: "error",
        path,
        message: `Duplicate knowledge index title: ${note.title}`,
      });
    }
  } else {
    diagnostics.push({
      level: "error",
      path,
      message: "Managed typed note is not indexed from .methodrail/PROJECT.md",
    });
  }

  const sameTitle = siblings.filter(
    (other) => other.classification === "typed" && other.title.toLowerCase() === note.title.toLowerCase(),
  );
  if (sameTitle.length > 1) {
    diagnostics.push({
      level: "error",
      path,
      message: `Duplicate typed note title: ${note.title}`,
    });
  }

  const samePath = siblings.filter((other) => other.relativePath === note.relativePath);
  if (samePath.length > 1) {
    diagnostics.push({
      level: "error",
      path,
      message: `Duplicate note identity: ${note.relativePath}`,
    });
  }

  return diagnostics;
}
