import { basename } from "node:path";
import type { EvalCaseResult, EvalFixture, RoutingDecision } from "../types.js";
import { methodrailRoot } from "../paths.js";
import { readYamlFile } from "../schemas/catalog.js";
import { collectEvalFixtureFiles, validateEvalFixtureFile } from "../validation/index.js";
import { route } from "../routing/index.js";
import { resolveProvider, type EvalProvider } from "./provider.js";

export interface EvalReport {
  passed: number;
  failed: number;
  skipped: number;
  results: EvalCaseResult[];
}

export interface RunEvalsOptions {
  root?: string;
  filter?: {
    kind?: string;
    skill?: string;
    id?: string;
  };
  provider?: EvalProvider;
}

export function loadEvalFixtures(root = methodrailRoot()): EvalFixture[] {
  const files = collectEvalFixtureFiles(root);
  const fixtures: EvalFixture[] = [];
  for (const file of files) {
    const parsed = readYamlFile(file);
    const docs = Array.isArray(parsed) ? parsed : [parsed];
    for (const doc of docs) {
      fixtures.push(doc as EvalFixture);
    }
  }
  return fixtures;
}

export function runEvals(options: RunEvalsOptions = {}): EvalReport {
  const root = options.root ?? methodrailRoot();
  const provider = options.provider ?? resolveProvider();
  const fixtures = loadEvalFixtures(root).filter((f) => matchesFilter(f, options.filter));
  const results: EvalCaseResult[] = [];

  for (const fixture of fixtures) {
    const file = fixtureFileFor(fixture, root);
    if (file) {
      const schema = validateEvalFixtureFile(file, root);
      if (!schema.ok) {
        results.push({
          id: fixture.id,
          kind: fixture.kind,
          status: "fail",
          messages: schema.issues.map((i) => `${i.path}: ${i.message}`),
        });
        continue;
      }
    }

    if (fixture.requires_llm && provider.id === "none") {
      results.push({
        id: fixture.id,
        kind: fixture.kind,
        status: "skip",
        messages: ["Requires an LLM provider; running structural/routing checks only"],
      });
      continue;
    }

    if (
      fixture.kind === "routing" ||
      fixture.kind === "pressure" ||
      fixture.kind === "workflow" ||
      fixture.kind === "completion"
    ) {
      results.push(evaluateRoutingFixture(fixture));
      continue;
    }

    if (fixture.kind === "behavior") {
      if (fixture.requires_llm) {
        results.push({
          id: fixture.id,
          kind: fixture.kind,
          status: "skip",
          messages: ["Behavioral LLM eval skipped (no provider)"],
        });
      } else {
        results.push(evaluateRoutingFixture(fixture));
      }
    }
  }

  return summarize(results);
}

function evaluateRoutingFixture(fixture: EvalFixture): EvalCaseResult {
  const decision = route({ prompt: fixture.input.prompt });
  const messages = compareDecision(decision, fixture);
  return {
    id: fixture.id,
    kind: fixture.kind,
    status: messages.length === 0 ? "pass" : "fail",
    messages,
  };
}

export function compareDecision(decision: RoutingDecision, fixture: EvalFixture): string[] {
  const messages: string[] = [];
  const expected = fixture.expected;
  const activated = new Set([...decision.skills.required, ...decision.skills.recommended]);

  if (expected.workflow && expected.workflow !== decision.workflow) {
    messages.push(`workflow: expected ${expected.workflow}, got ${decision.workflow}`);
  }
  if (expected.rigor?.equals !== undefined && expected.rigor.equals !== decision.rigor) {
    messages.push(`rigor: expected ${expected.rigor.equals}, got ${decision.rigor}`);
  }
  if (expected.rigor?.min !== undefined && decision.rigor < expected.rigor.min) {
    messages.push(`rigor: expected ≥ ${expected.rigor.min}, got ${decision.rigor}`);
  }
  if (expected.rigor?.max !== undefined && decision.rigor > expected.rigor.max) {
    messages.push(`rigor: expected ≤ ${expected.rigor.max}, got ${decision.rigor}`);
  }
  for (const skill of expected.skills?.required ?? []) {
    if (!activated.has(skill)) {
      messages.push(`skill ${skill} should be required or recommended (activated=${[...activated].join(", ") || "none"})`);
    }
  }
  for (const skill of expected.skills?.forbidden ?? []) {
    if (activated.has(skill) || decision.skills.required.includes(skill)) {
      messages.push(`skill ${skill} should not activate`);
    }
  }
  if (expected.gates) {
    for (const [key, value] of Object.entries(expected.gates)) {
      const actual = decision.gates[key as keyof typeof decision.gates];
      if (actual !== value) {
        messages.push(`gate ${key}: expected ${String(value)}, got ${String(actual)}`);
      }
    }
  }
  if (
    expected.humanInputRequired !== undefined &&
    expected.humanInputRequired !== decision.humanInputRequired
  ) {
    messages.push(
      `humanInputRequired: expected ${String(expected.humanInputRequired)}, got ${String(decision.humanInputRequired)}`,
    );
  }
  if (
    expected.allow_code_modification !== undefined &&
    expected.allow_code_modification !== decision.gates.allowCodeModification
  ) {
    messages.push(
      `allow_code_modification: expected ${String(expected.allow_code_modification)}, got ${String(decision.gates.allowCodeModification)}`,
    );
  }
  return messages;
}

function matchesFilter(
  fixture: EvalFixture,
  filter: RunEvalsOptions["filter"],
): boolean {
  if (!filter) return true;
  if (filter.kind && fixture.kind !== filter.kind && !(filter.kind === "routing" && fixture.kind === "pressure")) {
    if (filter.kind === "skill") {
      return fixture.skill === filter.skill || fixture.id.includes(filter.skill ?? "");
    }
    if (filter.kind !== fixture.kind) return false;
  }
  if (filter.skill && fixture.skill !== filter.skill && !fixture.id.includes(filter.skill)) {
    return false;
  }
  if (filter.id && fixture.id !== filter.id) return false;
  return true;
}

function fixtureFileFor(fixture: EvalFixture, root: string): string | undefined {
  return collectEvalFixtureFiles(root).find((f) => {
    const id = basename(f).replace(/\.(yaml|yml)$/, "");
    return f.includes(fixture.id) || id === fixture.id || fixture.id.startsWith(id);
  });
}

function summarize(results: EvalCaseResult[]): EvalReport {
  return {
    passed: results.filter((r) => r.status === "pass").length,
    failed: results.filter((r) => r.status === "fail").length,
    skipped: results.filter((r) => r.status === "skip").length,
    results,
  };
}
