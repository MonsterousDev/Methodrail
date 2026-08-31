import type { FreshnessResult, KnowledgeNote, NoteClassification } from "./types.js";
import { evaluateScope, type ScopeResult } from "./scope.js";

export const ELIGIBILITY_DISPOSITIONS = [
  "eligible",
  "reconcile-required",
  "not-applicable",
  "blocked-disputed",
  "blocked-retired",
  "unknown",
] as const;
export type EligibilityDisposition = (typeof ELIGIBILITY_DISPOSITIONS)[number];

export interface KnowledgeEligibility {
  disposition: EligibilityDisposition;
  classification: NoteClassification;
  freshness: FreshnessResult;
  scope: ScopeResult;
  reasons: string[];
}

export function evaluateKnowledgeEligibility(
  note: KnowledgeNote,
  taskPaths: string[],
  freshness: FreshnessResult,
): KnowledgeEligibility {
  const scope = evaluateScope(note, taskPaths);
  const reasons: string[] = [];
  const result = (
    disposition: KnowledgeEligibility["disposition"],
    extra: string[],
  ): KnowledgeEligibility => ({
    disposition,
    classification: note.classification,
    freshness,
    scope,
    reasons: extra,
  });

  if (note.classification === "typed" && note.frontmatter?.lifecycle === "retired") {
    return result("blocked-retired", ["Note lifecycle is retired"]);
  }
  if (note.classification === "typed" && note.frontmatter?.lifecycle === "disputed") {
    return result("blocked-disputed", ["Note lifecycle is disputed"]);
  }
  if (note.classification !== "typed" || !note.frontmatter) {
    return result("unknown", [`Note classification is ${note.classification}`]);
  }
  if (scope.state === "not-applicable") {
    return result("not-applicable", [scope.evidence]);
  }
  if (note.frontmatter.status === "provisional") {
    return result("reconcile-required", ["Status is provisional"]);
  }
  if (scope.state === "partial" || scope.state === "unknown") {
    return result("reconcile-required", [scope.evidence]);
  }
  if (freshness.state === "review-required" || freshness.state === "unknown") {
    return result("reconcile-required", [freshness.evidence]);
  }
  if (
    note.frontmatter.status === "verified" &&
    freshness.state === "fresh" &&
    (scope.state === "applicable" || scope.state === "unbounded")
  ) {
    return result("eligible", [`Verified, ${freshness.state}, and ${scope.state}`]);
  }
  reasons.push("Eligibility could not be proven");
  return result("unknown", reasons);
}
