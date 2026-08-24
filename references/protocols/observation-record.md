# Observation record

Use these confidence labels consistently in `observe`, `how`, `why`, `verify-change`, and `investigate`.

```text
inferred
test-confirmed
observed
traced
historically-confirmed
unknown
```

## inferred

Derived from code or reasoning but not executed.

## test-confirmed

An existing or new automated test demonstrates the behavior.

## observed

Behavior was reproduced against the actual runnable system or a representative execution path.

## traced

Runtime evidence demonstrates the mechanism, not merely the visible outcome.

## historically-confirmed

Intent or rationale has explicit historical evidence.

## unknown

Evidence is insufficient or conflicting.

Never call a source reading `observed`. Never call a current-code inference `historically-confirmed`.

## Lightweight record

```text
Question:
Baseline (revision, config, data):
Exercise:
Result:
Confidence:
Reproduction:
Artifact locations:
```
