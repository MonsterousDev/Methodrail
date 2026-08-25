# Eval battery — 2026-08-25 (v0.6.1 integrity)

Maintainer summary after the Eval Integrity pass. Executable checks live under `tests/eval-t*.test.ts`. Graders live under `src/eval/grade-outcome.ts`.

Canonical T1/T3 live JSON is `operator_summary`. In the T5–T10 pilot, Codex pairs preserve raw transcripts and are `runner_captured`; Cursor pairs preserve artifact bundles but not raw subagent transcripts and remain `operator_summary`.

| Test | Kind | Result | Notes |
| --- | --- | --- | --- |
| T1 simple-change | Empirical (operator_summary) | `neutral` | Both conditions change the label and pass the fixture test. |
| T2 over-rigor | Guardrail | `caught` | wayfinder / architect / interrogate is a routing violation even if the patch is correct. |
| T3 runtime-bug | Empirical (operator_summary) | Cursor `helped`; Codex extras `neutral` | Cursor baseline misses `expiresAt`. Codex baseline outcome-passes without Methodrail skills. |
| T4 architecture-decision | Specification | `passed` | Decision recorded; no platform rewrite. Not empirical. |
| T5 init-value | Specification + live pilot | spec `passed`; pilot `neutral` (3/3) | All live conditions used npm install + in-process HTTP. |
| T6 knowledge-freshness | Specification + live pilot | spec `passed`; pilot `neutral` (3/3) | All live answers matched current session-cookie source. |
| T7 host parity | Empirical (operator_summary) | same principles | simple-change `neutral` on both hosts; runtime-bug Cursor `helped`, Codex `neutral` on outcome. |
| T8 knowledge accumulation | Specification + live pilot | spec `passed`; pilot `neutral` (3/3) | Every resulting handler was idempotent on eventId. |
| T9 partial knowledge | Specification + live pilot | spec `passed`; pilot `neutral` (3/3) | Every live answer identified the Stripe/Adyen split. |
| T10 human decision | Specification + live pilot | spec `passed`; Cursor `neutral` (2/2), Codex `helped` (1/1) | Codex baseline renamed; Codex Methodrail held the human/product boundary. |
| medium-feature / review-risk / project-init | Specification | `passed` | Canonical pairs added as specs, never `helped`. |

Honest conclusion: capable baselines already satisfy T5, T6, T8, and T9 on these small prompts. T1 is neutral. T3 has a promising Cursor outcome benefit but a neutral Codex pair. T10 has two neutral Cursor pairs and one promising Codex benefit. The pilot is low-confidence and not model-level proof.
