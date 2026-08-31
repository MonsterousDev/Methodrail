import { existsSync } from "node:fs";
import { join } from "node:path";
import { knowledgeIndexEntries } from "./load.js";
import { identitiesEqual, noteHasIdentity, noteIdentity, pathEscapesRepository } from "./paths.js";
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

function hrefMatchesNote(href: string, note: KnowledgeNote): boolean {
  return noteHasIdentity(note, href);
}

function typedSibling(siblings: KnowledgeNote[], identity: string): KnowledgeNote | undefined {
  return siblings.find((other) => other.classification === "typed" && noteHasIdentity(other, identity));
}

function supersessionCycle(note: KnowledgeNote, siblings: KnowledgeNote[]): boolean {
  const seen = new Set<string>();
  let current: KnowledgeNote | undefined = note;
  while (current?.frontmatter?.superseded_by) {
    const identity = noteIdentity(current);
    if (!identity) return false;
    const key = identity.toLowerCase();
    if (seen.has(key)) return true;
    seen.add(key);
    current = typedSibling(siblings, current.frontmatter.superseded_by);
  }
  return false;
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

  if (note.parseError) {
    diagnostics.push({
      level: "error",
      path,
      message: `Note frontmatter is not valid YAML: ${note.parseError}`,
    });
    return diagnostics;
  }

  if (note.classification === "legacy") {
    diagnostics.push({
      level: "warning",
      path,
      message: "Legacy knowledge note has no typed frontmatter; treat with reduced confidence",
    });
    return diagnostics;
  }

  const fm = note.frontmatter;
  if (note.governanceErrors) {
    for (const message of note.governanceErrors) {
      diagnostics.push({ level: "error", path, message });
    }
  }
  if (note.classification === "invalid-typed" || !fm) {
    if (!note.governanceErrors?.length) {
      diagnostics.push({
        level: "error",
        path,
        message: "Typed note requires kind, status, validated_at, and relevant_paths",
      });
    }
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
    if (pathEscapesRepository(projectRoot, declared)) {
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

  for (const declared of [...(fm.scope?.include_paths ?? []), ...(fm.scope?.exclude_paths ?? [])]) {
    if (pathEscapesRepository(projectRoot, declared)) {
      diagnostics.push({
        level: "error",
        path,
        message: `scope path escapes the repository: ${declared}`,
      });
    }
  }

  if (fm.lifecycle !== "disputed" && fm.conflicts_with) {
    diagnostics.push({
      level: "error",
      path,
      message: "conflicts_with is allowed only when lifecycle is disputed",
    });
  }
  if (fm.lifecycle === "disputed") {
    if (!fm.conflicts_with || fm.conflicts_with.length === 0) {
      diagnostics.push({
        level: "error",
        path,
        message: "A disputed note requires conflicts_with identities",
      });
    } else {
      const own = noteIdentity(note);
      for (const identity of fm.conflicts_with) {
        if (own && identitiesEqual(own, identity)) {
          diagnostics.push({ level: "error", path, message: "conflicts_with cannot target the same note" });
          continue;
        }
        const other = typedSibling(siblings, identity);
        if (!other?.frontmatter) {
          diagnostics.push({
            level: "error",
            path,
            message: `conflicts_with target is not an existing typed note: ${identity}`,
          });
          continue;
        }
        if (other.frontmatter.lifecycle !== "disputed") {
          diagnostics.push({
            level: "error",
            path,
            message: `conflicts_with target is not disputed: ${identity}`,
          });
        }
        const reciprocal = other.frontmatter.conflicts_with?.some((item) => own && identitiesEqual(own, item));
        if (!reciprocal) {
          diagnostics.push({
            level: "error",
            path,
            message: `conflicts_with is not reciprocal: ${identity}`,
          });
        }
      }
    }
    if (!meaningful(note.dispute ?? "")) {
      diagnostics.push({
        level: "error",
        path,
        message: "A disputed note requires a meaningful Dispute section",
      });
    }
  }

  if (fm.lifecycle !== "retired" && fm.superseded_by) {
    diagnostics.push({
      level: "error",
      path,
      message: "superseded_by is allowed only when lifecycle is retired",
    });
  }
  if (fm.lifecycle === "retired") {
    if (fm.superseded_by) {
      const own = noteIdentity(note);
      if (own && identitiesEqual(own, fm.superseded_by)) {
        diagnostics.push({ level: "error", path, message: "superseded_by cannot target the same note" });
      } else {
        const successor = typedSibling(siblings, fm.superseded_by);
        if (!successor?.frontmatter) {
          diagnostics.push({
            level: "error",
            path,
            message: `superseded_by target is not an existing typed note: ${fm.superseded_by}`,
          });
        } else if (successor.frontmatter.lifecycle === "retired") {
          diagnostics.push({
            level: "error",
            path,
            message: `superseded_by must target a non-retired typed note: ${fm.superseded_by}`,
          });
        }
      }
      if (supersessionCycle(note, siblings)) {
        diagnostics.push({ level: "error", path, message: "superseded_by cycle is not allowed" });
      }
    } else if (!meaningful(note.retirement ?? "")) {
      diagnostics.push({
        level: "error",
        path,
        message: "A retired note without superseded_by requires a meaningful Retirement section",
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
