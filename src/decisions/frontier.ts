import type { Decision } from "../types.js";

export interface Territory {
  known: string[];
  frontier: string[];
  fog: string[];
}

/** A question is on the frontier when every prerequisite is known. Do not ask fog questions. */
export function classifyTerritory(nodes: Decision[]): Territory {
  const byId = new Map(nodes.map((n) => [n.id, n]));
  const known = nodes.filter((n) => n.status === "known").map((n) => n.id);
  const knownSet = new Set(known);
  const frontier: string[] = [];
  const fog: string[] = [];

  for (const node of nodes) {
    if (node.status === "known") continue;
    const deps = node.depends_on ?? [];
    const ready = deps.every((dep) => knownSet.has(dep) || byId.get(dep)?.status === "known");
    if (node.status === "blocked" || !ready) fog.push(node.id);
    else frontier.push(node.id);
  }

  return { known, frontier, fog };
}

export function readyQuestions(nodes: Decision[]): Decision[] {
  const { frontier } = classifyTerritory(nodes);
  const set = new Set(frontier);
  return nodes.filter((n) => set.has(n.id));
}
