# Changelog

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
