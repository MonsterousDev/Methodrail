import type { ComparisonReport, ScoreResult } from "./types.js";

export function compareScores(baseline: ScoreResult, methodrail: ScoreResult): ComparisonReport {
  const where: string[] = [];
  const cost: string[] = [];
  const extra: string[] = [];

  if (methodrail.passed && !baseline.passed) where.push("Methodrail passed expected behavior that baseline missed");
  if (baseline.forbidden_hits.length > 0 && methodrail.forbidden_hits.length === 0) {
    where.push("Methodrail avoided forbidden expensive operators");
  }
  if (methodrail.behavior_hits.length > baseline.behavior_hits.length) {
    where.push("Methodrail observed more of the expected behaviors");
  }
  if (methodrail.metrics.verification_steps > baseline.metrics.verification_steps) {
    where.push("Methodrail collected more verification steps");
  }
  if (!methodrail.passed && baseline.passed) extra.push("Methodrail failed a check baseline passed");
  if (methodrail.metrics.subagents_used > baseline.metrics.subagents_used) {
    extra.push("Methodrail used more subagents");
  }
  if (methodrail.metrics.expensive_skill_count > baseline.metrics.expensive_skill_count) {
    extra.push("Methodrail used more expensive operators");
  }

  cost.push(
    `skills ${baseline.metrics.skill_count}→${methodrail.metrics.skill_count}`,
    `references ${baseline.metrics.reference_count}→${methodrail.metrics.reference_count}`,
    `subagents ${baseline.metrics.subagents_used}→${methodrail.metrics.subagents_used}`,
    `verification steps ${baseline.metrics.verification_steps}→${methodrail.metrics.verification_steps}`,
  );
  if (baseline.metrics.latency_ms != null || methodrail.metrics.latency_ms != null) {
    cost.push(`latency_ms ${baseline.metrics.latency_ms ?? "n/a"}→${methodrail.metrics.latency_ms ?? "n/a"}`);
  }

  let verdict: ComparisonReport["verdict"] = "incomplete";
  const methodrailHelped =
    methodrail.passed && (!baseline.passed || where.length > 0) && extra.length === 0
      ? true
      : !methodrail.passed && baseline.passed
        ? false
        : extra.length > 0 && where.length > 0
          ? null
          : methodrail.passed && extra.length > 0
            ? null
            : methodrail.passed
              ? true
              : null;

  if (methodrailHelped === true) verdict = extra.length > 0 ? "mixed" : "helped";
  else if (methodrailHelped === false) verdict = "harmed";
  else if (where.length > 0 && extra.length > 0) verdict = "mixed";
  else if (!methodrail.passed && !baseline.passed) verdict = "incomplete";
  else verdict = extra.length > 0 ? "mixed" : "incomplete";

  return {
    fixture_id: methodrail.fixture_id,
    baseline,
    methodrail,
    methodrail_helped: methodrailHelped,
    where,
    cost,
    extra_complexity: extra,
    verdict,
  };
}

export function formatComparison(report: ComparisonReport): string {
  const helped =
    report.methodrail_helped === true ? "yes" : report.methodrail_helped === false ? "no" : "unclear";
  return [
    `# Composition report: ${report.fixture_id}`,
    "",
    `Did Methodrail help? ${helped}`,
    `Verdict: ${report.verdict}`,
    "",
    "## Where",
    ...(report.where.length > 0 ? report.where.map((line) => `- ${line}`) : ["- No scored behavioral gain"]),
    "",
    "## Cost",
    ...report.cost.map((line) => `- ${line}`),
    "",
    "## Additional complexity",
    ...(report.extra_complexity.length > 0
      ? report.extra_complexity.map((line) => `- ${line}`)
      : ["- None scored"]),
    "",
    "## Baseline failures",
    ...(report.baseline.failures.length > 0
      ? report.baseline.failures.map((line) => `- ${line}`)
      : ["- none"]),
    "",
    "## Methodrail failures",
    ...(report.methodrail.failures.length > 0
      ? report.methodrail.failures.map((line) => `- ${line}`)
      : ["- none"]),
    "",
  ].join("\n");
}
