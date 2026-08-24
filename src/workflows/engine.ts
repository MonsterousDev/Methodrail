import type { WorkflowDefinition } from "../types.js";

export interface WorkflowInspection {
  id: string;
  entry: string;
  states: string[];
  reachable: string[];
  terminals: string[];
  skillsReferenced: string[];
  allowCodeModification: boolean;
  completion: string[];
}

export function inspectWorkflow(wf: WorkflowDefinition): WorkflowInspection {
  const reachable = walk(wf, wf.entry);
  const terminals = Object.entries(wf.states)
    .filter(([, s]) => s.terminal === true || !s.on_complete || s.on_complete.length === 0)
    .map(([id]) => id);
  const skills = new Set<string>();
  for (const state of Object.values(wf.states)) {
    for (const skill of state.skills ?? []) skills.add(skill);
  }
  for (const route of wf.question_routing ?? []) {
    for (const skill of route.skills) skills.add(skill);
  }
  return {
    id: wf.id,
    entry: wf.entry,
    states: Object.keys(wf.states),
    reachable: [...reachable],
    terminals,
    skillsReferenced: [...skills].sort(),
    allowCodeModification: wf.constraints?.allow_code_modification === true,
    completion: wf.completion.requires,
  };
}

export function nextStates(wf: WorkflowDefinition, current: string): string[] {
  return wf.states[current]?.on_complete ?? [];
}

export function isTerminal(wf: WorkflowDefinition, current: string): boolean {
  const state = wf.states[current];
  if (!state) return false;
  return state.terminal === true || !state.on_complete || state.on_complete.length === 0;
}

function walk(wf: WorkflowDefinition, start: string): Set<string> {
  const seen = new Set<string>();
  const queue = [start];
  while (queue.length > 0) {
    const current = queue.pop();
    if (!current || seen.has(current)) continue;
    seen.add(current);
    const state = wf.states[current];
    if (!state) continue;
    queue.push(...(state.on_complete ?? []), ...(state.on_blocked ?? []));
  }
  return seen;
}
