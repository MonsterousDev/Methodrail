import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { basename, join } from "node:path";
import type {
  PrincipleRecord,
  RigorLevel,
  SkillRecord,
  WorkflowDefinition,
} from "../types.js";
import { methodrailRoot, pathsFor } from "../paths.js";
import { readYamlFile } from "../schemas/catalog.js";
import { loadSkillMetadata } from "../validation/skill-workflow.js";

export interface Registry {
  root: string;
  skills: SkillRecord[];
  workflows: WorkflowDefinition[];
  principles: PrincipleRecord[];
  schemas: string[];
  adapters: string[];
}

export function loadRegistry(root = methodrailRoot()): Registry {
  const paths = pathsFor(root);
  return {
    root,
    skills: loadSkills(paths.skills),
    workflows: loadWorkflows(paths.workflows),
    principles: loadPrinciples(paths.principles),
    schemas: existsSync(paths.protocols)
      ? readdirSync(paths.protocols).filter((f) => f.endsWith(".schema.json"))
      : [],
    adapters: existsSync(paths.adapters)
      ? readdirSync(paths.adapters).filter((name) =>
          statSync(join(paths.adapters, name)).isDirectory(),
        )
      : [],
  };
}

export function loadSkills(skillsDir: string): SkillRecord[] {
  if (!existsSync(skillsDir)) return [];
  return readdirSync(skillsDir)
    .map((name) => join(skillsDir, name))
    .filter((dir) => statSync(dir).isDirectory())
    .map((dir) => {
      const evalDir = join(dir, "evals");
      const evalFiles = existsSync(evalDir)
        ? readdirSync(evalDir).filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
        : [];
      return {
        id: basename(dir),
        dir,
        metadata: loadSkillMetadata(dir),
        skillMd: readFileSync(join(dir, "SKILL.md"), "utf8"),
        hasScripts: existsSync(join(dir, "scripts")),
        hasReferences: existsSync(join(dir, "references")),
        evalFiles,
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function loadWorkflows(workflowsDir: string): WorkflowDefinition[] {
  if (!existsSync(workflowsDir)) return [];
  return readdirSync(workflowsDir)
    .filter((f) => f.endsWith(".yaml") || f.endsWith(".yml"))
    .map((f) => readYamlFile(join(workflowsDir, f)) as WorkflowDefinition)
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function loadPrinciples(principlesDir: string): PrincipleRecord[] {
  if (!existsSync(principlesDir)) return [];
  return readdirSync(principlesDir)
    .filter((f) => f.endsWith(".md") && f !== "README.md")
    .map((f) => {
      const path = join(principlesDir, f);
      const body = readFileSync(path, "utf8");
      const titleMatch = body.match(/^#\s+(.+)$/m);
      return {
        id: f.replace(/\.md$/, ""),
        path,
        title: titleMatch?.[1] ?? f.replace(/\.md$/, ""),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));
}

export function skillsProviding(registry: Registry, capability: string): SkillRecord[] {
  return registry.skills.filter((s) =>
    (s.metadata.capabilities?.provides ?? []).includes(capability),
  );
}

export function skillsValidForRigor(registry: Registry, rigor: RigorLevel): SkillRecord[] {
  return registry.skills.filter((s) => s.metadata.rigor.minimum <= rigor);
}

export function skillsUsableImplicitly(registry: Registry): SkillRecord[] {
  return registry.skills.filter((s) => s.metadata.invocation.modes.includes("implicit"));
}

export function skillsProducingKnowledge(
  registry: Registry,
  knowledgeType: string,
): SkillRecord[] {
  return registry.skills.filter((s) =>
    (s.metadata.knowledge?.produces ?? []).includes(knowledgeType),
  );
}

export function getSkill(registry: Registry, id: string): SkillRecord | undefined {
  return registry.skills.find((s) => s.id === id);
}

export function getWorkflow(registry: Registry, id: string): WorkflowDefinition | undefined {
  return registry.workflows.find((w) => w.id === id);
}
