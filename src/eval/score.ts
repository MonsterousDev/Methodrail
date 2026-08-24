import { EXPENSIVE_SKILLS, type EvalRun, type FixtureExpectation, type ScoreResult } from "./types.js";

function includesAll(haystack: string[], needles: string[]): { hits: string[]; misses: string[] } {
  const set = new Set(haystack);
  const hits = needles.filter((item) => set.has(item));
  const misses = needles.filter((item) => !set.has(item));
  return { hits, misses };
}

export function scoreRun(run: EvalRun, expected: FixtureExpectation): ScoreResult {
  const required = expected.required_skills ?? [];
  const { hits: skillHits, misses: skillMisses } = includesAll(run.skills_invoked, required);
  const forbiddenHits = run.skills_invoked.filter((skill) => expected.forbidden_skills.includes(skill));
  const observed = run.behaviors_observed ?? [];
  const { hits: behaviorHits, misses: behaviorMisses } = includesAll(observed, expected.expected_behaviors);
  const expensive = expected.expensive_skills ?? [...EXPENSIVE_SKILLS];
  const expensiveCount = run.skills_invoked.filter((skill) => expensive.includes(skill)).length;
  const failures: string[] = [];

  if (skillMisses.length > 0) failures.push(`missing required skills: ${skillMisses.join(", ")}`);
  if (forbiddenHits.length > 0) failures.push(`forbidden skills invoked: ${forbiddenHits.join(", ")}`);
  if (run.behaviors_observed && behaviorMisses.length > 0) {
    failures.push(`missing expected behaviors: ${behaviorMisses.join(", ")}`);
  }
  if (expected.max_subagents !== undefined && run.subagents_used > expected.max_subagents) {
    failures.push(`subagents ${run.subagents_used} exceed max ${expected.max_subagents}`);
  }
  if (expected.max_expensive_skills !== undefined && expensiveCount > expected.max_expensive_skills) {
    failures.push(`expensive skills ${expensiveCount} exceed max ${expected.max_expensive_skills}`);
  }

  return {
    fixture_id: expected.id,
    condition: run.condition,
    passed: failures.length === 0,
    skill_hits: skillHits,
    skill_misses: skillMisses,
    forbidden_hits: forbiddenHits,
    behavior_hits: behaviorHits,
    behavior_misses: behaviorMisses,
    metrics: {
      skill_count: run.skills_invoked.length,
      reference_count: run.references_loaded.length,
      subagents_used: run.subagents_used,
      verification_steps: run.verification_steps.length,
      expensive_skill_count: expensiveCount,
      latency_ms: run.latency_ms ?? null,
    },
    failures,
  };
}
