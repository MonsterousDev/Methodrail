import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { EXPLICIT_SKILLS, SUGGEST_ONLY_SKILLS, WORKFLOW_SKILLS } from "../src/validate.js";

const root = dirname(dirname(fileURLToPath(import.meta.url)));

test("SKILL-MECHANICS distinguishes host discovery from parent composition", () => {
  const source = readFileSync(join(root, "skills/writing-for-agents/SKILL-MECHANICS.md"), "utf8");
  assert.match(source, /host discovery/i);
  assert.match(source, /workflow-callable/);
  assert.match(source, /[Ss]uggest-only/);
  assert.match(source, /`interrogate` is suggest-only/);
  assert.doesNotMatch(source, /only the human typing its name can invoke it/);
  assert.doesNotMatch(source, /It must not auto-fire them/);
  for (const name of WORKFLOW_SKILLS) {
    assert.match(source, new RegExp(`\`${name}\``));
  }
});

test("workflow and suggest-only skills stay explicit", () => {
  for (const name of [...WORKFLOW_SKILLS, ...SUGGEST_ONLY_SKILLS]) {
    assert.equal(EXPLICIT_SKILLS.has(name), true, name);
    const skill = readFileSync(join(root, "skills", name, "SKILL.md"), "utf8");
    assert.match(skill, /^disable-model-invocation:\s*true\s*$/m);
  }
});

test("parent skills name interrogate and wait instead of loading it", () => {
  const parents = ["architect", "develop", "review", "code-review"];
  for (const name of parents) {
    const source = readFileSync(join(root, "skills", name, "SKILL.md"), "utf8");
    assert.match(source, /[Nn]ame `interrogate`/, name);
    assert.doesNotMatch(source, /run `interrogate`/, name);
    assert.doesNotMatch(source, /(?<![Nn]ever |[Dd]o not )(?:invoke|load) `interrogate`/, name);
  }
});

test("swarm partitions slices and arena competes on one artifact", () => {
  const swarm = readFileSync(join(root, "skills/swarm/SKILL.md"), "utf8");
  const arena = readFileSync(join(root, "skills/arena/SKILL.md"), "utf8");
  assert.match(swarm, /independent slices/);
  assert.match(swarm, /compete on the same artifact; that is arena/);
  assert.doesNotMatch(swarm, /race the same brief|best-of|identical briefs/);
  assert.match(arena, /same(?: task| work)/i);
  assert.match(arena, /partition different independent slices/);
});

test("research returns findings in chat and does not write knowledge by default", () => {
  const research = readFileSync(join(root, "skills/research/SKILL.md"), "utf8");
  const investigate = readFileSync(join(root, "skills/investigate/SKILL.md"), "utf8");
  assert.match(research, /Return the cited findings in this conversation/);
  assert.match(research, /only when the user asks/);
  assert.doesNotMatch(research, /Write the findings to a single Markdown file/);
  assert.match(research, /Do not promote them to standing rules/);
  assert.match(research, /Even then, do not write `\.methodrail\/knowledge\/`/);
  assert.match(investigate, /`research` findings stay in chat unless the user asks to persist them/);
});

test("code-review WIP includes staged, unstaged, and untracked work", () => {
  const source = readFileSync(join(root, "skills/code-review/SKILL.md"), "utf8");
  const review = readFileSync(join(root, "skills/review/SKILL.md"), "utf8");
  assert.match(source, /git diff --cached/);
  assert.match(source, /git ls-files --others --exclude-standard/);
  assert.match(source, /never includes the working tree/);
  assert.match(source, /An empty committed range is not an empty review/);
  assert.match(review, /staged, unstaged, and untracked/);
});

test("durable knowledge writes go through reflect or existing decision records", () => {
  const domain = readFileSync(join(root, "skills/domain-modeling/SKILL.md"), "utf8");
  const toSpec = readFileSync(join(root, "skills/to-spec/SKILL.md"), "utf8");
  const init = readFileSync(join(root, "skills/methodrail-init/SKILL.md"), "utf8");
  const optional = readFileSync(
    join(root, "skills/methodrail-init/references/optional-artifacts.md"),
    "utf8",
  );
  const lifecycle = readFileSync(join(root, "references/knowledge/lifecycle.md"), "utf8");
  assert.match(domain, /Do not create a new untyped file under `\.methodrail\/knowledge\/`/);
  assert.match(toSpec, /Do not write `\.methodrail\/knowledge\/`/);
  assert.doesNotMatch(toSpec, /`docs\/`, `specs\/`, `\.scratch\/`, or `\.methodrail\/knowledge\/`/);
  assert.match(init, /Do not create files under `\.methodrail\/knowledge\/` during init/);
  assert.match(optional, /Do not create files under `\.methodrail\/knowledge\/` during init/);
  assert.doesNotMatch(optional, /Create those only when useful/);
  assert.match(lifecycle, /New untyped writes are not/);
});

test("blast-radius stays read-only under review and investigate", () => {
  const blast = readFileSync(join(root, "skills/blast-radius/SKILL.md"), "utf8");
  const review = readFileSync(join(root, "skills/review/SKILL.md"), "utf8");
  const investigate = readFileSync(join(root, "skills/investigate/SKILL.md"), "utf8");
  assert.match(blast, /\*\*Read-only parent\*\*/);
  assert.match(blast, /temp file outside the repository/);
  assert.match(blast, /Do not add tests, scripts, or product files/);
  assert.doesNotMatch(blast, /Prove the one fact\. Write a script or test that runs the real code/);
  assert.match(review, /Keep it read-only: existing checks or temp probes/);
  assert.match(investigate, /`blast-radius` uses existing checks or temp probes/);
});

test("performance does not send every function hop to architect", () => {
  const performance = readFileSync(join(root, "skills/performance/SKILL.md"), "utf8");
  const architect = readFileSync(join(root, "skills/architect/SKILL.md"), "utf8");
  assert.match(performance, /Crossing a function is not enough/);
  assert.doesNotMatch(performance, /If it crosses a function boundary, `architect` first/);
  assert.match(architect, /Crossing a function boundary is not by itself a reason/);
});

test("init and create-verification-skill do not repair product code", () => {
  const init = readFileSync(join(root, "skills/methodrail-init/SKILL.md"), "utf8");
  const create = readFileSync(join(root, "skills/create-verification-skill/SKILL.md"), "utf8");
  assert.match(init, /Do not repair product code during init/);
  assert.match(create, /Do not repair product code from this skill/);
  assert.doesNotMatch(create, /fix that first \(or report it precisely\)/);
});

test("why and research have a cheap path for narrow questions", () => {
  const why = readFileSync(join(root, "skills/why/SKILL.md"), "utf8");
  const research = readFileSync(join(root, "skills/research/SKILL.md"), "utf8");
  assert.match(why, /## Cheap path/);
  assert.match(why, /Fan out the remaining categories only when that search is insufficient/);
  assert.match(research, /If the question is narrow and one primary source is obvious/);
  assert.match(research, /spin one up only when several sources compete/);
});

test("handoff is a travel document, not durable project knowledge", () => {
  const handoff = readFileSync(join(root, "skills/handoff/SKILL.md"), "utf8");
  const context = readFileSync(join(root, "references/context-management.md"), "utf8");
  assert.match(handoff, /travel document for the next agent, not durable project knowledge/);
  assert.match(context, /not a durable project record/);
  assert.doesNotMatch(context, /Use explicit durable state when work moves/);
});
