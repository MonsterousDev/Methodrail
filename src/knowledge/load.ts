import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join, relative, sep } from "node:path";
import { parse } from "yaml";
import type { KnowledgeNote, NoteClassification, NoteFrontmatter, NoteKind, NoteStatus } from "./types.js";
import { NOTE_KINDS, NOTE_STATUSES } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function walkMarkdown(root: string): string[] {
  if (!existsSync(root)) return [];
  const files: string[] = [];
  for (const entry of readdirSync(root)) {
    if ([".git", "node_modules", "dist"].includes(entry)) continue;
    const path = join(root, entry);
    const stat = statSync(path);
    if (stat.isDirectory()) files.push(...walkMarkdown(path));
    else if (entry.endsWith(".md")) files.push(path);
  }
  return files;
}

export function parseFrontmatter(source: string): { data?: Record<string, unknown>; body: string } {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match?.[1]) return { body: source };
  const parsed: unknown = parse(match[1]);
  if (!isRecord(parsed)) return { body: source };
  return { data: parsed, body: source.slice(match[0].length) };
}

function headingTitle(body: string, fallback: string): string {
  const match = /^#\s+(.+)$/m.exec(body);
  return match?.[1]?.trim() || fallback;
}

function section(body: string, name: string): string {
  const pattern = new RegExp(`^##\\s+${name}\\s*$`, "im");
  const start = body.search(pattern);
  if (start < 0) return "";
  const afterHeading = body.slice(start).replace(pattern, "");
  const next = afterHeading.search(/^##\s+/m);
  return (next < 0 ? afterHeading : afterHeading.slice(0, next)).trim();
}

function asKind(value: unknown): NoteKind | undefined {
  return typeof value === "string" && (NOTE_KINDS as readonly string[]).includes(value)
    ? (value as NoteKind)
    : undefined;
}

function asStatus(value: unknown): NoteStatus | undefined {
  return typeof value === "string" && (NOTE_STATUSES as readonly string[]).includes(value)
    ? (value as NoteStatus)
    : undefined;
}

function asPaths(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  if (!value.every((item) => typeof item === "string" && item.trim().length > 0)) return undefined;
  return value.map((item) => String(item).trim());
}

export function parseNote(absolutePath: string, source: string, projectRoot: string): KnowledgeNote {
  const relativePath = relative(projectRoot, absolutePath).split(sep).join("/");
  const underDecisions = relativePath.includes("/knowledge/decisions/") || relativePath.endsWith("/knowledge/decisions");
  const { data, body } = parseFrontmatter(source);
  const title = headingTitle(body, basename(absolutePath, ".md"));
  const claim = section(body, "Claim");
  const evidence = section(body, "Evidence");
  const reuseGuidance = section(body, "Reuse guidance");
  const refreshTriggers = section(body, "Refresh triggers");

  if (underDecisions) {
    return {
      absolutePath,
      relativePath,
      classification: "decision",
      title,
      claim,
      evidence,
      reuseGuidance,
      refreshTriggers,
      source,
    };
  }

  const hasTypedField = Boolean(
    data && ["kind", "status", "validated_at", "relevant_paths"].some((field) => field in data),
  );
  if (!hasTypedField) {
    return {
      absolutePath,
      relativePath,
      classification: "legacy",
      title,
      claim,
      evidence,
      reuseGuidance,
      refreshTriggers,
      source,
    };
  }

  const kind = asKind(data?.kind);
  const status = asStatus(data?.status);
  const validated_at = typeof data?.validated_at === "string" ? data.validated_at.trim() : "";
  const relevant_paths = asPaths(data?.relevant_paths);
  const typed = Boolean(kind && status && validated_at && relevant_paths);
  const classification: NoteClassification = typed ? "typed" : "invalid-typed";
  const note: KnowledgeNote = {
    absolutePath,
    relativePath,
    classification,
    title,
    claim,
    evidence,
    reuseGuidance,
    refreshTriggers,
    source,
  };
  if (typed && kind && status && relevant_paths) {
    note.frontmatter = { kind, status, validated_at, relevant_paths };
  }
  return note;
}

export function knowledgeRoot(projectRoot: string): string {
  return join(projectRoot, ".methodrail", "knowledge");
}

export function loadKnowledgeNotes(projectRoot: string): KnowledgeNote[] {
  const root = knowledgeRoot(projectRoot);
  return walkMarkdown(root).map((path) => parseNote(path, readFileSync(path, "utf8"), projectRoot));
}

export function loadProjectMd(projectRoot: string): string | null {
  const path = join(projectRoot, ".methodrail", "PROJECT.md");
  return existsSync(path) ? readFileSync(path, "utf8") : null;
}

export function knowledgeIndexEntries(projectMd: string): { title: string; href: string }[] {
  const entries: { title: string; href: string }[] = [];
  for (const match of projectMd.matchAll(/\[([^\]]+)\]\(([^)]+)\)/g)) {
    const title = match[1]?.trim() ?? "";
    const href = (match[2]?.trim() ?? "").split("#", 1)[0] ?? "";
    if (!/knowledge\/.+\.md$/i.test(href)) continue;
    if (/knowledge\/decisions\//i.test(href)) continue;
    entries.push({ title, href });
  }
  return entries;
}
