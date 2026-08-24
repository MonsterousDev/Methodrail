import { existsSync, readdirSync, readFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import { compareScores, formatComparison } from "../../src/eval/compare.js";
import {
  loadExpectationFile,
  loadRunFile,
  REQUIRED_COMPOSITION_FIXTURES,
} from "../../src/eval/load.js";
import { scoreRun } from "../../src/eval/score.js";

const here = dirname(fileURLToPath(import.meta.url));
const repoRoot = resolve(here, "../..");

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
  const result = scoreRun(run, expectation);
  console.log(JSON.stringify(result, null, 2));
  if (!result.passed) process.exitCode = 1;
}

function comparePaths(baselinePath: string, methodrailPath: string): void {
  const baselineRun = loadRunFile(baselinePath);
  const methodrailRun = loadRunFile(methodrailPath);
  if (baselineRun.fixture_id !== methodrailRun.fixture_id) {
    fail("Baseline and Methodrail runs must share fixture_id");
  }
  const expectation = loadExpectationFile(
    join(repoRoot, "evals", "fixtures", methodrailRun.fixture_id, "expected.yaml"),
  );
  const report = compareScores(scoreRun(baselineRun, expectation), scoreRun(methodrailRun, expectation));
  console.log(formatComparison(report));
}

function examples(): void {
  validateFixtures();
  const exampleDir = join(repoRoot, "evals", "runners", "examples");
  const files = existsSync(exampleDir) ? readdirSync(exampleDir).filter((name) => name.endsWith(".json")) : [];
  const byFixture = new Map<string, { baseline?: string; methodrail?: string }>();
  for (const file of files) {
    const path = join(exampleDir, file);
    const run = loadRunFile(path);
    const entry = byFixture.get(run.fixture_id) ?? {};
    entry[run.condition] = path;
    byFixture.set(run.fixture_id, entry);
  }
  if (byFixture.size === 0) fail("No example runs found under evals/runners/examples");
  for (const [id, pair] of byFixture) {
    if (!pair.baseline || !pair.methodrail) fail(`Example pair incomplete for ${id}`);
    console.log(`\n--- ${id} ---`);
    comparePaths(pair.baseline, pair.methodrail);
  }
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
    case "examples":
      examples();
      break;
    default:
      fail("Usage: eval-runner validate|score|compare|examples");
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
