# Evidence

Evidence supports a claim. It is not the claim, and it is not a decision.

Kinds: source, test, runtime, trace, profile, benchmark, history, document, human-decision, static-analysis, generated-artifact.

Every evidence object has id, kind, claim_supported, location, captured_at, producer, freshness, confidence.

Confidence classes: inferred, test-confirmed, observed, traced, historically-confirmed, unknown.

`observed` requires execution. Reading a handler is `inferred`.
