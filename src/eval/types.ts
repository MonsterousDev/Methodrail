export const EXPENSIVE_SKILLS = [
  "wayfinder",
  "architect",
  "arena",
  "swarm",
  "interrogate",
] as const;

export type EvalCondition = "baseline" | "methodrail";

export interface EvalRun {
  fixture_id: string;
  condition: EvalCondition;
  host?: string;
  model?: string;
  started_at?: string;
  ended_at?: string;
  latency_ms?: number | null;
  skills_invoked: string[];
  references_loaded: string[];
  tools_used: string[];
  subagents_used: number;
  verification_steps: string[];
  evidence: string[];
  outcome: string;
  failure_modes: string[];
  behaviors_observed?: string[];
  notes?: string;
}

export interface FixtureExpectation {
  id: string;
  required_skills?: string[];
  forbidden_skills: string[];
  expected_behaviors: string[];
  max_subagents?: number;
  max_expensive_skills?: number;
  expensive_skills?: string[];
}

export interface ScoreResult {
  fixture_id: string;
  condition: EvalCondition;
  passed: boolean;
  skill_hits: string[];
  skill_misses: string[];
  forbidden_hits: string[];
  behavior_hits: string[];
  behavior_misses: string[];
  metrics: {
    skill_count: number;
    reference_count: number;
    subagents_used: number;
    verification_steps: number;
    expensive_skill_count: number;
    latency_ms: number | null;
  };
  failures: string[];
}

export interface ComparisonReport {
  fixture_id: string;
  baseline: ScoreResult;
  methodrail: ScoreResult;
  methodrail_helped: boolean | null;
  where: string[];
  cost: string[];
  extra_complexity: string[];
  verdict: "helped" | "mixed" | "harmed" | "incomplete";
}
