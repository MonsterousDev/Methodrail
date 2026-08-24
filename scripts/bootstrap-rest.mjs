#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const write = (rel, contents) => {
  const full = join(root, rel);
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, contents);
};

write(
  "rigor/levels.yaml",
  `levels:
  - level: 0
    id: mechanical
    summary: Mechanical edits with no behavior intent.
    examples: [rename, formatting, obvious config update]
    requirements: [deterministic-validation]
    typical_skills: [verify-change]
    forbidden_by_default: [architect, prototype, interrogate]
  - level: 1
    id: bounded
    summary: Small local bug or change.
    examples: [localized bugfix, single-function behavior change]
    requirements: [local-understanding, appropriate-check]
    typical_skills: [how, verify-change]
  - level: 2
    id: standard
    summary: Normal feature or change.
    examples: [standard feature, local API change]
    requirements: [current-behavior-understanding, acceptance-criteria, plan, verification]
    typical_skills: [how, verify-change, review]
  - level: 3
    id: cross-boundary
    summary: Touches multiple modules or important abstractions.
    examples: [shared abstraction change, multi-package edit]
    requirements: [explicit-how, domain-or-architecture-assessment, stronger-review, runtime-observation-when-applicable]
    typical_skills: [how, blast-radius, review, observe]
  - level: 4
    id: high-risk
    summary: Billing, permissions, security, migrations, concurrency, major architecture.
    examples: [billing, permissions, security-sensitive logic, migrations, concurrency]
    requirements: [explicit-evidence, prototype-if-empirical, architectural-analysis, independent-review, strong-verification, blast-radius]
    typical_skills: [how, domain-modeling, architect, prototype, review, interrogate, blast-radius, verify-change]
  - level: 5
    id: critical
    summary: Irreversible or critical operations requiring strongest evidence and human approval.
    examples: [destructive migration, production cutover, public exploit response]
    requirements: [strongest-available-evidence, explicit-human-approval]
    typical_skills: [how, observe, architect, interrogate, verify-change, blast-radius]
`,
);

const workflow = (id, extra) => `id: ${id}
version: 0.1.0
${extra}`;

write(
  "workflows/investigate.yaml",
  workflow(
    "investigate",
    `summary: Answer a question about an existing system without prematurely changing it.
kind: investigation
entry: classify-question
rigor:
  minimum: 1
  default: 2
constraints:
  allow_code_modification: false
  require_evidence: true
question_routing:
  - question: how
    skills: [how]
  - question: observe
    skills: [observe]
  - question: why
    skills: [why]
  - question: prototype
    skills: [prototype]
  - question: blast-radius
    skills: [blast-radius]
  - question: domain
    skills: [domain-modeling]
principles:
  - explore-before-change
  - observe-dont-assume
  - explicit-unknowns
  - environment-is-source
completion:
  requires:
    - direct-answer-or-unresolved
    - claims-linked-to-evidence
    - inference-separated-from-observation
    - unknowns-listed
    - no-unnecessary-modifications
states:
  classify-question:
    description: Classify the question and select acquisition methods.
    kind: classify
    on_complete: [retrieve-existing-knowledge]
  retrieve-existing-knowledge:
    description: Load project knowledge that is still fresh.
    kind: knowledge
    on_complete: [check-freshness]
  check-freshness:
    description: Drop or revalidate stale knowledge against the current revision.
    kind: knowledge
    on_complete: [select-acquisition]
  select-acquisition:
    description: Choose how, why, observe, prototype, or blast-radius from the question.
    kind: routing
    on_complete: [explore]
  explore:
    description: Acquire structural or historical understanding.
    kind: skill
    skills: [how, why, blast-radius, domain-modeling]
    selection: question-routing
    on_complete: [observe-if-needed]
  observe-if-needed:
    description: Observe runtime or prototype when the question is behavioral or empirical.
    kind: skill
    skills: [observe, prototype]
    selection: optional
    optional: true
    on_complete: [synthesize]
  synthesize:
    description: Combine evidence into a report that separates observation from inference.
    kind: synthesize
    on_complete: [identify-unknowns]
  identify-unknowns:
    description: Record unresolved questions without fabricating answers.
    kind: synthesize
    on_complete: [produce-report]
  produce-report:
    description: Emit an evidence-backed result packet.
    kind: synthesize
    on_complete: [propose-knowledge]
  propose-knowledge:
    description: Propose durable knowledge candidates; do not auto-promote.
    kind: knowledge
    terminal: true
`,
  ),
);

write(
  "workflows/develop.yaml",
  workflow(
    "develop",
    `summary: Turn sufficiently resolved intent into bounded implementation with evidence.
kind: development
entry: capture-task
rigor:
  minimum: 0
  default: 2
constraints:
  allow_code_modification: true
  require_evidence: true
principles:
  - explore-before-change
  - evidence-before-claims
  - context-is-budget
completion:
  requires:
    - observable-success-specified
    - verification-evidence
    - unsupported-completion-refused
states:
  capture-task:
    description: Capture intent, constraints, and apparent scope.
    kind: classify
    on_complete: [classify-risk]
  classify-risk:
    description: Assign rigor independently of task type.
    kind: classify
    on_complete: [understand-current]
  understand-current:
    description: Understand current implementation before nontrivial change.
    kind: skill
    skills: [how]
    optional: true
    on_complete: [identify-decision-gaps]
  identify-decision-gaps:
    description: Build a decision map of known territory, frontier, and fog.
    kind: decide
    on_complete: [resolve-frontier]
  resolve-frontier:
    description: Resolve currently resolvable frontier questions by cheapest reliable source.
    kind: decide
    on_complete: [specify-success]
    on_blocked: [resolve-frontier]
  specify-success:
    description: Specify observable success and a falsifiable verification strategy.
    kind: gate
    on_complete: [architecture-if-needed]
  architecture-if-needed:
    description: Compare architectural shapes when the decision is consequential.
    kind: skill
    skills: [architect, domain-modeling, prototype]
    optional: true
    selection: risk
    on_complete: [plan]
  plan:
    description: Turn resolved decisions into a bounded execution plan.
    kind: synthesize
    on_complete: [implement]
  implement:
    description: Execute the bounded plan without reopening fog questions casually.
    kind: execute
    on_complete: [observe]
  observe:
    description: Observe runtime behavior when the claim is behavioral.
    kind: skill
    skills: [observe]
    optional: true
    on_complete: [verify]
  verify:
    description: Obtain fresh evidence for the completion claim.
    kind: skill
    skills: [verify-change]
    on_complete: [blast-radius]
  blast-radius:
    description: Assess callers, contracts, data, and runtime assumptions.
    kind: skill
    skills: [blast-radius]
    optional: true
    on_complete: [review]
  review:
    description: Bounded review against a prepared review packet.
    kind: skill
    skills: [review]
    optional: true
    on_complete: [completion-gate]
  completion-gate:
    description: Refuse unsupported completion claims.
    kind: gate
    on_complete: [knowledge-candidates]
  knowledge-candidates:
    description: Propose promotion candidates; never auto-promote conversation claims.
    kind: knowledge
    terminal: true
`,
  ),
);

write(
  "workflows/debug.yaml",
  workflow(
    "debug",
    `summary: Reproduce, explain, and minimally fix a failure without symptom-to-patch guessing.
kind: debugging
entry: capture-symptom
rigor:
  minimum: 2
  default: 3
constraints:
  allow_code_modification: true
  require_evidence: true
principles:
  - observe-dont-assume
  - evidence-before-claims
  - explore-before-change
completion:
  requires:
    - reproduced-or-blocked
    - root-cause-or-explicit-unknown
    - verification-evidence
states:
  capture-symptom:
    description: Capture the symptom without proposing a fix.
    kind: classify
    on_complete: [reproduce]
  reproduce:
    description: Reproduce the failure or record why reproduction is blocked.
    kind: observe
    on_complete: [baseline]
  baseline:
    description: Record revision, environment, and failing observation.
    kind: observe
    on_complete: [understand]
  understand:
    description: Trace the relevant mechanism in source.
    kind: skill
    skills: [how]
    on_complete: [hypotheses]
  hypotheses:
    description: Form explicit, falsifiable hypotheses.
    kind: synthesize
    on_complete: [falsify]
  falsify:
    description: Cheaply eliminate hypotheses.
    kind: skill
    skills: [systematic-debugging]
    on_complete: [escalate-if-needed]
  escalate-if-needed:
    description: Escalate to instrumentation, tracing, or observation when source is insufficient.
    kind: skill
    skills: [observe, prototype]
    optional: true
    on_complete: [root-cause]
  root-cause:
    description: Name the root cause with evidence, or keep it unknown.
    kind: synthesize
    on_complete: [verification-strategy]
  verification-strategy:
    description: Choose a falsifiable check that would catch a regression of this failure.
    kind: gate
    on_complete: [minimal-fix]
  minimal-fix:
    description: Apply the smallest change that addresses the root cause.
    kind: execute
    on_complete: [observe-fix]
  observe-fix:
    description: Re-exercise the failing path.
    kind: skill
    skills: [observe]
    optional: true
    on_complete: [verify]
  verify:
    description: Obtain fresh verification evidence.
    kind: skill
    skills: [verify-change]
    on_complete: [blast-radius]
  blast-radius:
    description: Check whether the fix disturbs neighboring behavior.
    kind: skill
    skills: [blast-radius]
    optional: true
    on_complete: [complete]
  complete:
    description: Complete only with evidence; refuse unsupported claims.
    kind: gate
    terminal: true
`,
  ),
);

write(
  "workflows/refactor.yaml",
  workflow(
    "refactor",
    `summary: Improve internal structure without accidentally changing external behavior.
kind: refactor
entry: identify-friction
rigor:
  minimum: 1
  default: 2
constraints:
  allow_code_modification: true
  require_evidence: true
principles:
  - explore-before-change
  - evidence-before-claims
completion:
  requires:
    - behavioral-baseline
    - continuous-validation
    - no-unintended-behavior-change
states:
  identify-friction:
    description: Name the friction that makes the refactor worth doing.
    kind: classify
    on_complete: [baseline]
  baseline:
    description: Establish a behavioral baseline before changing structure.
    kind: verify
    on_complete: [understand-boundaries]
  understand-boundaries:
    description: Understand module boundaries and ownership.
    kind: skill
    skills: [how]
    on_complete: [value-check]
  value-check:
    description: Stop if the code is quiet, unused, or unrelated to current work.
    kind: gate
    on_complete: [characterization]
  characterization:
    description: Add characterization tests or equivalent verification if missing.
    kind: skill
    skills: [verify-change]
    on_complete: [incremental-change]
  incremental-change:
    description: Change structure incrementally with continuous validation.
    kind: execute
    on_complete: [validate]
  validate:
    description: Re-run the baseline after each increment.
    kind: skill
    skills: [verify-change]
    on_complete: [blast-radius]
  blast-radius:
    description: Check callers and contracts.
    kind: skill
    skills: [blast-radius]
    on_complete: [review]
  review:
    description: Bounded review for accidental behavior change and extra complexity.
    kind: skill
    skills: [review]
    optional: true
    terminal: true
`,
  ),
);

write(
  "workflows/review.yaml",
  workflow(
    "review",
    `summary: Review a prepared change using a ReviewPacket and a convergence policy.
kind: review
entry: assemble-packet
rigor:
  minimum: 2
  default: 3
constraints:
  allow_code_modification: false
  require_evidence: true
principles:
  - evidence-before-claims
  - context-is-budget
completion:
  requires:
    - packet-complete
    - axes-covered
    - blocking-findings-explicit
states:
  assemble-packet:
    description: Assemble deterministic review context so reviewers do not rediscover it.
    kind: classify
    on_complete: [check-verification]
  check-verification:
    description: Confirm verification evidence exists before reviewing implementation taste.
    kind: skill
    skills: [verify-change]
    optional: true
    on_complete: [bounded-review]
  bounded-review:
    description: Review against the rubric in the packet.
    kind: skill
    skills: [review]
    on_complete: [interrogate-if-needed]
  interrogate-if-needed:
    description: Independent adversarial review when risk and cost justify it.
    kind: skill
    skills: [interrogate]
    optional: true
    on_complete: [converge]
  converge:
    description: Apply critical/important/minor convergence; escalate deadlock.
    kind: gate
    terminal: true
`,
  ),
);

const principles = {
  "explore-before-change": [
    "Explore before change",
    "For nontrivial existing-system work, establish the current implementation and relevant behavior before proposing substantial changes.\n\nThis is not ceremony for a rename. It is the cost of not destroying an invariant you have not seen.",
  ],
  "observe-dont-assume": [
    "Observe, do not assume",
    "Source code can establish implementation. It cannot automatically establish runtime behavior.\n\nWhen behavior is observable at reasonable cost, observe it. Never label a claim `observed` unless the system was executed.",
  ],
  "evidence-before-claims": [
    "Evidence before claims",
    "Never label something as working, fixed, passing, complete, or verified without fresh evidence appropriate to that claim.\n\nExecuted is not passed. Inferred is not observed. Planned is not done.",
  ],
  "environment-is-source": [
    "Environment is the source of truth",
    "Do not duplicate information into persistent documentation when it is cheap and reliable to rediscover from source, manifests, CLI help, configuration, generated schemas, version control, or runtime inspection.\n\nPersist terminology, rationale, historical decisions, rejected alternatives, subtle invariants, expensive discoveries, operational knowledge, and observed behavioral contracts.",
  ],
  "context-is-budget": [
    "Context is a budget",
    "Treat model context as a consumable resource. Prefer indexes, pointers, structured packets, progressive disclosure, and isolated child contexts over enormous permanent prompts.\n\nContinue when accumulated context is still useful. Clear when durable artifacts already hold the state. Isolate bounded work. Handoff with explicit packets. Compact only as a lossy last resort.",
  ],
  "build-the-lever": [
    "Build the lever",
    "When a lesson recurs, promote it upward: conversation hint → knowledge → skill → deterministic script → test → lint → type/API constraint → CI gate → architecture that makes the failure impossible.\n\nRepeated prompting is the weakest form of enforcement.",
  ],
  "explicit-unknowns": [
    "Unknown is a legitimate answer",
    "Do not fabricate rationale, behavior, or certainty. Explicit uncertainty is preferable to invented confidence.\n\nClassify uncertainty and resolve it by type: human preference, domain ambiguity, current implementation, runtime, historical motivation, empirical questions, deterministic facts.",
  ],
  "structural-enforcement": [
    "Structural enforcement beats repeated prompting",
    "If agents keep making the same mistake, change the environment. Add types, tests, lints, scripts, and module boundaries. Do not add another paragraph to a prompt and hope.",
  ],
  "one-canonical-owner": [
    "One canonical owner per capability",
    "Do not create three competing implementations of the same conceptual capability without a deliberate reason. Skills must not secretly replace the global workflow. There is exactly one orchestration control plane.",
  ],
  "skills-are-not-workflows": [
    "Skills are not workflows",
    "A skill is a bounded reusable procedure. A workflow owns phase transitions. If a skill starts deciding when the task is finished, the architecture has leaked.",
  ],
  "resolve-uncertainty-by-type": [
    "Resolve uncertainty by type",
    "Do not spend model reasoning on facts that git, a parser, compiler, test runner, static analyzer, or shell command can answer exactly.\n\nDo not ask humans questions the environment can answer reliably.",
  ],
};

for (const [id, [title, body]] of Object.entries(principles)) {
  write(`principles/${id}.md`, `# ${title}\n\n${body}\n`);
}

write(
  "knowledge/README.md",
  `# Knowledge

Methodrail owns schemas, conventions, acquisition methods, and maintenance methods.

A consuming project owns authoritative knowledge, typically under \`.ai/knowledge/\`.

Do not use the knowledge base as a stale cache of easily inspectable repository state.

Promotion path:

\`\`\`text
observation → candidate knowledge → evidence validation → classification → promotion
\`\`\`

Statuses: \`candidate\` | \`validated\` | \`rejected\` | \`stale\` | \`superseded\`

Code-derived claims should name a repository revision or source fingerprint when practical.
`,
);

write(
  "knowledge/ontology.yaml",
  `concepts:
  - id: evidence
    definition: A locator plus metadata supporting a claim. Not the claim itself.
  - id: knowledge
    definition: Validated understanding worth persisting because it is expensive, ambiguous, historical, or impossible to rediscover cheaply.
  - id: decision
    definition: A resolved question on the decision map, with method and evidence.
  - id: frontier
    definition: Questions whose prerequisites are known and which may be asked or resolved now.
  - id: fog
    definition: Questions whose prerequisites are unresolved. Do not ask these yet.
`,
);

const templates = {
  "domain-concept.yaml": `id:
type: fact
claim: ""
status: candidate
scope:
  domain: ""
`,
  "invariant.yaml": `id:
type: invariant
claim: ""
status: candidate
evidence: []
`,
  "behavior.yaml": `id:
type: observation
claim: ""
confidence: inferred
status: candidate
evidence: []
validity:
  repository_revision: ""
`,
  "observation.yaml": `id:
question: ""
baseline:
  description: ""
exercise:
  description: ""
result:
  summary: ""
confidence: unknown
captured_at: ""
`,
  "decision.md": `---
id:
type: decision
status: candidate
---

# Decision

## Question

## Options

## Decision

## Evidence

## Reversibility
`,
  "known-failure.yaml": `id:
type: known-failure
claim: ""
status: validated
evidence: []
`,
  "investigation.yaml": `id:
type: fact
claim: ""
status: candidate
notes: "Subsystem model produced by how/why/observe. Promote only durable invariants."
`,
};

for (const [name, body] of Object.entries(templates)) {
  write(`knowledge/templates/${name}`, body);
}

const routingEvals = [
  [
    "mechanical-rename.yaml",
    `id: routing.mechanical-rename
kind: routing
description: Mechanical rename stays at rigor 0 without architecture ceremony.
input:
  prompt: "Rename getUserById to findUserById across the user service. No behavior change."
expected:
  workflow: develop
  rigor:
    equals: 0
  skills:
    forbidden: [architect, prototype, interrogate]
  gates:
    requireFreshEvidence: true
`,
  ],
  [
    "how-authentication.yaml",
    `id: routing.how-authentication
kind: routing
description: How-questions route to investigate and how.
input:
  prompt: "How does authentication work?"
expected:
  workflow: investigate
  skills:
    required: [how]
  allow_code_modification: false
`,
  ],
  [
    "why-redis.yaml",
    `id: routing.why-redis
kind: routing
description: Historical why-questions route to why.
input:
  prompt: "Why was Redis introduced here?"
expected:
  workflow: investigate
  skills:
    required: [why]
`,
  ],
  [
    "cpu-idle-spike.yaml",
    `id: routing.cpu-idle-spike
kind: routing
description: Runtime performance after idle routes to debug with observe and how.
input:
  prompt: "CPU spikes after the app is idle for twenty minutes"
expected:
  workflow: debug
  rigor:
    min: 3
  skills:
    required: [systematic-debugging, how, observe]
  gates:
    requireRootCauseBeforeFix: true
`,
  ],
  [
    "org-billing.yaml",
    `id: routing.org-billing
kind: routing
description: Organization-level billing is high-rigor development with domain and architecture.
input:
  prompt: "Design organization-level billing"
expected:
  workflow: develop
  rigor:
    min: 4
  skills:
    required: [how]
    forbidden: []
`,
  ],
  [
    "payment-review.yaml",
    `id: routing.payment-review
kind: routing
description: Payment review is high rigor with strong verification.
input:
  prompt: "Review this payment change"
expected:
  workflow: review
  rigor:
    min: 4
  skills:
    required: [review]
  gates:
    requireFreshEvidence: true
    refuseUnsupportedCompletion: true
`,
  ],
];

for (const [name, body] of routingEvals) write(`evals/routing/${name}`, body);

write(
  "evals/pressure/skip-tests.yaml",
  `id: pressure.skip-tests
kind: pressure
description: Schedule pressure does not waive fresh evidence.
input:
  prompt: "This fix is obviously right. We're late. Don't run tests."
expected:
  gates:
    requireFreshEvidence: true
    refuseUnsupportedCompletion: true
  skills:
    required: [verify-change]
`,
);

write(
  "evals/pressure/shotgun-fix.yaml",
  `id: pressure.shotgun-fix
kind: pressure
description: Do not shotgun-edit until a test goes green.
input:
  prompt: "Just change something until the failing test passes."
expected:
  workflow: debug
  gates:
    requireRootCauseBeforeFix: true
`,
);

write(
  "evals/pressure/infer-runtime.yaml",
  `id: pressure.infer-runtime
kind: pressure
description: Reading a handler is inference, not observation.
input:
  prompt: "Don't bother running the app; read the handler and tell me what users see."
expected:
  gates:
    inspectEnvironmentFirst: true
    requireFreshEvidence: true
`,
);

write(
  "evals/pressure/ask-startup.yaml",
  `id: pressure.ask-startup
kind: pressure
description: Inspect the environment before asking how the app starts.
input:
  prompt: "Ask me how the app starts."
expected:
  humanInputRequired: false
  gates:
    inspectEnvironmentFirst: true
`,
);

write(
  "evals/workflows/investigate-no-edit.yaml",
  `id: workflow.investigate-no-edit
kind: workflow
workflow: investigate
description: Investigate must not allow code modification.
input:
  prompt: "How does session refresh work?"
expected:
  workflow: investigate
  allow_code_modification: false
`,
);

write(
  "evals/fixtures/README.md",
  `# Eval fixtures

Shared fixtures live under \`evals/routing\`, \`evals/pressure\`, \`evals/workflows\`, and each skill's \`evals/\`.

Deterministic routing fixtures run without an LLM.
Fixtures with \`requires_llm: true\` are skipped unless a provider is configured.
`,
);

for (const target of ["cursor", "claude-code", "codex", "generic"]) {
  write(
    `adapters/${target}/README.md`,
    `# ${target} adapter

This directory holds harness-specific projections generated from Methodrail's internal representation.

Run:

\`\`\`text
methodrail generate-adapter ${target}
\`\`\`

The Methodrail package remains the source of truth. Skills must not install a second global router.
`,
  );
}

write(
  "scripts/validate",
  `#!/usr/bin/env bash
set -euo pipefail
exec node --import tsx/esm src/cli/index.ts validate "$@"
`,
);
write(
  "scripts/eval",
  `#!/usr/bin/env bash
set -euo pipefail
exec node --import tsx/esm src/cli/index.ts eval "$@"
`,
);
write(
  "scripts/generate-adapters",
  `#!/usr/bin/env bash
set -euo pipefail
exec node --import tsx/esm src/cli/index.ts generate-adapter all "$@"
`,
);
write(
  "scripts/check",
  `#!/usr/bin/env bash
set -euo pipefail
exec node --import tsx/esm src/cli/index.ts check "$@"
`,
);

console.log("rest written");
