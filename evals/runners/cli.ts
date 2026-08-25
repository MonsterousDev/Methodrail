import { existsSync, readdirSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { compareScores, formatComparison, integrityFailure } from "../../src/eval/compare.js";
import { requiredArtifactPaths } from "../../src/eval/grade-outcome.js";
import {
  isCanonicalExampleFile,
  loadExpectationFile,
  loadRunFile,
  REQUIRED_COMPOSITION_FIXTURES,
} from "../../src/eval/load.js";
import { gradePilotManifest } from "../../src/eval/pilot.js";
import { scoreRun } from "../../src/eval/score.js";
import type { EvalContext } from "../../src/eval/types.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");
const ctx: EvalContext = { repoRoot };

function fail(message: string): never {
  console.error(message);
  process.exitCode = 1;
  throw new Error(message);
}

function validateFixtures(): void {
  const missing: string[] = [];
  for (const name of REQUIRED_COMPOSITION_FIXTURES) {
    const dir = join(repoRoot, "evals", "fixtures", name);
    const expected = join(dir, "expected.yaml");
    const task = join(dir, "task.md");
    if (!existsSync(dir) || !existsSync(expected) || !existsSync(task)) {
      missing.push(name);
    } else {
      loadExpectationFile(expected);
    }
  }
  if (missing.length > 0) fail(`Missing composition fixtures: ${missing.join(", ")}`);
  console.log(`Validated ${REQUIRED_COMPOSITION_FIXTURES.length} composition fixtures.`);
}

function scorePath(runPath: string, expectedPath?: string): void {
  const run = loadRunFile(runPath);
  const expectation = loadExpectationFile(
    expectedPath ?? join(repoRoot, "evals", "fixtures", run.fixture_id, "expected.yaml"),
  );
  const result = scoreRun(run, expectation, ctx);
  console.log(JSON.stringify(result, null, 2));
  if (!result.outcome.passed) process.exitCode = 1;
}

function comparePaths(baselinePath: string, methodrailPath: string): ReturnType<typeof compareScores> {
  const baselineRun = loadRunFile(baselinePath);
  const methodrailRun = loadRunFile(methodrailPath);
  if (baselineRun.fixture_id !== methodrailRun.fixture_id) {
    fail("Baseline and Methodrail runs must share fixture_id");
  }
  const expectation = loadExpectationFile(
    join(repoRoot, "evals", "fixtures", methodrailRun.fixture_id, "expected.yaml"),
  );
  const report = compareScores(scoreRun(baselineRun, expectation, ctx), scoreRun(methodrailRun, expectation, ctx));
  console.log(formatComparison(report));
  return report;
}

function assertArtifacts(runPath: string): void {
  const run = loadRunFile(runPath);
  const missing = requiredArtifactPaths(run).filter((rel) => !existsSync(join(repoRoot, rel)));
  if (missing.length > 0) fail(`${run.fixture_id} ${run.condition}: missing artifacts: ${missing.join(", ")}`);
  if (requiredArtifactPaths(run).length === 0) {
    fail(`${run.fixture_id} ${run.condition}: run must point at artifacts`);
  }
}

function pilot(manifestPath: string): string[] {
  const grade = gradePilotManifest(manifestPath, ctx);
  console.log(`\n=== live pilot: ${grade.manifest.id} ===`);
  for (const pair of grade.pairs) {
    const baseline = pair.report.baseline.outcome.passed ? "pass" : "fail";
    const methodrail = pair.report.methodrail.outcome.passed ? "pass" : "fail";
    console.log(
      `${pair.fixture} ${pair.host} r${pair.repeat}: ${pair.report.empirical ?? "n/a"} (${baseline} → ${methodrail}; ${pair.report.capture})`,
    );
  }
  return grade.integrity_errors;
}

function examples(): void {
  validateFixtures();
  const exampleDir = join(repoRoot, "evals", "runners", "examples");
  const integrityErrors: string[] = [];
  for (const id of REQUIRED_COMPOSITION_FIXTURES) {
    const baselinePath = join(exampleDir, `${id}.baseline.json`);
    const methodrailPath = join(exampleDir, `${id}.methodrail.json`);
    if (!existsSync(baselinePath) || !existsSync(methodrailPath)) {
      integrityErrors.push(`${id}: missing canonical pair`);
      continue;
    }
    try {
      assertArtifacts(baselinePath);
      assertArtifacts(methodrailPath);
    } catch (error) {
      integrityErrors.push((error as Error).message);
      continue;
    }
    console.log(`\n--- ${id} ---`);
    const report = comparePaths(baselinePath, methodrailPath);
    const failure = integrityFailure(report);
    if (failure) integrityErrors.push(failure);
  }
  const extras = existsSync(exampleDir)
    ? readdirSync(exampleDir).filter((name) => isCanonicalExampleFile(name))
    : [];
  if (extras.length === 0 && integrityErrors.length === 0) fail("No example runs found under evals/runners/examples");
  for (const manifest of ["evals/pilot-t5-t10.yaml", "evals/pilot-v0.7-knowledge.yaml"]) {
    const path = join(repoRoot, manifest);
    if (existsSync(path)) integrityErrors.push(...pilot(path));
  }
  if (integrityErrors.length > 0) fail(`Integrity gate failed:\n${integrityErrors.join("\n")}`);
}

function main(): void {
  const [command, left, right] = process.argv.slice(2);
  switch (command) {
    case "validate":
    case undefined:
      if (!command) examples();
      else validateFixtures();
      break;
    case "score":
      if (!left) fail("Usage: eval-runner score <run.json> [expected.yaml]");
      scorePath(resolve(left), right ? resolve(right) : undefined);
      break;
    case "compare":
      if (!left || !right) fail("Usage: eval-runner compare <baseline.json> <methodrail.json>");
      comparePaths(resolve(left), resolve(right));
      break;
    case "pilot": {
      const manifest = resolve(left ?? join(repoRoot, "evals/pilot-t5-t10.yaml"));
      const errors = pilot(manifest);
      if (errors.length > 0) fail(`Pilot integrity gate failed:\n${errors.join("\n")}`);
      break;
    }
    case "examples":
      examples();
      break;
    default:
      fail("Usage: eval-runner validate|score|compare|examples|pilot");
  }
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) {
  try {
    main();
  } catch (error) {
    if (process.exitCode !== 1) {
      console.error(error);
      process.exitCode = 1;
    }
  }
}
