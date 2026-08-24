import type {
  QuestionKind,
  RoutingExplanation,
  RoutingFeatures,
  RoutingInput,
  UncertaintyKind,
} from "../types.js";

interface Contract {
  id: string;
  patterns: RegExp[];
  apply: (features: RoutingFeatures) => void;
}

function blankFeatures(): RoutingFeatures {
  return {
    questionKind: "unknown",
    taskIntent: "unknown",
    riskHints: [],
    scopeHint: "unknown",
    empiricalNeed: false,
    runtimeNeed: false,
    historicalNeed: false,
    humanPreferenceLikely: false,
    pressureToSkipDiscipline: false,
    mechanicalChange: false,
    contractsFired: [],
  };
}

function pushUnique(list: string[], value: string): void {
  if (!list.includes(value)) list.push(value);
}

const CONTRACTS: Contract[] = [
  {
    id: "intent.investigate-how",
    patterns: [
      /\bhow does\b/i,
      /\bhow do\b/i,
      /\bhow is\b.+\b(work|implemented|wired|structured)\b/i,
      /\bwalk me through\b/i,
      /\bexplain (the )?(current|existing) (implementation|flow|code)\b/i,
      /\btrace (the )?(flow|call|data)\b/i,
    ],
    apply: (f) => {
      f.questionKind = "how";
      f.taskIntent = "investigate";
    },
  },
  {
    id: "intent.investigate-why",
    patterns: [
      /\bwhy (was|were|is|are|did|does)\b/i,
      /\bwhat (was the )?(reason|rationale|motivation)\b/i,
      /\bhistorical (reason|context|motivation)\b/i,
      /\bwhy (did we|was .{1,40} introduced)\b/i,
    ],
    apply: (f) => {
      f.questionKind = "why";
      f.taskIntent = "investigate";
      f.historicalNeed = true;
    },
  },
  {
    id: "intent.observe",
    patterns: [
      /\bwhat actually happens\b/i,
      /\bwhat do users see\b/i,
      /\brun the app\b/i,
      /\bobserve (runtime|behavior|the system)\b/i,
      /\bwhen I (click|submit|open|run)\b/i,
    ],
    apply: (f) => {
      f.questionKind = "observe";
      f.runtimeNeed = true;
      if (f.taskIntent === "unknown") f.taskIntent = "investigate";
    },
  },
  {
    id: "intent.prototype",
    patterns: [
      /\bwould .{1,80} work\b/i,
      /\bcan we (prove|measure|benchmark)\b/i,
      /\bprototype\b/i,
      /\bexperiment (to|whether|if)\b/i,
      /\bis it feasible\b/i,
    ],
    apply: (f) => {
      f.questionKind = "prototype";
      f.empiricalNeed = true;
      if (f.taskIntent === "unknown") f.taskIntent = "investigate";
    },
  },
  {
    id: "intent.blast-radius",
    patterns: [
      /\bwhat could this affect\b/i,
      /\bblast radius\b/i,
      /\bwhat else (breaks|changes|is affected)\b/i,
      /\bdownstream (impact|consumers)\b/i,
    ],
    apply: (f) => {
      f.questionKind = "blast-radius";
      if (f.taskIntent === "unknown") f.taskIntent = "investigate";
    },
  },
  {
    id: "intent.debug",
    patterns: [
      /\bbug\b/i,
      /\bcrash(es|ed|ing)?\b/i,
      /\bfail(s|ed|ing|ure)\b/i,
      /\bflaky\b/i,
      /\btimeout\b/i,
      /\bspike(s)?\b/i,
      /\bidle for\b/i,
      /\bregression\b/i,
      /\bdoesn'?t work\b/i,
      /\bbroken\b/i,
      /\bmemory leak\b/i,
      /\bhangs?\b/i,
    ],
    apply: (f) => {
      f.taskIntent = "debug";
      f.questionKind = "debug";
      f.runtimeNeed = true;
    },
  },
  {
    id: "intent.review",
    patterns: [
      /\breview (this|the|my)\b/i,
      /\bcode review\b/i,
      /\bplease review\b/i,
      /\bpr review\b/i,
    ],
    apply: (f) => {
      f.taskIntent = "review";
      f.questionKind = "review";
    },
  },
  {
    id: "intent.refactor",
    patterns: [
      /\brefactor\b/i,
      /\bclean up (this|the) (code|module|file)\b/i,
      /\bno behavior change\b/i,
      /\binternal (structure|cleanup)\b/i,
    ],
    apply: (f) => {
      if (f.taskIntent !== "debug") f.taskIntent = "refactor";
      f.questionKind = "refactor";
    },
  },
  {
    id: "intent.develop",
    patterns: [
      /\bimplement\b/i,
      /\badd (a |an |the )?(feature|endpoint|support)\b/i,
      /\bbuild\b/i,
      /\bdesign\b/i,
      /\bcreate (a |an )?(new )?/i,
      /\bchange .{1,40} so that\b/i,
    ],
    apply: (f) => {
      if (f.taskIntent === "unknown") {
        f.taskIntent = "develop";
        f.questionKind = "develop";
      }
    },
  },
  {
    id: "intent.domain",
    patterns: [
      /\bwhat does ['"]?\w+['"]? mean\b/i,
      /\bdomain model\b/i,
      /\bwho owns\b/i,
      /\bubiquitous language\b/i,
    ],
    apply: (f) => {
      f.questionKind = "domain";
      f.humanPreferenceLikely = true;
    },
  },
  {
    id: "risk.high",
    patterns: [
      /\bbilling\b/i,
      /\bpayment\b/i,
      /\binvoice\b/i,
      /\bpermission(s)?\b/i,
      /\bauthori[sz]/i,
      /\bsecurity\b/i,
      /\bmigration\b/i,
      /\bconcurrency\b/i,
      /\brace\b/i,
      /\bpassword\b/i,
      /\btoken\b/i,
      /\bencryption\b/i,
      /\bpci\b/i,
      /\bgdpr\b/i,
    ],
    apply: (f) => {
      pushUnique(f.riskHints, "high");
    },
  },
  {
    id: "risk.critical",
    patterns: [
      /\birreversible\b/i,
      /\bdestructive\b/i,
      /\bproduction cutover\b/i,
      /\bdata loss\b/i,
      /\bdrop table\b/i,
      /\bpublic exploit\b/i,
    ],
    apply: (f) => {
      pushUnique(f.riskHints, "critical");
    },
  },
  {
    id: "scope.cross-boundary",
    patterns: [
      /\bmultiple (modules|packages|services)\b/i,
      /\bacross (the )?(codebase|services|packages)\b/i,
      /\bshared (abstraction|kernel|library)\b/i,
      /\bpublic api\b/i,
      /\bschema change\b/i,
      /\borganization-level\b/i,
    ],
    apply: (f) => {
      f.scopeHint = "cross-boundary";
    },
  },
  {
    id: "change.mechanical",
    patterns: [
      /\brename\b/i,
      /\bformatting\b/i,
      /\bprettier\b/i,
      /\btypo\b/i,
      /\bcomment[- ]only\b/i,
      /\bno behavior change\b/i,
      /\bobvious config update\b/i,
    ],
    apply: (f) => {
      f.mechanicalChange = true;
      if (f.taskIntent === "unknown") f.taskIntent = "develop";
    },
  },
  {
    id: "pressure.skip-discipline",
    patterns: [
      /\bdon'?t run tests\b/i,
      /\bwe'?re late\b/i,
      /\bobviously right\b/i,
      /\bjust change something until\b/i,
      /\bdon'?t bother running\b/i,
      /\bskip (the )?(tests|verification|review)\b/i,
      /\bship it\b/i,
      /\bno time (for|to)\b/i,
    ],
    apply: (f) => {
      f.pressureToSkipDiscipline = true;
    },
  },
  {
    id: "pressure.infer-runtime",
    patterns: [
      /\bread the handler and tell me what users see\b/i,
      /\bdon'?t bother running the app\b/i,
      /\bjust read the code\b/i,
    ],
    apply: (f) => {
      f.pressureToSkipDiscipline = true;
      f.runtimeNeed = true;
      if (f.questionKind === "unknown") f.questionKind = "observe";
    },
  },
  {
    id: "pressure.ask-human-for-environment",
    patterns: [
      /\bask me how the app starts\b/i,
      /\btell me (the|which) command to (start|run)\b/i,
    ],
    apply: (f) => {
      f.pressureToSkipDiscipline = true;
    },
  },
  {
    id: "runtime.escalation",
    patterns: [
      /\bafter .{0,40}idle\b/i,
      /\bcpu\b/i,
      /\bmemory\b/i,
      /\bproduction only\b/i,
      /\bcan'?t reproduce\b/i,
      /\bintermittent\b/i,
    ],
    apply: (f) => {
      f.runtimeNeed = true;
    },
  },
  {
    id: "intent.control-adapter-create",
    patterns: [
      /\bcreate (a )?(project-local )?control adapter\b/i,
      /\bgenerate \.ai\/control\b/i,
    ],
    apply: (f) => {
      if (f.taskIntent === "unknown") f.taskIntent = "develop";
    },
  },
  {
    id: "intent.control-adapter-maintain",
    patterns: [
      /\bcontrol adapter (drift|is broken|rotted)\b/i,
      /\bdoctor (script|command) (failed|is wrong|drifted)\b/i,
    ],
    apply: (f) => {
      if (f.taskIntent === "unknown") f.taskIntent = "debug";
    },
  },
];

export function extractFeatures(input: RoutingInput): {
  features: RoutingFeatures;
  explanation: RoutingExplanation[];
} {
  const features = blankFeatures();
  const explanation: RoutingExplanation[] = [];

  for (const contract of CONTRACTS) {
    if (contract.patterns.some((pattern) => pattern.test(input.prompt))) {
      contract.apply(features);
      features.contractsFired.push(contract.id);
      explanation.push({
        rule: contract.id,
        detail: `Prompt matched contract ${contract.id}`,
      });
    }
  }

  if (input.task?.type && input.task.type !== "unknown") {
    features.taskIntent = input.task.type;
    explanation.push({
      rule: "override.task-type",
      detail: `Explicit task type ${input.task.type} overrides inferred intent`,
    });
  }
  if (input.task?.question_kind && input.task.question_kind !== "unknown") {
    features.questionKind = input.task.question_kind;
    explanation.push({
      rule: "override.question-kind",
      detail: `Explicit question kind ${input.task.question_kind}`,
    });
  }

  if (features.taskIntent === "unknown" && features.questionKind !== "unknown") {
    features.taskIntent = intentFromQuestion(features.questionKind);
  }

  if (features.mechanicalChange) {
    features.taskIntent = "develop";
    explanation.push({
      rule: "policy.mechanical-overrides-refactor",
      detail: "Mechanical change markers win over refactor/develop flavor text",
    });
  }

  if (features.taskIntent === "unknown") {
    features.taskIntent = "develop";
    explanation.push({
      rule: "default.intent",
      detail: "No stronger intent contract matched; defaulting to develop",
    });
  }

  return { features, explanation };
}

function intentFromQuestion(kind: QuestionKind): RoutingFeatures["taskIntent"] {
  switch (kind) {
    case "how":
    case "why":
    case "observe":
    case "prototype":
    case "blast-radius":
    case "domain":
      return "investigate";
    case "debug":
      return "debug";
    case "refactor":
      return "refactor";
    case "review":
      return "review";
    case "develop":
      return "develop";
    default:
      return "unknown";
  }
}

export function uncertaintyFor(features: RoutingFeatures): Array<{
  kind: UncertaintyKind;
  resolution: string;
}> {
  const items: Array<{ kind: UncertaintyKind; resolution: string }> = [];
  if (
    features.questionKind === "how" ||
    features.taskIntent === "develop" ||
    features.taskIntent === "debug"
  ) {
    items.push({ kind: "implementation", resolution: "source exploration (how)" });
  }
  if (features.historicalNeed || features.questionKind === "why") {
    items.push({
      kind: "historical",
      resolution: "version history, ADRs, issues, design docs",
    });
  }
  if (
    features.runtimeNeed ||
    features.questionKind === "observe" ||
    features.taskIntent === "debug"
  ) {
    items.push({ kind: "runtime", resolution: "observe the running system" });
  }
  if (features.empiricalNeed || features.questionKind === "prototype") {
    items.push({ kind: "empirical", resolution: "bounded prototype / experiment" });
  }
  if (features.humanPreferenceLikely || features.questionKind === "domain") {
    items.push({
      kind: "domain",
      resolution: "domain modeling; ask a stakeholder only if the environment cannot answer",
    });
  }
  items.push({
    kind: "deterministic",
    resolution: "prefer git, tests, compilers, and CLIs over model recollection",
  });
  return items;
}
