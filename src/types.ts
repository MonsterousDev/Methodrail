export const SKILL_KINDS = [
  "investigation",
  "observation",
  "experiment",
  "modeling",
  "architecture",
  "debugging",
  "verification",
  "review",
  "adapter",
  "execution",
] as const;
export type SkillKind = (typeof SKILL_KINDS)[number];

export const INVOCATION_MODES = [
  "implicit",
  "explicit",
  "workflow-only",
  "internal",
] as const;
export type InvocationMode = (typeof INVOCATION_MODES)[number];

export const WORKFLOW_IDS = [
  "investigate",
  "develop",
  "debug",
  "refactor",
  "review",
] as const;
export type WorkflowId = (typeof WORKFLOW_IDS)[number];

export type RigorLevel = 0 | 1 | 2 | 3 | 4 | 5;

export interface SkillMetadata {
  id: string;
  version: string;
  summary: string;
  kind: SkillKind;
  capabilities?: { provides?: string[] };
  invocation: { modes: InvocationMode[] };
  rigor: { minimum: RigorLevel; recommended?: RigorLevel };
  knowledge?: { reads?: string[]; produces?: string[] };
  side_effects: {
    filesystem: "none" | "read" | "write";
    git: "none" | "read" | "write";
    runtime: "none" | "observe" | "mutate";
    network: "none" | "read" | "write";
  };
  parallelism?: { strategy?: "none" | "partition" | "independent"; max_workers?: number };
  principles?: string[];
  completion: { requires: string[] };
  cost?: { tokens?: "low" | "medium" | "high"; latency?: "low" | "medium" | "high" };
}

export interface SkillRecord {
  id: string;
  dir: string;
  metadata: SkillMetadata;
  skillMd: string;
  hasScripts: boolean;
  hasReferences: boolean;
  evalFiles: string[];
}

export interface WorkflowState {
  description: string;
  kind:
    | "classify"
    | "knowledge"
    | "routing"
    | "skill"
    | "synthesize"
    | "execute"
    | "verify"
    | "review"
    | "gate"
    | "observe"
    | "decide";
  skills?: string[];
  selection?: "all" | "question-routing" | "risk" | "optional";
  optional?: boolean;
  terminal?: boolean;
  on_complete?: string[];
  on_blocked?: string[];
}

export interface WorkflowDefinition {
  id: string;
  version: string;
  summary: string;
  kind: "investigation" | "development" | "debugging" | "refactor" | "review";
  entry: string;
  rigor?: { minimum?: RigorLevel; default?: RigorLevel };
  constraints?: {
    allow_code_modification?: boolean;
    require_evidence?: boolean;
    require_human_approval?: boolean;
  };
  question_routing?: Array<{
    question: "how" | "why" | "observe" | "prototype" | "blast-radius" | "domain";
    skills: string[];
  }>;
  principles?: string[];
  completion: { requires: string[] };
  states: Record<string, WorkflowState>;
}

export interface PrincipleRecord {
  id: string;
  path: string;
  title: string;
}

export interface ValidationIssue {
  path: string;
  message: string;
  schema?: string;
}

export interface ValidationResult {
  ok: boolean;
  issues: ValidationIssue[];
}

export const QUESTION_KINDS = [
  "how",
  "why",
  "observe",
  "prototype",
  "blast-radius",
  "debug",
  "develop",
  "refactor",
  "review",
  "domain",
  "unknown",
] as const;
export type QuestionKind = (typeof QUESTION_KINDS)[number];

export type UncertaintyKind =
  | "human-preference"
  | "domain"
  | "implementation"
  | "runtime"
  | "historical"
  | "empirical"
  | "deterministic";

export interface RoutingGates {
  exploreBeforeChange: boolean;
  requireFreshEvidence: boolean;
  refuseUnsupportedCompletion: boolean;
  inspectEnvironmentFirst: boolean;
  requireRootCauseBeforeFix: boolean;
  allowCodeModification: boolean;
}

export interface RoutingExplanation {
  rule: string;
  detail: string;
}

export interface RoutingFeatures {
  questionKind: QuestionKind;
  taskIntent: WorkflowId | "adapt" | "unknown";
  riskHints: string[];
  scopeHint: "local" | "cross-boundary" | "system" | "unknown";
  empiricalNeed: boolean;
  runtimeNeed: boolean;
  historicalNeed: boolean;
  humanPreferenceLikely: boolean;
  pressureToSkipDiscipline: boolean;
  mechanicalChange: boolean;
  contractsFired: string[];
}

export interface RoutingInput {
  prompt: string;
  task?: {
    type?: WorkflowId | "adapt" | "unknown";
    rigor?: RigorLevel;
    question_kind?: QuestionKind;
  };
}

export interface RoutingDecision {
  workflow: WorkflowId;
  rigor: RigorLevel;
  skills: {
    required: string[];
    recommended: string[];
    excluded: string[];
  };
  humanInputRequired: boolean;
  uncertainty: Array<{ kind: UncertaintyKind; resolution: string }>;
  gates: RoutingGates;
  explanation: RoutingExplanation[];
  features: RoutingFeatures;
}

export type EvalKind = "routing" | "behavior" | "pressure" | "completion" | "workflow";

export interface EvalFixture {
  id: string;
  kind: EvalKind;
  skill?: string;
  workflow?: string;
  description: string;
  requires_llm?: boolean;
  input: {
    prompt: string;
    task?: Record<string, unknown>;
  };
  expected: {
    workflow?: string;
    rigor?: { equals?: number; min?: number; max?: number };
    skills?: { required?: string[]; forbidden?: string[] };
    gates?: Partial<RoutingGates>;
    humanInputRequired?: boolean;
    allow_code_modification?: boolean;
  };
}

export interface EvalCaseResult {
  id: string;
  kind: EvalKind;
  status: "pass" | "fail" | "skip";
  messages: string[];
}

export const CONTEXT_TRANSITIONS = [
  "continue",
  "clear",
  "handoff",
  "isolate",
  "compact",
] as const;
export type ContextTransition = (typeof CONTEXT_TRANSITIONS)[number];

export interface Decision {
  id: string;
  question: string;
  type: UncertaintyKind;
  status: "fog" | "frontier" | "known" | "blocked" | "deferred";
  depends_on?: string[];
  resolution_method: "human" | "source" | "observe" | "history" | "prototype" | "deterministic";
  owner?: string;
  blocks?: string[];
  decision?: string;
  evidence?: string[];
  reversibility?: "cheap" | "moderate" | "expensive" | "irreversible";
}
