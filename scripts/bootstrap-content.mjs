import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function write(rel, contents) {
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents);
  console.log("wrote", rel);
}

function skillYaml(cfg) {
  return `id: ${cfg.id}
version: 0.1.0
summary: ${cfg.summary}
kind: ${cfg.kind}
capabilities:
  provides:
${cfg.provides.map((x) => `    - ${x}`).join("\n")}
invocation:
  modes:
${cfg.modes.map((x) => `    - ${x}`).join("\n")}
rigor:
  minimum: ${cfg.rigor}
knowledge:
  reads:
${(cfg.reads ?? ["source"]).map((x) => `    - ${x}`).join("\n")}
  produces:
${(cfg.produces ?? ["evidence"]).map((x) => `    - ${x}`).join("\n")}
side_effects:
  filesystem: ${cfg.fs ?? "read"}
  git: ${cfg.git ?? "read"}
  runtime: ${cfg.runtime ?? "none"}
  network: ${cfg.network ?? "none"}
parallelism:
  strategy: ${cfg.parallel ?? "none"}
  max_workers: ${cfg.workers ?? 1}
principles:
${cfg.principles.map((x) => `  - ${x}`).join("\n")}
completion:
  requires:
${cfg.completion.map((x) => `    - ${x}`).join("\n")}
cost:
  tokens: ${cfg.tokens ?? "medium"}
  latency: ${cfg.latency ?? "medium"}
`;
}

function skillMd(cfg) {
  return `---
name: ${cfg.id}
description: ${cfg.description}
---

# ${cfg.title}

## Problem

${cfg.problem}

## Observed failure

${cfg.failure}

## When to activate

${cfg.when}

## When not to activate

${cfg.whenNot}

## Required context

${cfg.context}

## Method

${cfg.method}

## Permitted evidence

${cfg.evidence}

## Side effects

${cfg.side}

## Completion

${cfg.done}

## Artifacts

${cfg.artifacts}

## What survives

${cfg.survives}

## Evaluation

${cfg.eval}
`;
}

const HEADINGS_NOTE = "Keep claims tied to evidence. Unknown is a valid answer.";

const skills = [
  {
    id: "how",
    title: "How",
    summary: "Understand how a current system or subsystem works.",
    description: "Map current implementation: entrypoints, control flow, data flow, and boundaries. Use before changing nontrivial existing code or when asked how something works.",
    kind: "investigation",
    provides: ["codebase-understanding", "control-flow-tracing", "data-flow-tracing"],
    modes: ["implicit", "explicit"],
    rigor: 1,
    reads: ["source", "domain-vocabulary", "architecture-decisions"],
    produces: ["subsystem-model", "evidence", "unknowns"],
    parallel: "partition",
    workers: 4,
    principles: ["explore-before-change", "environment-is-source", "explicit-unknowns"],
    completion: ["relevant-entrypoints-identified", "important-flow-explained", "claims-linked-to-evidence"],
    problem: "Agents propose changes, architecture, or 'obvious' fixes without knowing how the live implementation actually behaves. Filename folklore replaces traced flow.",
    failure: "The agent summarizes the repository from layout, infers architecture from folder names, and then edits the wrong module. Or it dumps a giant repo tour nobody asked for.",
    when: "Activate when the question is about current structure or behavior of existing code, or before a nontrivial change to an existing subsystem. Typical prompts: 'How does X work?', 'Where is Y handled?', 'What happens when Z is submitted?'",
    whenNot: "Do not activate for mechanical edits, greenfield files with no existing behavior, or questions that are purely historical (use why), purely runtime (use observe), or purely empirical (use prototype).",
    context: "The user question, repository revision, and any already-validated project knowledge that is still fresh. Do not load unrelated subsystems.",
    method: `1. Start from the user's question, not from repository layout.
2. Identify relevant entrypoints (HTTP handlers, CLI commands, jobs, exported APIs, UI actions).
3. Follow callers and callees. Trace control flow and data flow.
4. Inspect types and important state transitions. Distinguish authoritative state from derived or cached state.
5. Name boundaries and side effects (IO, network, persistence, auth).
6. For complex questions, partition exploration into non-overlapping slices and synthesize.
7. Cite evidence. Record unknowns explicitly.

Do not infer architecture from filenames alone.
Do not produce giant repository summaries unless specifically requested.

Preferred output:
- question
- short answer
- entrypoints
- flow
- state
- boundaries
- side effects
- important invariants
- unknowns
- evidence`,
    evidence: "Source code, types, tests as characterization of intended structure, generated schemas, configuration. Runtime evidence is out of scope unless you escalate to observe.",
    side: "Filesystem read, git read. No runtime mutation. No network writes. No production code changes.",
    done: "The question has a direct answer or an explicit unresolved status. Important claims are linked to evidence. Inference is labeled. Unknowns are listed.",
    artifacts: "A result packet plus, when useful, a subsystem model suitable as a knowledge candidate — not a dump of the tree.",
    survives: "Entrypoints, traced flows, invariants, and unknowns. Discard file lists, dead ends, and speculative architecture.",
    eval: "Routing: how-questions activate this skill. Negative: mechanical rename does not. Behavioral: answers cite entrypoints and evidence. Pressure: refuses to invent architecture from folder names.",
  },
  {
    id: "observe",
    title: "Observe",
    summary: "Determine what the running system actually does.",
    description: "Establish a baseline, exercise a real user/client path, and record runtime evidence. Use when behavior is in question and observation is reasonably cheap.",
    kind: "observation",
    provides: ["runtime-observation", "reproduction"],
    modes: ["explicit", "workflow-only"],
    rigor: 2,
    runtime: "observe",
    principles: ["observe-dont-assume", "evidence-before-claims", "environment-is-source"],
    completion: ["baseline-established", "path-exercised-or-blocked", "confidence-labeled"],
    produces: ["observation", "evidence", "reproduction"],
    problem: "Source can establish implementation. It cannot automatically establish runtime behavior. Agents still say 'users see X' after reading a handler.",
    failure: "The agent reads a route handler, narrates the UX, and never starts the app. Or it calls a guess 'observed'.",
    when: "Activate when the question is what actually happens, when a bug is behavioral, when verification needs a running system, or when source inference is insufficient.",
    whenNot: "Do not activate when the question is purely structural, when starting the system is disproportionately expensive relative to risk, or when a deterministic test already answers the claim at the required confidence.",
    context: "How to start the system (prefer project control adapter or existing scripts), the path to exercise, expected vs unknown behavior, and revision.",
    method: `1. Establish a controlled baseline (revision, config, data).
2. Determine how the relevant system starts. Prefer existing project commands. Interview the repo before asking a human.
3. Verify readiness (doctor/health).
4. Exercise the actual user/client-facing path when feasible.
5. Inspect resulting state. Collect artifacts.
6. Compare observation against source inference.
7. Record reproduction details.
8. Label confidence correctly:

- inferred — not executed
- test-confirmed — tests ran
- observed — the system was executed
- traced — runtime trace/instrumentation
- historically-confirmed — historical evidence, not current runtime
- unknown — not established

Never call something observed unless it was executed.`,
    evidence: "Runtime logs, UI/API responses, traces, screenshots, DB state after exercise, health checks. Source is supporting context, not a substitute.",
    side: "May start local processes. Must not mutate production. Prefer isolated data. Reset when the adapter provides it.",
    done: "Either the path was exercised and artifacts exist, or blockage is explicit (cannot start, cannot reach path) with what was tried.",
    artifacts: "An observation record: question, baseline, exercise, result, confidence, reproduction, artifact locations.",
    survives: "Reproduction steps, observed outcomes, confidence labels. Discard raw logs unless they encode a durable contract.",
    eval: "Positive routing for 'what do users see' and runtime symptoms. Negative: pure how-questions can stay on how. Pressure: refuse to relabel inference as observation.",
  },
];

// Remaining skills added below in the same array via push for file size control.
skills.push(
  {
    id: "why",
    title: "Why",
    summary: "Investigate historical motivation without inventing intent.",
    description: "Separate what the system does now from why evidence suggests it was designed that way. Use git history, ADRs, issues, and docs — never current code alone.",
    kind: "investigation",
    provides: ["historical-rationale"],
    modes: ["explicit", "workflow-only"],
    rigor: 1,
    reads: ["git-history", "adrs", "issues", "design-docs"],
    produces: ["rationale", "unknowns", "evidence"],
    principles: ["environment-is-source", "explicit-unknowns"],
    completion: ["current-behavior-separated", "historical-evidence-cited-or-unknown"],
    problem: "Agents invent origin stories from the current implementation: 'this was written this way because...'",
    failure: "A confident narrative of intent with no commit, ADR, issue, or interview behind it.",
    when: "Activate for 'why is it like this', 'why was X introduced', design archaeology, or when a change needs historical constraint.",
    whenNot: "Do not activate for 'how does this work now' (how) or 'what happens at runtime' (observe). Do not use why as a substitute for reading current code.",
    context: "The artifact or decision under question, revision range if known, and available historical sources.",
    method: `1. State current behavior separately (from how/observe, not from myth).
2. Search version history, commit messages, ADRs, design docs, issues, PRs, comments, incident reports.
3. Quote or cite the evidence that actually exists.
4. If evidence is thin, say so. Offer plausible hypotheses only as hypotheses.
5. Never infer intent from current implementation alone.

Output:
- what currently happens
- why evidence suggests it was designed that way
- gaps`,
    evidence: "git log/blame, ADRs, PRs, issues, comments, incident reports, design docs.",
    side: "Read-only git and documents.",
    done: "Current vs historical are separated. Claims have citations or are marked unknown.",
    artifacts: "A rationale note, possibly a knowledge candidate if the motivation is expensive to rediscover.",
    survives: "Cited rationale and rejected myths. Discard commit tours that do not answer the question.",
    eval: "Positive: 'Why was Redis introduced?'. Negative: 'How does the cache work?' should prefer how. Pressure: refuse invented intent.",
  },
  {
    id: "domain-modeling",
    title: "Domain modeling",
    summary: "Create precise language and capture domain invariants.",
    description: "Define concepts, ownership, states, transitions, and rejected synonyms. Use when product language is ambiguous or a consequential domain decision is pending.",
    kind: "modeling",
    provides: ["domain-language", "invariants"],
    modes: ["explicit", "workflow-only"],
    rigor: 2,
    reads: ["source", "product-language", "stakeholders"],
    produces: ["domain-concept", "invariant", "decision-candidate"],
    principles: ["explicit-unknowns", "one-canonical-owner"],
    completion: ["terms-defined", "invariants-stated", "synonyms-rejected"],
    tokens: "medium",
    problem: "Overloaded words ('customer', 'account', 'organization') cause agents to implement the wrong ownership model.",
    failure: "The agent treats marketing language as the data model, or writes a running requirements novel instead of a compact vocabulary.",
    when: "Activate when a term is ambiguous, ownership is unclear, states/transitions matter, or a hard-to-reverse domain decision is approaching.",
    whenNot: "Do not activate to restyle code, to duplicate the issue tracker, or when the environment already has a crisp, validated vocabulary.",
    context: "The contested terms, current implementation of those terms, and who can adjudicate preference.",
    method: `Distinguish:
- concepts
- definitions
- ownership
- states
- transitions
- invariants
- synonyms
- rejected synonyms

Keep the vocabulary concise. Do not turn the domain model into a running requirements document.
Consequential, hard-to-reverse decisions may become ADR candidates.
Ask humans only for preference/intent the environment cannot resolve.`,
    evidence: "Code that implements the terms, existing docs, stakeholder decisions labeled as human-decision evidence.",
    side: "May write project-local knowledge candidates. No silent production schema changes.",
    done: "Each contested term has a definition, ownership, and rejected synonyms. Unknowns are explicit.",
    artifacts: "Domain concept records; optional ADR candidate; decision-map nodes.",
    survives: "Definitions, invariants, rejected synonyms. Discard meeting recap prose.",
    eval: "Positive: 'what does customer mean?'. Negative: rename a symbol. Pressure: do not ask the human questions git can answer.",
  },
  {
    id: "prototype",
    title: "Prototype",
    summary: "Answer an empirical question with a disposable experiment.",
    description: "Run a minimal experiment to accept or reject a hypothesis. Prototypes are not production implementations and must not land silently.",
    kind: "experiment",
    provides: ["empirical-evidence"],
    modes: ["explicit", "workflow-only"],
    rigor: 2,
    runtime: "mutate",
    fs: "write",
    principles: ["observe-dont-assume", "evidence-before-claims"],
    completion: ["question-stated", "experiment-run", "verdict-with-limitations"],
    produces: ["observation", "evidence", "verdict"],
    tokens: "high",
    latency: "high",
    problem: "Agents debate feasibility in prose, then either overbuild or ship a guess.",
    failure: "A 'prototype' that becomes production, or a conclusion with no executable experiment.",
    when: "Activate for 'would X work?', performance questions, API shape trials, or any empirical uncertainty cheaper to test than to argue.",
    whenNot: "Do not activate for questions answerable from source, git, or an existing test. Do not prototype trivial local edits. Do not auto-activate; this is expensive.",
    context: "The empirical question, constraints, and a sandbox where leftover code will not ship.",
    method: `Every prototype defines:
- question
- hypothesis
- minimal experiment
- success/failure observation
- result
- verdict
- limitations
- evidence location

Prototype conclusions may become durable knowledge.
Prototype implementation itself must not silently become production code.`,
    evidence: "Benchmark output, experiment logs, failing/passing probes, traces.",
    side: "May create throwaway files and run local processes. Must isolate from production paths.",
    done: "A verdict against the hypothesis with limitations, or an explicit blockage.",
    artifacts: "Experiment notes and result artifacts. Not a PR of the prototype unless explicitly requested.",
    survives: "The verdict and limitations. Discard the scaffolding unless promoted deliberately.",
    eval: "Positive: 'would an in-memory queue survive 10k/s?'. Negative: mechanical rename. Pressure: do not ship the prototype.",
  },
  {
    id: "architect",
    title: "Architect",
    summary: "Compare architectural shapes for a consequential design decision.",
    description: "Use only when a design choice is consequential. Ground in current implementation, domain, and constraints; compare options on ownership, reversibility, and operational cost.",
    kind: "architecture",
    provides: ["design-comparison"],
    modes: ["explicit", "workflow-only"],
    rigor: 3,
    principles: ["explore-before-change", "build-the-lever"],
    completion: ["options-compared", "reversibility-assessed", "recommendation-or-unknown"],
    produces: ["decision-candidate", "risks"],
    tokens: "high",
    latency: "high",
    problem: "Agents invent a new architecture for a local change, or pick a shape with no comparison.",
    failure: "A rewrite proposal for a rename. Or a single 'best practice' architecture with no alternatives.",
    when: "Activate when multiple plausible designs exist and the decision is hard to reverse: ownership boundaries, billing, permissions, migrations, new subsystems.",
    whenNot: "Do not activate for trivial local changes, rigor 0–1 work, or when the existing shape is adequate and the change fits it.",
    context: "Current implementation (how), domain terms, constraints, and relevant evidence. Do not architect in a vacuum.",
    method: `Require prior grounding in existing implementation, domain, constraints, and evidence.

When multiple designs exist, compare:
- ownership boundaries
- reversibility
- operational complexity
- migration cost
- observability and testability
- risks

Recommend, or record that the human must choose.`,
    evidence: "Current code, ADRs, operational constraints, prototypes if empirical.",
    side: "Read-only unless producing an ADR candidate. No drive-by refactors.",
    done: "Options are compared on the axes above. A recommendation is evidence-backed or explicitly deferred.",
    artifacts: "A comparison note; optional ADR candidate.",
    survives: "The comparison and chosen constraints. Discard aesthetic lectures.",
    eval: "Positive: organization-level billing. Negative: mechanical rename must exclude this skill.",
  },
  {
    id: "systematic-debugging",
    title: "Systematic debugging",
    summary: "Prevent symptom-to-fix guessing.",
    description: "Reproduce, collect evidence, trace a mechanism, falsify hypotheses, then apply a minimal fix. Use for failures, flakes, and performance symptoms.",
    kind: "debugging",
    provides: ["root-cause-analysis"],
    modes: ["implicit", "explicit"],
    rigor: 2,
    runtime: "observe",
    principles: ["observe-dont-assume", "evidence-before-claims", "explore-before-change"],
    completion: ["reproduced-or-blocked", "hypotheses-falsified", "root-cause-or-unknown"],
    produces: ["known-failure", "evidence"],
    problem: "Agents jump from a stack trace to a speculative patch, then thrash until something goes green.",
    failure: "'Just change something until the failing test passes.' Broad edits with no mechanism.",
    when: "Activate on bugs, crashes, flakes, regressions, performance symptoms, or 'it doesn't work'.",
    whenNot: "Do not activate for requested features without a failure, or for pure investigation questions.",
    context: "Symptom, reproduction hints, recent changes, and how to run the relevant tests or process.",
    method: `reproduce → collect evidence → trace mechanism → form explicit hypotheses → falsify cheaply → identify root cause → select verification strategy → minimal fix → verify

If source-level investigation is insufficient, escalate to instrumentation, tracing, profiling, runtime observation, or a controlled experiment.

Never jump from symptom to speculative fix.`,
    evidence: "Failing tests, logs, traces, profiles, bisect, observations.",
    side: "May run tests and local processes. Production mutation forbidden. Fix is a later step owned by the debug workflow.",
    done: "Root cause is named with evidence, or remaining hypotheses and blockers are explicit.",
    artifacts: "Hypothesis log, evidence, and a proposed minimal fix described — not necessarily applied by this skill alone.",
    survives: "Root cause, reproduction, and the verification strategy. Discard discarded hypotheses except as known-failures if they will recur as traps.",
    eval: "Positive: CPU after idle. Negative: 'how does auth work'. Pressure: refuse shotgun edits.",
  },
  {
    id: "verify-change",
    title: "Verify change",
    summary: "Block unsupported completion claims.",
    description: "Identify the claim, obtain fresh evidence, and distinguish passing verification from merely executed commands. Required before calling work done.",
    kind: "verification",
    provides: ["verification"],
    modes: ["implicit", "explicit", "workflow-only"],
    rigor: 0,
    runtime: "observe",
    principles: ["evidence-before-claims"],
    completion: ["claim-stated", "fresh-evidence-obtained", "pass-vs-executed-distinguished"],
    produces: ["evidence"],
    problem: "Agents say 'fixed', 'passing', 'complete' after reasoning, or after running the wrong check.",
    failure: "'We're late, don't run tests.' Completion claimed from inference.",
    when: "Activate before any completion claim on a change, and whenever the user asks to skip verification.",
    whenNot: "Do not treat this as an investigation skill. Do not invent a test pyramid essay instead of running the relevant check.",
    context: "The claim being made, the change, and available verification strategies.",
    method: `Before saying work is complete:
1. Identify the claim.
2. Identify evidence required to support that claim.
3. Obtain fresh evidence.
4. Inspect the result.
5. Distinguish passed verification from merely executed verification.

Strategies include TDD/regression tests, characterization tests, integration and end-to-end scenarios, static analysis, compilation/typechecking, benchmarks, visual baselines, runtime observation, migration dry runs, invariant/property tests.

TDD is the preferred default for normal behavior-changing production code, but not a universal law.
The universal law: every meaningful change requires a falsifiable verification strategy.`,
    evidence: "Test output, typechecker, static analysis, observation artifacts — matched to the claim.",
    side: "May run tests and linters. Must not claim success on skipped checks.",
    done: "Each completion claim has fresh evidence, or completion is refused.",
    artifacts: "Evidence objects linked to claims.",
    survives: "What was verified, at which revision. Discard passing log spam.",
    eval: "Pressure: refuse unsupported completion. Completion eval: missing evidence blocks complete status.",
  },
  {
    id: "blast-radius",
    title: "Blast radius",
    summary: "Understand what else a proposed or completed change may affect.",
    description: "Inspect callers, contracts, data, tests, and runtime assumptions. Use before or after cross-boundary changes.",
    kind: "investigation",
    provides: ["impact-analysis"],
    modes: ["explicit", "workflow-only"],
    rigor: 2,
    principles: ["explore-before-change", "evidence-before-claims"],
    completion: ["consumers-identified", "contracts-checked", "unknowns-listed"],
    produces: ["impact", "unknowns"],
    problem: "A 'local' change breaks a consumer, a schema, or a deploy assumption nobody traced.",
    failure: "The agent edits a function and ignores callers, persisted data, or public contracts.",
    when: "Activate for cross-boundary work, public APIs, schemas, migrations, or when asked what a change could affect.",
    whenNot: "Do not activate for purely local mechanical edits with no shared contract.",
    context: "The proposed or completed diff, public surfaces, and test map.",
    method: `Inspect:
- callers
- downstream consumers
- persisted data
- schemas/contracts
- APIs
- tests
- integration boundaries
- deployment/runtime assumptions
- feature dependencies

Use static and behavioral evidence where appropriate.`,
    evidence: "Call graphs, tests, schema diffs, docs of contracts, runtime if behavior is in question.",
    side: "Read-only unless combined with observe.",
    done: "Likely impacts and unknowns are listed. Silent 'nothing else is affected' is forbidden without evidence.",
    artifacts: "An impact note.",
    survives: "Non-obvious consumers and contract risks.",
    eval: "Positive: 'what could this affect?'. Negative: comment-only change.",
  },
  {
    id: "review",
    title: "Review",
    summary: "Perform bounded implementation review against a prepared packet.",
    description: "Review specification fit, correctness, architecture, tests, complexity, and blast radius. Use a prepared ReviewPacket so reviewers do not rediscover deterministic context.",
    kind: "review",
    provides: ["implementation-review"],
    modes: ["explicit", "workflow-only"],
    rigor: 2,
    principles: ["evidence-before-claims", "structural-enforcement"],
    completion: ["axes-covered", "findings-severitized", "convergence-applied"],
    produces: ["review-findings"],
    problem: "Open-ended review loops, or reviewers spending tokens rediscovering the diff and test commands.",
    failure: "Endless churn on nits, or a 'LGTM' with no evidence.",
    when: "Activate when asked to review a change, or as a develop/refactor workflow gate at sufficient rigor.",
    whenNot: "Do not activate instead of verification. Do not interrogate by default (use interrogate for high-risk independent review).",
    context: "A ReviewPacket: task, spec slice, acceptance, base/head revisions, diff references, implementation summary, verification evidence, known deviations, risk, rubric.",
    method: `Axes:
- specification/acceptance compliance
- correctness
- architecture
- maintainability
- tests/evidence
- unnecessary complexity
- regressions/blast radius

Severity:
- critical → must fix
- important → must fix or explicitly adjudicate
- minor → record, does not automatically block

Repeated disagreement escalates to arbitration rather than looping forever.`,
    evidence: "The packet, the diff, verification evidence. Do not re-run deterministic context assembly if the controller already did.",
    side: "Read-only regarding product code unless applying agreed fixes under the parent workflow.",
    done: "Findings are classified. Blocking items are explicit. Minors do not block by default.",
    artifacts: "Review findings attached to the packet.",
    survives: "Adjudicated decisions and blocking issues. Discard style bikesheds.",
    eval: "Positive: 'review this payment change'. Negative: 'how does auth work'.",
  },
  {
    id: "interrogate",
    title: "Interrogate",
    summary: "High-rigor adversarial review when cost and risk justify it.",
    description: "Independent analysis against a shared rubric. Use disagreement as signal. Explicit or high-risk activation only.",
    kind: "review",
    provides: ["adversarial-review"],
    modes: ["explicit"],
    rigor: 4,
    tokens: "high",
    latency: "high",
    principles: ["evidence-before-claims", "explicit-unknowns"],
    completion: ["independent-analysis", "disagreements-listed", "synthesis"],
    produces: ["review-findings"],
    problem: "High-risk changes get a friendly self-review from the same context that wrote the code.",
    failure: "Invented personas for fake diversity, or interrogate on a rename.",
    when: "Activate only when explicitly requested or when rigor/risk is high (billing, permissions, irreversible migrations) and independent review is available.",
    whenNot: "Do not auto-activate. Do not use for mechanical or bounded local work.",
    context: "The same ReviewPacket for every reviewer. No hidden extra story.",
    method: `If multiple models/agents are available:
- provide the same core rubric
- seek independent analysis
- use disagreement as signal
- do not invent artificial personas merely to force diversity
- synthesize evidence and disagreements

Use only when cost/risk justifies it.`,
    evidence: "Packet, diff, verification, independent writeups.",
    side: "Read-only.",
    done: "Independent findings exist; disagreements are synthesized; residual risk is explicit.",
    artifacts: "Adversarial review synthesis.",
    survives: "Disagreements that reveal real risk. Discard theatrical dissent.",
    eval: "Positive: high-risk payment review may recommend this. Negative: mechanical rename forbids it.",
  },
  {
    id: "create-control-adapter",
    title: "Create control adapter",
    summary: "Build a project-local interface so generic skills can operate the real system.",
    description: "Interview the repository, wrap existing commands, and generate .ai/control with start, doctor, drive, inspect, capture, reset, stop.",
    kind: "adapter",
    provides: ["control-adapter"],
    modes: ["explicit"],
    rigor: 1,
    fs: "write",
    principles: ["environment-is-source", "build-the-lever"],
    completion: ["commands-mapped", "existing-scripts-preferred", "control-md-written"],
    produces: ["control-adapter"],
    problem: "Generic skills cannot start, drive, or reset the app without inventing commands each session.",
    failure: "Asking the human how to start when package.json already says. Or adding Docker when `npm test` was enough.",
    when: "Activate when a project has no control adapter, or when observation/verification cannot find a launch path.",
    whenNot: "Do not activate on every task. Do not replace a working adapter. Prefer maintain-control-adapter for drift.",
    context: "Repo scripts, README, compose files, test commands, app kind (web, CLI, API, library, desktop, service, monorepo).",
    method: `Target abstraction:
- control.start()
- control.doctor()
- control.drive()
- control.inspect()
- control.capture()
- control.reset()
- control.stop()

Generated structure:
.ai/control/CONTROL.md, start, doctor, reset, stop, scenarios/

Interview the repository before asking the human.
Prefer existing project commands over introducing new infrastructure.`,
    evidence: "package.json scripts, Makefiles, README, Procfiles, existing CI.",
    side: "Writes project-local .ai/control. Must not overwrite destructively without confirmation.",
    done: "CONTROL.md maps each verb to a real command; doctor has a readiness check; scenarios are listed or explicitly absent.",
    artifacts: "The control adapter files.",
    survives: "The adapter. Discard the interview notes except operational knowledge that is expensive to rediscover.",
    eval: "Pressure: 'ask me how the app starts' must inspect the environment first.",
  },
  {
    id: "maintain-control-adapter",
    title: "Maintain control adapter",
    summary: "Detect and repair drift in project-local control infrastructure.",
    description: "Check launch, readiness, scenarios, reset, artifacts, and paths. Distinguish adapter drift from product regression.",
    kind: "adapter",
    provides: ["control-adapter-maintenance"],
    modes: ["explicit", "workflow-only"],
    rigor: 1,
    fs: "write",
    principles: ["environment-is-source", "evidence-before-claims"],
    completion: ["drift-classified", "adapter-or-product-named"],
    produces: ["control-adapter"],
    problem: "Start commands rot. Skills then fail or the agent asks humans again.",
    failure: "Treating a product bug as 'docs drift', or rewriting the adapter when the app actually broke.",
    when: "Activate when doctor fails, scripts moved, or after large tooling changes.",
    whenNot: "Do not activate to debug product logic (use systematic-debugging). Do not create a second adapter.",
    context: "Existing .ai/control, current scripts, and a recent successful baseline if any.",
    method: `Check:
- launch command
- readiness checks
- feature/scenario map
- reset behavior
- screenshots/traces/artifacts
- source paths
- runtime assumptions

Distinguish adapter/documentation drift from real product regression.`,
    evidence: "Command output, git diff on scripts, CI config.",
    side: "May update adapter files. Product fixes go through debug/develop workflows.",
    done: "Drift is classified and either the adapter is repaired or a product defect is handed off with evidence.",
    artifacts: "Updated CONTROL.md/scripts or a bug report packet.",
    survives: "Corrected commands and the classification of the failure.",
    eval: "Behavioral: doctor failure against a moved script updates the adapter rather than inventing new infra.",
  },
);

for (const s of skills) {
  write(`skills/${s.id}/skill.yaml`, skillYaml(s));
  write(`skills/${s.id}/SKILL.md`, skillMd(s));
  write(
    `skills/${s.id}/evals/routing.yaml`,
    `id: skill.${s.id}.routing-positive
kind: routing
skill: ${s.id}
description: Positive routing signal for ${s.id}.
input:
  prompt: ${JSON.stringify(s.description.slice(0, 120))}
expected:
  skills:
    required: [${s.id === "systematic-debugging" ? "systematic-debugging" : s.id}]
`,
  );
  write(
    `skills/${s.id}/evals/routing-negative.yaml`,
    `id: skill.${s.id}.routing-negative
kind: routing
skill: ${s.id}
description: Mechanical rename must not require ${s.id} unless it is verify-change.
input:
  prompt: "Rename getUserById to findUserById. Formatting only."
expected:
  rigor:
    equals: 0
  skills:
    forbidden: ${s.id === "verify-change" ? "[]" : `[${s.id === "systematic-debugging" ? "architect" : s.id === "how" ? "architect, prototype, interrogate" : s.id}]`}
`,
  );
}

console.log("skills written", skills.length);
