import { evaluateFreshness } from "./freshness.js";
import { knowledgeIndexEntries } from "./load.js";
import type { KnowledgeDiagnostic, KnowledgeNote, KnowledgeReport } from "./types.js";

export const KNOWLEDGE_HEALTH_CAVEAT =
  "freshness means declared relevant paths did not change; it does not prove the claim is still right";

export type KnowledgeHealthLabel =
  | "dependency-fresh"
  | "review-required"
  | "unknown"
  | "malformed"
  | "disputed"
  | "retired"
  | "unbounded"
  | "missing-index"
  | "broken-pointer";

export interface KnowledgeHealthItem {
  path: string;
  label: KnowledgeHealthLabel;
  detail: string;
}

export interface KnowledgeHealthReport {
  items: KnowledgeHealthItem[];
  caveat: string;
}

function push(items: KnowledgeHealthItem[], path: string, label: KnowledgeHealthLabel, detail: string): void {
  items.push({ path, label, detail });
}

/**
 * User-facing init health view over `evaluateProjectKnowledge()`.
 * Native agents can produce the same labels from Git plus the note files.
 */
export function summarizeKnowledgeHealth(
  report: KnowledgeReport,
  projectMd: string | null,
  projectRoot: string,
): KnowledgeHealthReport {
  const items: KnowledgeHealthItem[] = [];
  const indexed = new Set((projectMd ? knowledgeIndexEntries(projectMd) : []).map((entry) => entry.href));

  for (const diagnostic of report.errors) {
    if (/Knowledge index target does not exist/i.test(diagnostic.message)) {
      push(items, diagnostic.path, "broken-pointer", diagnostic.message);
    } else if (/not indexed from \.methodrail\/PROJECT\.md/i.test(diagnostic.message)) {
      push(items, diagnostic.path, "missing-index", diagnostic.message);
    } else {
      push(items, diagnostic.path, "malformed", diagnostic.message);
    }
  }

  for (const note of report.notes) {
    if (note.classification === "invalid-typed" || note.parseError) {
      push(items, note.relativePath, "malformed", note.parseError ?? "invalid typed note");
      continue;
    }
    if (note.classification !== "typed" || !note.frontmatter) continue;
    if (note.frontmatter.lifecycle === "disputed") {
      push(items, note.relativePath, "disputed", "competing claims; do not pick a winner");
    }
    if (note.frontmatter.lifecycle === "retired") {
      push(items, note.relativePath, "retired", "refuse reuse; follow superseded_by when present");
    }
    if (!note.frontmatter.scope) {
      push(items, note.relativePath, "unbounded", "no scope; treat applicability as unbounded");
    }
    const freshness = evaluateFreshness(note, projectRoot);
    if (freshness.state === "fresh") {
      push(items, note.relativePath, "dependency-fresh", freshness.evidence);
    } else {
      push(items, note.relativePath, freshness.state, freshness.evidence);
    }
    const identity = note.relativePath.replace(/^\.methodrail\//, "");
    if (!indexed.has(identity) && note.frontmatter.lifecycle !== "retired") {
      const already = items.some((item) => item.path === note.relativePath && item.label === "missing-index");
      if (!already) push(items, note.relativePath, "missing-index", "typed note is not in the PROJECT.md knowledge index");
    }
  }

  for (const diagnostic of report.warnings) {
    if (/evidence|verification pointer|broken/i.test(diagnostic.message)) {
      push(items, diagnostic.path, "broken-pointer", diagnostic.message);
    }
  }

  return { items, caveat: KNOWLEDGE_HEALTH_CAVEAT };
}

export function formatKnowledgeHealth(health: KnowledgeHealthReport): string {
  const lines = health.items.map((item) => `- ${item.label}: ${item.path} — ${item.detail}`);
  return `${lines.join("\n")}\n\n${health.caveat}\n`;
}

export function noteHealthLabels(note: KnowledgeNote, items: KnowledgeHealthItem[]): KnowledgeHealthLabel[] {
  return items.filter((item) => item.path === note.relativePath || item.path === note.absolutePath).map((item) => item.label);
}
