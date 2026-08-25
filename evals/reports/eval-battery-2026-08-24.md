# Eval battery — 2026-08-25

Maintainer summary of the v0.6 eval battery. Executable checks live under `tests/eval-t*.test.ts`. Per-test notes live under `docs/internal/eval-t*.md`.

| Test | Kind | Verdict | Notes |
| --- | --- | --- | --- |
| T1 simple-change neutrality | Live Cursor | `neutral` | Both inspect → edit → cheap check. Baseline need not fail. |
| T2 over-rigor | Synthetic guardrail | `scoreRun` fail | wayfinder / architect / interrogate refused. Not a live comparison. |
| T3 runtime-bug | Live Cursor | `helped` | Baseline: no runtime evidence. Methodrail: drive, regression, verify. |
| T4 architecture-decision | Constructed | `helped` | how + domain-modeling + architect. Prototype not required. |
| T5 init-value | Constructed | `helped` | PROJECT.md blocks npm ci, app.listen, service-shaped assumptions. |
| T6 knowledge-freshness | Constructed | `helped` | Stale JWT claim flagged from session code. Flag, not rewrite. |
| T7 host parity | Live Cursor + Codex | same principles | simple-change `neutral` on both hosts; runtime-bug `helped` on both. Claude absent. |
| T8 knowledge accumulation | Constructed | `helped` | Task A proposes an eventId candidate; Task B reuses it instead of rediscovering. |
| T9 partial knowledge | Constructed | `helped` | Stripe subscriptions stay true; Adyen one-time is the gap. Reconcile, don't discard or fully trust. |
| T10 human decision | Constructed | `helped` | Organization vs Account: tradeoffs and a human gate, not an implemented rename. |

`REQUIRED_COMPOSITION_FIXTURES` includes `init-value`, `knowledge-freshness`, `knowledge-accumulation`, `partial-knowledge`, and `human-decision` in addition to the original six.
