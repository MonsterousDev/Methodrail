import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import { parse as parseYaml } from "yaml";
import type {
  SkillMetadata,
  ValidationIssue,
  ValidationResult,
  WorkflowDefinition,
} from "../types.js";
import { methodrailRoot, pathsFor } from "../paths.js";
import { readYamlFile, validateAgainst } from "../schemas/catalog.js";

export const REQUIRED_SKILL_HEADINGS = [
  "Problem",
  "Observed failure",
  "When to activate",
  "When not to activate",
  "Required context",
  "Method",
  "Permitted evidence",
  "Side effects",
  "Completion",
  "Artifacts",
  "What survives",
  "Evaluation",
] as const;

export function issuesToResult(issues: ValidationIssue[]): ValidationResult {
  return { ok: issues.length === 0, issues };
}

export function isObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export function parseFrontmatter(
  md: string,
): { name?: string; description?: string } | undefined {
  if (!md.startsWith("---")) return undefined;
  const end = md.indexOf("\n---", 3);
  if (end === -1) return undefined;
  const block = md.slice(3, end).trim();
  const parsed: unknown = parseYaml(block);
  if (!isObject(parsed)) return undefined;
  return {
    ...(typeof parsed.name === "string" ? { name: parsed.name } : {}),
    ...(typeof parsed.description === "string" ? { description: parsed.description } : {}),
  };
}

export function loadSkillMetadata(dir: string): SkillMetadata {
  return readYamlFile(join(dir, "skill.yaml")) as SkillMetadata;
}

export function hasHeading(md: string, heading: string): boolean {
  const pattern = new RegExp(`^#{1,3}\\s+${escapeRegExp(heading)}\\s*$`, "im");
  return pattern.test(md);
}

export function validateSkillDirectory(dir: string, root = methodrailRoot()): ValidationResult {
  const issues: ValidationIssue[] = [];
  const id = basename(dir);
  const yamlPath = join(dir, "skill.yaml");
  const mdPath = join(dir, "SKILL.md");

  if (!existsSync(yamlPath)) issues.push({ path: yamlPath, message: "Missing skill.yaml" });
  if (!existsSync(mdPath)) issues.push({ path: mdPath, message: "Missing SKILL.md" });
  if (issues.length > 0) return issuesToResult(issues);

  let metadata: unknown;
  try {
    metadata = readYamlFile(yamlPath);
  } catch (err) {
    return issuesToResult([{ path: yamlPath, message: `Invalid YAML: ${(err as Error).message}` }]);
  }

  const schemaResult = validateAgainst("skill", metadata, root);
  for (const issue of schemaResult.issues) {
    issues.push({ ...issue, path: `${yamlPath}${issue.path}` });
  }

  if (isObject(metadata)) {
    if (metadata.id !== id) {
      issues.push({
        path: `${yamlPath}/id`,
        message: `skill.yaml id "${String(metadata.id)}" must match directory name "${id}"`,
      });
    }
    const invocation = isObject(metadata.invocation) ? metadata.invocation : undefined;
    const modes = invocation && Array.isArray(invocation.modes) ? invocation.modes : [];
    const cost = isObject(metadata.cost) ? metadata.cost : undefined;
    const rigor = isObject(metadata.rigor) ? metadata.rigor : undefined;
    const expensive = cost?.tokens === "high" || cost?.latency === "high";
    const highRigor = typeof rigor?.minimum === "number" && rigor.minimum >= 4;
    if (modes.includes("implicit") && (expensive || highRigor)) {
      issues.push({
        path: `${yamlPath}/invocation/modes`,
        message:
          "High-cost or high-rigor skills must not use implicit invocation; use explicit or workflow-only",
      });
    }
  }

  const md = readFileSync(mdPath, "utf8");
  const frontmatter = parseFrontmatter(md);
  if (!frontmatter) {
    issues.push({
      path: mdPath,
      message: "SKILL.md must start with YAML frontmatter containing name and description",
    });
  } else {
    if (frontmatter.name !== id) {
      issues.push({
        path: `${mdPath}/name`,
        message: `SKILL.md name "${frontmatter.name}" must match directory name "${id}"`,
      });
    }
    if (!frontmatter.description || frontmatter.description.length < 20) {
      issues.push({
        path: `${mdPath}/description`,
        message: "SKILL.md description must explain what the skill does and when to use it",
      });
    }
  }

  for (const heading of REQUIRED_SKILL_HEADINGS) {
    if (!hasHeading(md, heading)) {
      issues.push({ path: mdPath, message: `SKILL.md is missing required heading "${heading}"` });
    }
  }

  const evalsDir = join(dir, "evals");
  if (!existsSync(evalsDir) || !statSync(evalsDir).isDirectory()) {
    issues.push({ path: evalsDir, message: "Skill is missing evals/ directory" });
  } else {
    const evalFiles = readdirSync(evalsDir).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"));
    if (evalFiles.length === 0) {
      issues.push({ path: evalsDir, message: "Skill evals/ must contain at least one YAML fixture" });
    } else if (!evalFiles.join(" ").toLowerCase().includes("routing")) {
      issues.push({ path: evalsDir, message: "Skill evals must include routing coverage" });
    }
  }

  return issuesToResult(issues);
}

export function validateWorkflowFile(filePath: string, root = methodrailRoot()): ValidationResult {
  const issues: ValidationIssue[] = [];
  let data: unknown;
  try {
    data = readYamlFile(filePath);
  } catch (err) {
    return issuesToResult([{ path: filePath, message: `Invalid YAML: ${(err as Error).message}` }]);
  }

  const schemaResult = validateAgainst("workflow", data, root);
  for (const issue of schemaResult.issues) {
    issues.push({ ...issue, path: `${filePath}${issue.path}` });
  }
  if (!isObject(data)) return issuesToResult(issues);

  const wf = data as unknown as WorkflowDefinition;
  const expectedId = basename(filePath).replace(/\.(yaml|yml)$/, "");
  if (wf.id !== expectedId) {
    issues.push({
      path: `${filePath}/id`,
      message: `workflow id "${wf.id}" must match filename "${expectedId}"`,
    });
  }
  if (!wf.states[wf.entry]) {
    issues.push({
      path: `${filePath}/entry`,
      message: `entry state "${wf.entry}" is not defined in states`,
    });
  }

  for (const [stateId, state] of Object.entries(wf.states)) {
    const targets = [...(state.on_complete ?? []), ...(state.on_blocked ?? [])];
    for (const target of targets) {
      if (!wf.states[target]) {
        issues.push({
          path: `${filePath}/states/${stateId}`,
          message: `transition target "${target}" does not exist`,
        });
      }
    }
    if (state.kind === "skill" && (!state.skills || state.skills.length === 0) && !state.optional) {
      issues.push({
        path: `${filePath}/states/${stateId}/skills`,
        message: "skill states must list skills or be marked optional",
      });
    }
  }

  if (wf.entry && wf.states[wf.entry]) {
    const reachable = reachableStates(wf);
    for (const stateId of Object.keys(wf.states)) {
      if (!reachable.has(stateId)) {
        issues.push({
          path: `${filePath}/states/${stateId}`,
          message: `state "${stateId}" is unreachable from entry "${wf.entry}"`,
        });
      }
    }
    const terminals = Object.entries(wf.states).filter(
      ([, s]) => s.terminal === true || !s.on_complete || s.on_complete.length === 0,
    );
    if (terminals.length === 0) {
      issues.push({ path: `${filePath}/states`, message: "workflow has no terminal state" });
    } else if (!terminals.some(([id]) => reachable.has(id))) {
      issues.push({
        path: `${filePath}/completion`,
        message: "no terminal state is reachable from entry",
      });
    }
  }

  return issuesToResult(issues);
}

export function reachableStates(wf: WorkflowDefinition): Set<string> {
  const seen = new Set<string>();
  const queue = [wf.entry];
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

export function validateRigorConfig(root = methodrailRoot()): ValidationResult {
  const file = pathsFor(root).rigor;
  if (!existsSync(file)) {
    return issuesToResult([{ path: file, message: "Missing rigor/levels.yaml" }]);
  }
  try {
    const data = readYamlFile(file);
    const result = validateAgainst("rigor", data, root);
    return {
      ok: result.ok,
      issues: result.issues.map((i) => ({ ...i, path: `${file}${i.path}` })),
    };
  } catch (err) {
    return issuesToResult([{ path: file, message: (err as Error).message }]);
  }
}

export function validateEvalFixtureFile(
  filePath: string,
  root = methodrailRoot(),
): ValidationResult {
  try {
    const data = readYamlFile(filePath);
    const result = validateAgainst("eval-fixture", data, root);
    return {
      ok: result.ok,
      issues: result.issues.map((i) => ({ ...i, path: `${filePath}${i.path}` })),
    };
  } catch (err) {
    return issuesToResult([{ path: filePath, message: (err as Error).message }]);
  }
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}
