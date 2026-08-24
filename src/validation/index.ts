import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import type { ValidationIssue, ValidationResult } from "../types.js";
import { methodrailRoot, pathsFor } from "../paths.js";
import { listProtocolFiles, readYamlFile } from "../schemas/catalog.js";
import {
  issuesToResult,
  validateEvalFixtureFile,
  validateRigorConfig,
  validateSkillDirectory,
  validateWorkflowFile,
} from "./skill-workflow.js";

export function collectEvalFixtureFiles(root = methodrailRoot()): string[] {
  const files: string[] = [];
  walkYamlEvals(join(root, "evals"), files);
  walkYamlEvals(join(root, "skills"), files);
  return files;
}

function walkYamlEvals(dir: string, acc: string[]): void {
  if (!existsSync(dir) || !statSync(dir).isDirectory()) return;
  for (const entry of readdirSync(dir)) {
    if (entry === "node_modules" || entry === "dist") continue;
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      walkYamlEvals(full, acc);
    } else if (
      (full.includes("/evals/") || full.includes("/evals\\")) &&
      (entry.endsWith(".yaml") || entry.endsWith(".yml"))
    ) {
      acc.push(full);
    }
  }
}

export function validateRepository(root = methodrailRoot()): ValidationResult {
  const issues: ValidationIssue[] = [];
  const paths = pathsFor(root);

  for (const file of listProtocolFiles(root)) {
    const full = join(paths.protocols, file);
    try {
      JSON.parse(readFileSync(full, "utf8"));
    } catch (err) {
      issues.push({ path: full, message: `Invalid JSON schema: ${(err as Error).message}` });
    }
  }

  const skillDirs = existsSync(paths.skills)
    ? readdirSync(paths.skills)
        .map((name) => join(paths.skills, name))
        .filter((p) => statSync(p).isDirectory())
    : [];
  if (skillDirs.length === 0) {
    issues.push({ path: paths.skills, message: "No skills discovered" });
  }
  for (const dir of skillDirs) {
    issues.push(...validateSkillDirectory(dir, root).issues);
  }

  const workflowFiles = existsSync(paths.workflows)
    ? readdirSync(paths.workflows)
        .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
        .map((f) => join(paths.workflows, f))
    : [];
  if (workflowFiles.length === 0) {
    issues.push({ path: paths.workflows, message: "No workflows discovered" });
  }
  for (const file of workflowFiles) {
    issues.push(...validateWorkflowFile(file, root).issues);
  }

  issues.push(...validateRigorConfig(root).issues);

  const principleFiles = existsSync(paths.principles)
    ? readdirSync(paths.principles).filter((f) => f.endsWith(".md") && f !== "README.md")
    : [];
  if (principleFiles.length < 8) {
    issues.push({
      path: paths.principles,
      message: `Expected at least 8 principle documents, found ${principleFiles.length}`,
    });
  }

  for (const file of collectEvalFixtureFiles(root)) {
    issues.push(...validateEvalFixtureFile(file, root).issues);
  }

  const adapterDirs = existsSync(paths.adapters)
    ? readdirSync(paths.adapters).filter((name) =>
        statSync(join(paths.adapters, name)).isDirectory(),
      )
    : [];
  for (const required of ["cursor", "claude-code", "codex", "generic"]) {
    if (!adapterDirs.includes(required)) {
      issues.push({ path: paths.adapters, message: `Missing adapter directory: ${required}` });
    }
  }

  const skillIds = new Set(skillDirs.map((d) => d.split(/[/\\]/).pop() ?? d));
  for (const file of workflowFiles) {
    const wf = readYamlFile(file) as {
      states?: Record<string, { skills?: string[] }>;
      question_routing?: Array<{ skills?: string[] }>;
    };
    const referenced = new Set<string>();
    for (const state of Object.values(wf.states ?? {})) {
      for (const skill of state.skills ?? []) referenced.add(skill);
    }
    for (const route of wf.question_routing ?? []) {
      for (const skill of route.skills ?? []) referenced.add(skill);
    }
    for (const skill of referenced) {
      if (!skillIds.has(skill)) {
        issues.push({ path: file, message: `Workflow references unknown skill "${skill}"` });
      }
    }
  }

  return issuesToResult(issues);
}

export {
  hasHeading,
  issuesToResult,
  loadSkillMetadata,
  parseFrontmatter,
  reachableStates,
  REQUIRED_SKILL_HEADINGS,
  validateEvalFixtureFile,
  validateRigorConfig,
  validateSkillDirectory,
  validateWorkflowFile,
} from "./skill-workflow.js";
