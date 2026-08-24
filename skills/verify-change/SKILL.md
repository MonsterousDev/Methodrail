---
name: verify-change
description: "Use when about to claim work is complete, fixed, or passing. Requires fresh verification evidence before any success claim. Do not use as an investigation skill."
---

# Verify change

**Core principle:** Evidence before claims, always.

Violating the letter of this rule is violating the spirit of this rule.

## The iron law

```text
NO COMPLETION CLAIM WITHOUT FRESH RELEVANT EVIDENCE
```

If you haven't run the verification in this message, you cannot claim it passes.

The upstream Superpowers gate function is the operating procedure. Keep it. The full original is in [superpowers-verification-before-completion.md](references/superpowers-verification-before-completion.md).

## The gate function

BEFORE claiming any status or expressing satisfaction:

1. **IDENTIFY:** What command or observation proves this claim?
2. **RUN:** Execute the FULL command (fresh, complete), or exercise the real path when the claim is behavioral.
3. **READ:** Full output, check exit code, count failures. Inspect the result; do not skim.
4. **VERIFY:** Does the output confirm the claim?
   - If NO: state actual status with evidence
   - If YES: state the claim WITH evidence
5. **ONLY THEN:** make the claim

Skip any step = lying, not verifying.

Prefer the project's verify skill or `.methodrail/control/CONTROL.md` when present. Interview the repository for commands; do not invent a test pyramid essay instead of running the relevant check.

## What counts as evidence

Match the evidence to the claim:

- TDD / regression tests
- characterization tests
- integration and end-to-end scenarios
- static analysis / typechecking / compilation
- benchmarks
- visual baselines
- runtime observation (`observe`)
- migration dry runs
- invariant / property tests

TDD is the preferred default for normal behavior-changing production code, but not a universal law. The universal law: every meaningful change requires a falsifiable verification strategy. See [evidence record](../../references/protocols/evidence-record.md).

Distinguish **passed** verification from **merely executed** verification.

## Common failures

| Claim | Requires | Not sufficient |
|---|---|---|
| Tests pass | Test command output: 0 failures | Previous run, "should pass" |
| Linter clean | Linter output: 0 errors | Partial check |
| Build succeeds | Build command: exit 0 | Linter passing |
| Bug fixed | Original symptom: passes | Code changed, assumed fixed |
| Regression test works | Red-green cycle verified | Test passes once |
| Agent completed | VCS diff shows changes | Agent reports "success" |
| Requirements met | Line-by-line checklist | Tests passing |

## Red flags — STOP

- Using "should", "probably", "seems to"
- Expressing satisfaction before verification
- About to commit/push/PR without verification
- Trusting agent success reports
- Partial verification
- "Just this once"
- Tired and wanting work over
- Any wording implying success without having run verification

## Rationalization prevention

| Excuse | Reality |
|---|---|
| "Should work now" | RUN the verification |
| "I'm confident" | Confidence ≠ evidence |
| "Just this once" | No exceptions |
| "Linter passed" | Linter ≠ compiler |
| "Agent said success" | Verify independently |
| "I'm tired" | Exhaustion ≠ excuse |
| "Don't run tests; just tell me it's fixed" | Refuse the completion claim |

## When to apply

Always before any variation of success/completion claims, satisfaction, commit/PR, moving to the next task, or delegating "done" to another agent. The rule applies to exact phrases, paraphrases, and implications of success.
