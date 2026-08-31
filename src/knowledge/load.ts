import { existsSync, readFileSync } from "node:fs";
import { basename, join, relative, sep } from "node:path";
import { parse } from "yaml";
import { walkFiles } from "../fs-walk.js";
import { canonicalizeRepoPath, parseNoteIdentity } from "./paths.js";
import type {
  KnowledgeNote,
  NoteClassification,
  NoteKind,
  NoteLifecycle,
  NoteScope,
  NoteStatus,
} from "./types.js";
import { NOTE_KINDS, NOTE_LIFECYCLES, NOTE_STATUSES, TYPED_FIELDS } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function parseFrontmatter(source: string): {
  data?: Record<string, unknown>;
  body: string;
  parseError?: string;
} {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)/.exec(source);
  if (!match?.[1]) return { body: source };
  let parsed: unknown;
  try {
    parsed = parse(match[1]);
  } catch (error) {
    return { body: source, parseError: error instanceof Error ? error.message : String(error) };
  }
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

function asLifecycle(value: unknown): NoteLifecycle | undefined {
  return typeof value === "string" && (NOTE_LIFECYCLES as readonly string[]).includes(value)
    ? (value as NoteLifecycle)
    : undefined;
}

function asIdentityList(value: unknown): string[] | undefined {
  if (!Array.isArray(value) || value.length === 0) return undefined;
  const identities: string[] = [];
  for (const item of value) {
    if (typeof item !== "string") return undefined;
    const identity = parseNoteIdentity(item);
    if (!identity) return undefined;
    identities.push(identity);
  }
  return identities;
}

function asScope(value: unknown): { scope?: NoteScope; error?: string } {
  if (value === undefined) return {};
  if (!isRecord(value)) return { error: "scope must be a mapping of include_paths and/or exclude_paths" };
  const unknownKeys = Object.keys(value).filter((key) => key !== "include_paths" && key !== "exclude_paths");
  if (unknownKeys.length > 0) return { error: `scope has unknown keys: ${unknownKeys.join(", ")}` };
  if (!("include_paths" in value) && !("exclude_paths" in value)) {
    return { error: "scope must declare include_paths and/or exclude_paths" };
  }
  const scope: NoteScope = {};
  for (const field of ["include_paths", "exclude_paths"] as const) {
    if (!(field in value)) continue;
    const paths = asPaths(value[field]);
    if (!paths) return { error: `${field} must be a non-empty array of repository-relative paths` };
    const canonical: string[] = [];
    for (const declared of paths) {
      const normalized = canonicalizeRepoPath(declared);
      if (!normalized) return { error: `invalid ${field} entry: ${declared}` };
      canonical.push(normalized);
    }
    scope[field] = canonical;
  }
  return { scope };
}

function parseGovernance(data: Record<string, unknown> | undefined): {
  lifecycle: NoteLifecycle;
  scope?: NoteScope;
  conflicts_with?: string[];
  superseded_by?: string;
  errors: string[];
} {
  const errors: string[] = [];
  if (!data) return { lifecycle: "active", errors };
  let lifecycle: NoteLifecycle = "active";
  if ("lifecycle" in data) {
    const parsed = asLifecycle(data.lifecycle);
    if (!parsed) errors.push("lifecycle must be active, disputed, or retired");
    else lifecycle = parsed;
  }
  const scoped = asScope(data.scope);
  if (scoped.error) errors.push(scoped.error);
  let conflicts_with: string[] | undefined;
  if ("conflicts_with" in data) {
    conflicts_with = asIdentityList(data.conflicts_with);
    if (!conflicts_with) errors.push("conflicts_with must be a non-empty array of knowledge/<slug>.md identities");
  }
  let superseded_by: string | undefined;
  if ("superseded_by" in data) {
    superseded_by = typeof data.superseded_by === "string" ? parseNoteIdentity(data.superseded_by) : undefined;
    if (!superseded_by) errors.push("superseded_by must be one knowledge/<slug>.md identity");
  }
  return { lifecycle, errors, ...(scoped.scope ? { scope: scoped.scope } : {}), ...(conflicts_with ? { conflicts_with } : {}), ...(superseded_by ? { superseded_by } : {}) };
}

export function parseNote(absolutePath: string, source: string, projectRoot: string): KnowledgeNote {
  const relativePath = relative(projectRoot, absolutePath).split(sep).join("/");
  const underDecisions = relativePath.includes("/knowledge/decisions/") || relativePath.endsWith("/knowledge/decisions");
  const { data, body, parseError } = parseFrontmatter(source);
  const title = headingTitle(body, basename(absolutePath, ".md"));
  if (parseError) {
    return {
      absolutePath,
      relativePath,
      classification: "invalid-typed",
      title,
      claim: "",
      evidence: "",
      reuseGuidance: "",
      refreshTriggers: "",
      source,
      parseError,
    };
  }
  const claim = section(body, "Claim");
  const evidence = section(body, "Evidence");
  const reuseGuidance = section(body, "Reuse guidance");
  const refreshTriggers = section(body, "Refresh triggers");
  const dispute = section(body, "Dispute");
  const retirement = section(body, "Retirement");

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
      dispute,
      retirement,
    };
  }

  const hasTypedField = Boolean(data && TYPED_FIELDS.some((field) => field in data));
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
      dispute,
      retirement,
    };
  }

  const kind = asKind(data?.kind);
  const status = asStatus(data?.status);
  const validated_at = typeof data?.validated_at === "string" ? data.validated_at.trim() : "";
  const relevant_paths = asPaths(data?.relevant_paths);
  const typed = Boolean(kind && status && validated_at && relevant_paths);
  const classification: NoteClassification = typed ? "typed" : "invalid-typed";
  const governance = parseGovernance(data);
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
    dispute,
    retirement,
  };
  if (governance.errors.length > 0) note.governanceErrors = governance.errors;
  if (typed && kind && status && relevant_paths) {
    note.frontmatter = {
      kind,
      status,
      validated_at,
      relevant_paths,
      lifecycle: governance.lifecycle,
    };
    if (governance.scope) note.frontmatter.scope = governance.scope;
    if (governance.conflicts_with) note.frontmatter.conflicts_with = governance.conflicts_with;
    if (governance.superseded_by) note.frontmatter.superseded_by = governance.superseded_by;
  }
  return note;
}

export function knowledgeRoot(projectRoot: string): string {
  return join(projectRoot, ".methodrail", "knowledge");
}

export function loadKnowledgeNotes(projectRoot: string): KnowledgeNote[] {
  const root = knowledgeRoot(projectRoot);
  return walkFiles(root, (path) => path.endsWith(".md")).map((path) =>
    parseNote(path, readFileSync(path, "utf8"), projectRoot),
  );
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
