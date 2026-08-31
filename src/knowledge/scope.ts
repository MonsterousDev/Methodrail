import type { KnowledgeNote } from "./types.js";
import { canonicalizeRepoPath, pathIsPrefixOf } from "./paths.js";

export const SCOPE_STATES = ["unbounded", "applicable", "partial", "not-applicable", "unknown"] as const;
export type ScopeState = (typeof SCOPE_STATES)[number];

export interface ScopeResult {
  state: ScopeState;
  evidence: string;
  matched: string[];
  excluded: string[];
  outside: string[];
}

export class InvalidTaskPathError extends Error {
  constructor(readonly declared: string) {
    super(`Invalid task path: ${declared}`);
    this.name = "InvalidTaskPathError";
  }
}

function stable(paths: string[]): string[] {
  return [...new Set(paths)].sort((left, right) => left.localeCompare(right));
}

function classifyTaskPath(
  taskPath: string,
  include: string[] | undefined,
  exclude: string[],
): "matched" | "excluded" | "outside" {
  if (exclude.some((prefix) => pathIsPrefixOf(prefix, taskPath))) return "excluded";
  if (!include) return "matched";
  if (include.some((prefix) => pathIsPrefixOf(prefix, taskPath))) return "matched";
  return "outside";
}

export function evaluateScope(note: KnowledgeNote, taskPaths: string[]): ScopeResult {
  const canonicalTasks: string[] = [];
  for (const declared of taskPaths) {
    const canonical = canonicalizeRepoPath(declared);
    if (!canonical) throw new InvalidTaskPathError(declared);
    canonicalTasks.push(canonical);
  }
  const tasks = stable(canonicalTasks);
  if (tasks.length === 0) {
    return { state: "unknown", evidence: "No explicit task paths", matched: [], excluded: [], outside: [] };
  }
  const scope = note.frontmatter?.scope;
  if (note.classification !== "typed" || !scope) {
    return {
      state: "unbounded",
      evidence: "Note has no scope block",
      matched: tasks,
      excluded: [],
      outside: [],
    };
  }
  const include = scope.include_paths;
  const exclude = scope.exclude_paths ?? [];
  const matched: string[] = [];
  const excluded: string[] = [];
  const outside: string[] = [];
  for (const taskPath of tasks) {
    const bucket = classifyTaskPath(taskPath, include, exclude);
    if (bucket === "matched") matched.push(taskPath);
    else if (bucket === "excluded") excluded.push(taskPath);
    else outside.push(taskPath);
  }
  const sortedMatched = stable(matched);
  const sortedExcluded = stable(excluded);
  const sortedOutside = stable(outside);
  if (sortedMatched.length === tasks.length && sortedExcluded.length === 0 && sortedOutside.length === 0) {
    return {
      state: "applicable",
      evidence: `All task paths are in scope: ${sortedMatched.join(", ")}`,
      matched: sortedMatched,
      excluded: sortedExcluded,
      outside: sortedOutside,
    };
  }
  if (sortedMatched.length === 0) {
    return {
      state: "not-applicable",
      evidence: `No task paths are in scope (excluded: ${sortedExcluded.join(", ") || "none"}; outside: ${sortedOutside.join(", ") || "none"})`,
      matched: sortedMatched,
      excluded: sortedExcluded,
      outside: sortedOutside,
    };
  }
  return {
    state: "partial",
    evidence: `Some task paths are in scope (matched: ${sortedMatched.join(", ")}; excluded: ${sortedExcluded.join(", ") || "none"}; outside: ${sortedOutside.join(", ") || "none"})`,
    matched: sortedMatched,
    excluded: sortedExcluded,
    outside: sortedOutside,
  };
}
