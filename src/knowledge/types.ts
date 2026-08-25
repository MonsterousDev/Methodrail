export const NOTE_KINDS = ["fact", "invariant", "convention", "known-failure", "hypothesis"] as const;
export const NOTE_STATUSES = ["verified", "provisional"] as const;
export const FRESHNESS_STATES = ["fresh", "review-required", "unknown"] as const;

export type NoteKind = (typeof NOTE_KINDS)[number];
export type NoteStatus = (typeof NOTE_STATUSES)[number];
export type FreshnessState = (typeof FRESHNESS_STATES)[number];
export type NoteClassification = "typed" | "invalid-typed" | "legacy" | "decision";

export const MAX_NOTE_LINES = 80;
export const MAX_NOTE_CHARS = 4000;

export interface NoteFrontmatter {
  kind: NoteKind;
  status: NoteStatus;
  validated_at: string;
  relevant_paths: string[];
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
