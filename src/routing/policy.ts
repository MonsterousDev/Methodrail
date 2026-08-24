import type {
  RigorLevel,
  RoutingDecision,
  RoutingExplanation,
  RoutingFeatures,
  RoutingGates,
  RoutingInput,
  SkillMetadata,
  WorkflowId,
} from "../types.js";
import { extractFeatures, uncertaintyFor } from "./features.js";

const EXPENSIVE_SKILLS = ["architect", "prototype", "interrogate"] as const;

export function route(input: RoutingInput, skills: SkillMetadata[] = []): RoutingDecision {
  const extracted = extractFeatures(input);
  const features = extracted.features;
  const explanation: RoutingExplanation[] = [...extracted.explanation];

  const workflow = workflowFor(features, explanation);
  const rigor = rigorFor(features, input, explanation);
  const { required, recommended, excluded } = skillsFor(features, workflow, rigor, explanation);
  const gates = gatesFor(features, workflow, rigor, explanation);
  const humanInputRequired = humanInputFor(features, rigor, explanation);
  const filtered = applyInvocationPolicy(
    { required, recommended, excluded },
    skills,
    explanation,
  );

  return {
    workflow,
    rigor,
    skills: filtered,
    humanInputRequired,
    uncertainty: uncertaintyFor(features),
    gates,
    explanation,
    features,
  };
}

function workflowFor(
  features: RoutingFeatures,
  explanation: RoutingExplanation[],
): WorkflowId {
  const intent = features.taskIntent;
  if (
    intent === "investigate" ||
    intent === "develop" ||
    intent === "debug" ||
    intent === "refactor" ||
    intent === "review"
  ) {
    explanation.push({
      rule: "policy.workflow-from-intent",
      detail: `Workflow ${intent} selected from task intent`,
    });
    return intent;
  }
  explanation.push({
    rule: "policy.workflow-default",
    detail: "Unknown intent defaulted to develop",
  });
  return "develop";
}

function rigorFor(
  features: RoutingFeatures,
  input: RoutingInput,
  explanation: RoutingExplanation[],
): RigorLevel {
  if (input.task?.rigor !== undefined) {
    explanation.push({
      rule: "override.rigor",
      detail: `Explicit rigor ${input.task.rigor}`,
    });
    return input.task.rigor;
  }

  let level = 2;

  if (
    features.mechanicalChange &&
    !features.riskHints.includes("high") &&
    !features.riskHints.includes("critical")
  ) {
    level = 0;
    explanation.push({
      rule: "policy.rigor.mechanical",
      detail: "Mechanical change with no high-risk hint → rigor 0",
    });
  }

  if (features.taskIntent === "debug") {
    level = Math.max(level, features.runtimeNeed ? 3 : 2);
    explanation.push({
      rule: "policy.rigor.debug",
      detail: "Debug work raises rigor so reproduction and evidence are required",
    });
  }

  if (features.scopeHint === "cross-boundary" || features.scopeHint === "system") {
    level = Math.max(level, 3);
    explanation.push({
      rule: "policy.rigor.scope",
      detail: "Cross-boundary or system scope → rigor ≥ 3",
    });
  }

  if (features.riskHints.includes("high")) {
    level = Math.max(level, 4);
    explanation.push({
      rule: "policy.rigor.high-risk",
      detail: "High-risk domain → rigor ≥ 4",
    });
  }

  if (features.riskHints.includes("critical")) {
    level = Math.max(level, 5);
    explanation.push({
      rule: "policy.rigor.critical",
      detail: "Critical irreversibility → rigor 5",
    });
  }

  if (features.taskIntent === "review" && features.riskHints.includes("high")) {
    level = Math.max(level, 4);
  }

  if (features.questionKind === "how" || features.questionKind === "why") {
    level = Math.max(level, 1);
  }

  return Math.min(5, Math.max(0, level)) as RigorLevel;
}

function skillsFor(
  features: RoutingFeatures,
  workflow: WorkflowId,
  rigor: RigorLevel,
  explanation: RoutingExplanation[],
): { required: string[]; recommended: string[]; excluded: string[] } {
  const required = new Set<string>();
  const recommended = new Set<string>();
  const excluded = new Set<string>();

  if (rigor === 0) {
    for (const skill of EXPENSIVE_SKILLS) excluded.add(skill);
    recommended.add("verify-change");
    explanation.push({
      rule: "policy.skills.mechanical",
      detail: "Rigor 0 forbids architect/prototype/interrogate",
    });
  }

  if (workflow === "investigate") {
    if (features.questionKind === "how") required.add("how");
    if (features.questionKind === "why") required.add("why");
    if (features.questionKind === "observe") required.add("observe");
    if (features.questionKind === "prototype") required.add("prototype");
    if (features.questionKind === "blast-radius") required.add("blast-radius");
    if (features.questionKind === "domain") required.add("domain-modeling");
    if (required.size === 0) required.add("how");
  }

  if (workflow === "debug") {
    required.add("systematic-debugging");
    required.add("how");
    if (features.runtimeNeed) required.add("observe");
    recommended.add("verify-change");
    recommended.add("blast-radius");
    explanation.push({
      rule: "policy.skills.debug",
      detail: "Debug requires mechanism understanding before a fix; runtime symptoms require observe",
    });
  }

  if (workflow === "develop") {
    if (rigor >= 1) recommended.add("how");
    if (rigor >= 2) recommended.add("verify-change");
    if (rigor >= 3) {
      required.add("how");
      recommended.add("blast-radius");
      recommended.add("review");
    }
    if (rigor >= 4 || features.riskHints.includes("high")) {
      required.add("how");
      recommended.add("domain-modeling");
      recommended.add("architect");
      recommended.add("verify-change");
      recommended.add("blast-radius");
      recommended.add("review");
      if (features.empiricalNeed) recommended.add("prototype");
      explanation.push({
        rule: "policy.skills.high-risk-develop",
        detail: "Consequential development requires current-system understanding, domain, architecture, and verification",
      });
    }
    if (features.questionKind === "domain" || features.contractsFired.includes("risk.high")) {
      recommended.add("domain-modeling");
    }
  }

  if (workflow === "refactor") {
    required.add("how");
    recommended.add("verify-change");
    recommended.add("blast-radius");
    recommended.add("review");
    excluded.add("prototype");
  }

  if (workflow === "review") {
    required.add("review");
    recommended.add("verify-change");
    recommended.add("blast-radius");
    if (rigor >= 4) {
      recommended.add("interrogate");
      recommended.add("how");
      explanation.push({
        rule: "policy.skills.high-rigor-review",
        detail: "High-rigor review may invoke interrogate; verification evidence is mandatory",
      });
    }
  }

  if (features.runtimeNeed && workflow !== "investigate") recommended.add("observe");
  if (features.historicalNeed) recommended.add("why");
  if (features.empiricalNeed && rigor > 0) recommended.add("prototype");
  if (features.pressureToSkipDiscipline) required.add("verify-change");
  if (features.contractsFired.includes("intent.control-adapter-create")) {
    required.add("create-control-adapter");
  }
  if (features.contractsFired.includes("intent.control-adapter-maintain")) {
    required.add("maintain-control-adapter");
  }

  for (const skill of required) recommended.delete(skill);
  for (const skill of excluded) {
    required.delete(skill);
    recommended.delete(skill);
  }

  return {
    required: [...required].sort(),
    recommended: [...recommended].sort(),
    excluded: [...excluded].sort(),
  };
}

function gatesFor(
  features: RoutingFeatures,
  workflow: WorkflowId,
  rigor: RigorLevel,
  explanation: RoutingExplanation[],
): RoutingGates {
  const investigate = workflow === "investigate";
  const gates: RoutingGates = {
    exploreBeforeChange: !investigate && rigor >= 1 && !features.mechanicalChange,
    requireFreshEvidence: true,
    refuseUnsupportedCompletion: true,
    inspectEnvironmentFirst: true,
    requireRootCauseBeforeFix: workflow === "debug" || features.pressureToSkipDiscipline,
    allowCodeModification: !investigate,
  };

  if (features.mechanicalChange && rigor === 0) {
    gates.exploreBeforeChange = false;
  }

  if (features.pressureToSkipDiscipline) {
    gates.requireFreshEvidence = true;
    gates.refuseUnsupportedCompletion = true;
    gates.inspectEnvironmentFirst = true;
    explanation.push({
      rule: "policy.gates.pressure",
      detail: "User pressure does not waive evidence, environment inspection, or completion gates",
    });
  }

  return gates;
}

function humanInputFor(
  features: RoutingFeatures,
  rigor: RigorLevel,
  explanation: RoutingExplanation[],
): boolean {
  if (rigor >= 5) {
    explanation.push({
      rule: "policy.human.critical",
      detail: "Rigor 5 requires explicit human approval for consequential decisions",
    });
    return true;
  }
  if (features.humanPreferenceLikely && features.questionKind === "domain") {
    explanation.push({
      rule: "policy.human.preference",
      detail: "Human input only after the environment cannot resolve the question",
    });
    return false;
  }
  if (features.contractsFired.includes("pressure.ask-human-for-environment")) {
    explanation.push({
      rule: "policy.human.environment-first",
      detail: "Do not ask the human for startup/environment facts inspectable from the repo",
    });
    return false;
  }
  return false;
}

function applyInvocationPolicy(
  skills: { required: string[]; recommended: string[]; excluded: string[] },
  catalog: SkillMetadata[],
  explanation: RoutingExplanation[],
): { required: string[]; recommended: string[]; excluded: string[] } {
  if (catalog.length === 0) return skills;
  const byId = new Map(catalog.map((s) => [s.id, s]));
  const required: string[] = [];
  const recommended: string[] = [];

  for (const id of skills.required) {
    const meta = byId.get(id);
    if (!meta) {
      required.push(id);
      continue;
    }
    if (meta.invocation.modes.includes("internal")) {
      explanation.push({
        rule: "policy.invocation.internal",
        detail: `${id} is internal and was not independently activated`,
      });
      continue;
    }
    required.push(id);
  }

  for (const id of skills.recommended) {
    const meta = byId.get(id);
    if (!meta) {
      recommended.push(id);
      continue;
    }
    if (meta.invocation.modes.includes("internal")) continue;
    if (meta.invocation.modes.length === 1 && meta.invocation.modes[0] === "explicit") {
      explanation.push({
        rule: "policy.invocation.explicit-only",
        detail: `${id} is explicit-only; recommended but not auto-activated`,
      });
    }
    recommended.push(id);
  }

  return { required, recommended, excluded: skills.excluded };
}
