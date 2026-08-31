export const NOTE_KINDS = ["fact", "invariant", "convention", "known-failure", "hypothesis"] as const;
export const NOTE_STATUSES = ["verified", "provisional"] as const;
export const NOTE_LIFECYCLES = ["active", "disputed", "retired"] as const;
export const FRESHNESS_STATES = ["fresh", "review-required", "unknown"] as const;
export const TYPED_FIELDS = [
  "kind",
  "status",
  "validated_at",
  "relevant_paths",
  "lifecycle",
  "scope",
  "conflicts_with",
  "superseded_by",
] as const;

export type NoteKind = (typeof NOTE_KINDS)[number];
export type NoteStatus = (typeof NOTE_STATUSES)[number];
export type NoteLifecycle = (typeof NOTE_LIFECYCLES)[number];
export type FreshnessState = (typeof FRESHNESS_STATES)[number];
export type NoteClassification = "typed" | "invalid-typed" | "legacy" | "decision";

export const MAX_NOTE_LINES = 80;
export const MAX_NOTE_CHARS = 4000;

export interface NoteScope {
  include_paths?: string[];
  exclude_paths?: string[];
}

export interface NoteFrontmatter {
  kind: NoteKind;
  status: NoteStatus;
  validated_at: string;
  relevant_paths: string[];
  lifecycle: NoteLifecycle;
  scope?: NoteScope;
  conflicts_with?: string[];
  superseded_by?: string;
}

export interface KnowledgeNote {
  absolutePath: string;
  relativePath: string;
  classification: NoteClassification;
  title: string;
  frontmatter?: NoteFrontmatter;
  claim: string;
  evidence: string;
  reuseGuidance: string;
  refreshTriggers: string;
  source: string;
  parseError?: string;
  dispute?: string;
  retirement?: string;
  governanceErrors?: string[];
}

export interface KnowledgeDiagnostic {
  level: "error" | "warning";
  path: string;
  message: string;
}

export interface FreshnessResult {
  state: FreshnessState;
  evidence: string;
}

export interface KnowledgeReport {
  notes: KnowledgeNote[];
  errors: KnowledgeDiagnostic[];
  warnings: KnowledgeDiagnostic[];
}
