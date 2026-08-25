import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import type { EvalRun, FixtureExpectation } from "./types.js";

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function strings(value: unknown): string[] {
  return Array.isArray(value) && value.every((item) => typeof item === "string") ? value : [];
}

export function parseExpectation(value: unknown): FixtureExpectation {
  if (!isRecord(value) || typeof value.id !== "string") {
    throw new Error("Fixture expectation requires a string id");
  }
  const expected: FixtureExpectation = {
    id: value.id,
    required_skills: strings(value.required_skills),
    forbidden_skills: strings(value.forbidden_skills),
    expected_behaviors: strings(value.expected_behaviors),
  };
  if (typeof value.max_subagents === "number") expected.max_subagents = value.max_subagents;
  if (typeof value.max_expensive_skills === "number") {
    expected.max_expensive_skills = value.max_expensive_skills;
  }
  const expensive = strings(value.expensive_skills);
  if (expensive.length > 0) expected.expensive_skills = expensive;
  return expected;
}

export function parseRun(value: unknown): EvalRun {
  if (!isRecord(value) || typeof value.fixture_id !== "string") {
    throw new Error("Eval run requires fixture_id");
  }
  if (value.condition !== "baseline" && value.condition !== "methodrail") {
    throw new Error("Eval run condition must be baseline or methodrail");
  }
  const run: EvalRun = {
    fixture_id: value.fixture_id,
    condition: value.condition,
    skills_invoked: strings(value.skills_invoked),
    references_loaded: strings(value.references_loaded),
    tools_used: strings(value.tools_used),
    subagents_used: typeof value.subagents_used === "number" ? value.subagents_used : 0,
    verification_steps: strings(value.verification_steps),
    evidence: strings(value.evidence),
    outcome: typeof value.outcome === "string" ? value.outcome : "",
    failure_modes: strings(value.failure_modes),
    behaviors_observed: strings(value.behaviors_observed),
  };
  if (typeof value.host === "string") run.host = value.host;
  if (typeof value.model === "string") run.model = value.model;
  if (typeof value.started_at === "string") run.started_at = value.started_at;
  if (typeof value.ended_at === "string") run.ended_at = value.ended_at;
  if (typeof value.latency_ms === "number") run.latency_ms = value.latency_ms;
  if (typeof value.notes === "string") run.notes = value.notes;
  return run;
}

export function loadExpectationFile(path: string): FixtureExpectation {
  return parseExpectation(parse(readFileSync(path, "utf8")));
}

export function loadRunFile(path: string): EvalRun {
  return parseRun(JSON.parse(readFileSync(path, "utf8")));
}

export const REQUIRED_COMPOSITION_FIXTURES = [
  "simple-change",
  "medium-feature",
  "runtime-bug",
  "architecture-decision",
  "review-risk",
  "project-init",
  "init-value",
  "knowledge-freshness",
  "knowledge-accumulation",
  "partial-knowledge",
  "human-decision",
] as const;

/** Canonical example names: `<fixture>.baseline.json` / `<fixture>.methodrail.json` for required fixtures only. Host extras and Task A traces (e.g. `knowledge-accumulation-discover.methodrail.json`) are not loaded by `npm run eval`. */
export function isCanonicalExampleFile(name: string): boolean {
  return (REQUIRED_COMPOSITION_FIXTURES as readonly string[]).some(
    (id) => name === `${id}.baseline.json` || name === `${id}.methodrail.json`,
  );
}

export function listFixtureDirs(evalsRoot: string): string[] {
  const root = join(evalsRoot, "fixtures");
  if (!existsSync(root)) return [];
  return readdirSync(root).filter((name) => statSync(join(root, name)).isDirectory());
}
