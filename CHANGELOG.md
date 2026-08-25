# Changelog

## 0.7.0 — 2026-08-25

Harness Intelligence, first slice: verified knowledge reuse. Typed, approval-gated project notes with executable freshness diagnostics. Constructed specs pass. Live reuse was outcome-neutral; live refresh helped on proposed note updates, not on mail routing.

- Add a typed Markdown contract (`kind`, `status`, `validated_at`, `relevant_paths`) with maintainer parsing, validation, and `fresh` / `review-required` / `unknown` diagnostics
- Keep decisions on the existing decision template; leave rationale/observation as records; load legacy untyped notes with reduced confidence
- Make Reflect propose at most one note and wait for approval; init recognizes and warns, and does not create typed notes
- Point investigate/develop/debug/refactor/review at one shared reuse procedure
- Add `knowledge-reuse` and `knowledge-refresh` constructed specs (hidden graders; Task B does not leak retries)
- Record a 6-pair live pilot: reuse neutral on all hosts; refresh helped when Methodrail proposed a note update
- Do not rewrite T6 / T8 / T9 history

## 0.6.1 — 2026-08-25

Eval Integrity: artifact-backed outcome graders, disjoint empirical/specification/guardrail vocabularies, and an integrity gate that demands completeness rather than favorable verdicts.

- Grade patches, tests, command logs, and final answers; ignore `behaviors_observed` as ground truth
- Keep Methodrail skill names on the routing layer so baselines are not failed for missing skills
- Count empty/`none` verification as zero; over-rigor is a routing violation, not a fake outcome fail
- Treat constructed pairs as specification `passed`/`failed`, never empirical `helped`
- Require a canonical pair and artifacts for every composition fixture; do not fail CI on live `harmed`
- Relabel summary-only live JSON honestly and preserve raw Codex transcripts where available
- Add a manifest-gated T5–T10 live pilot: 14 neutral pairs and one promising Codex human-boundary benefit
- Calibrate graders against preserved pilot artifacts and count only repro/regression/verify commands as verification
- Preserve overlay deletions explicitly so artifact worktrees reproduce removed files

## 0.6.0 — 2026-08-24

Demonstrated Composition: one family invariant, restored upstream `how` behavior, project-verification reuse, and a maintainer eval harness that can compare baseline vs Methodrail.

- Restored public `how` explorer/critique obligations while keeping host-optional subagents and evidence labels
- Made `verify-change` reuse project verification, control, runtime, and test workflows before inventing steps
- Extracted `references/methodrail-family-invariant.md` and projected it to Cursor, Claude, and Codex
- Added executable composition/fidelity/complexity evaluation with recorded baseline comparison
- Tightened `methodrail-init` PROJECT.md quality: index and pointers, not a copied README
- Extended `reflect` to classify eval failures toward enforcement rather than more prose
- Dogfooded a pointer-oriented `.methodrail/PROJECT.md` in this repository

## 0.5.0 — 2026-08-24

Unified Skill Substrate, Context Economics, upstream fidelity, `writing-for-agents`, `handoff`, family-wide project-harness integration, and proportional complexity.

- Added shared methodology: skill substrate, context economics, and skill composition
- Adopted current Matt `writing-for-agents` (subsumes writing-great-skills) and `handoff`
- Audited adopted-skill fidelity; restored Methodrail-family integration without flattening upstream expertise
- Made workflow skills thinner and proportional; kept `verify-change` and root-cause discipline
- Strengthened `methodrail-init` as a multiplier for later skills
- Added complexity evals and family-integration behavioral evals
- Kept the global rule small; no custom workflow runtime

## 0.4.0 — 2026-08-24

Methodrail becomes a curated, attributable distribution of proven AI software-engineering practices. The native-harness architecture is unchanged.

- Replaced weaker Methodrail reimplementations of `how`, `why`, `blast-radius`, `domain-modeling`, `architect`, `interrogate`, and `verify-change` with adapted upstream skills
- Chose canonical owners: `diagnosing-bugs` (Matt) over Superpowers/Methodrail systematic-debugging; `tdd` (Matt) over Superpowers/pstack TDD; one `prototype`
- Added operators: `research`, `grill-with-docs`, `wayfinder`, `codebase-design`, `improve-codebase-architecture`, `code-review`, `arena`, `swarm`, `to-spec`, `to-tickets`
- Added escalation pack: `runtime-forensics`, `trace-forensics`, `performance`, `hillclimb`, `visual-parity`
- Added project-harness skills `create-verification-skill` and `maintain-verification-skill`, wired into `/methodrail-init`
- Added `show-me-your-work` and `reflect` as explicit learning/audit skills
- Documented provenance (`THIRD_PARTY_NOTICES.md`, `upstreams/`, per-skill `UPSTREAM.md`), capability map, upstream matrix, and `npm run check-upstreams`
- Kept Methodrail-native workflows as a thin composition layer; did not import competing control planes

## 0.3.0 — 2026-08-24

Methodrail remains a native plugin and project-harness builder, with the methodology that v0.2 stripped restored as references, skills, and maintainer evals.

- Restored rigor, decision frontier, knowledge lifecycle, evidence/observation/decision records, task/review packets, context management, agent-friendly codebase principles, and structural enforcement as progressive-disclosure references
- Added `/refactor` as a first-class workflow skill
- Strengthened `/methodrail-init` to inspect first, scale harness output with project complexity, capture control/verification when justified, and refresh generated knowledge without overwriting curated content
- Pointed workflow skills at shared methodology instead of embedding it
- Added maintainer routing, behavioral, and pressure evals
- Kept Cursor as the runtime: no workflow engine, daemon, consumer CLI, or project npm dependency

## 0.2.0 — 2026-08-24

Methodrail now delegates orchestration to the native AI coding harness.

- Replaced the custom router, workflow engine, packet schemas, registry, adapter generator, and consumer CLI with native Agent Skills
- Added the Cursor Plugin manifest, a small persistent rule, and explicit `/investigate`, `/develop`, `/debug`, and `/review` workflow skills
- Made `/methodrail-init` the flagship workflow for creating a safe, idempotent `.methodrail/` project harness
- Consolidated project knowledge behind `.methodrail/PROJECT.md` and thin host-native pointers
- Preserved the evidence, uncertainty-resolution, verification, debugging, and blast-radius disciplines as portable leaf skills
- Reduced TypeScript to repository-development validation and fixture acceptance tests
- Removed generated copies of skills and other v0.1 runtime-era abstractions

This release intentionally breaks the v0.1 programmatic APIs and CLI. Consuming repositories no longer install Methodrail as an npm dependency.

## 0.1.0 — 2026-08-23

Initial public shape of Methodrail:

- Protocol schemas for skills, workflows, evidence, knowledge, decisions, packets, evals, and rigor
- Thirteen skills with routing evals
- Workflows: investigate, develop, debug, refactor, review
- Deterministic, explainable router with pressure gates
- Registry, validator, eval runner (LLM-optional), CLI
- Adapters for Cursor, Claude Code, Codex, and generic Agent Skills
