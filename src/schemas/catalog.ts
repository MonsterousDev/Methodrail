import { readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import * as Ajv2020Module from "ajv/dist/2020.js";
import * as addFormatsModule from "ajv-formats";
import { parse as parseYaml } from "yaml";
import type { ValidationIssue, ValidationResult } from "../types.js";
import { pathsFor, methodrailRoot } from "../paths.js";

type AjvError = {
  instancePath: string;
  message?: string;
  schemaPath?: string;
  params?: Record<string, unknown>;
};

type ValidateFn = ((data: unknown) => boolean) & { errors?: AjvError[] | null };

interface AjvLike {
  addSchema: (schema: object) => AjvLike;
  getSchema: (id: string) => ValidateFn | undefined;
}

const Ajv2020 = (
  Ajv2020Module as unknown as { default: new (opts?: object) => AjvLike }
).default;
const addFormats = (
  addFormatsModule as unknown as { default: (ajv: AjvLike) => void }
).default;

const SCHEMA_FILES: Record<string, string> = {
  skill: "skill.schema.json",
  workflow: "workflow.schema.json",
  evidence: "evidence.schema.json",
  knowledge: "knowledge.schema.json",
  decision: "decision.schema.json",
  "decision-map": "decision-map.schema.json",
  task: "task.schema.json",
  observation: "observation.schema.json",
  "context-packet": "context-packet.schema.json",
  "result-packet": "result-packet.schema.json",
  "review-packet": "review-packet.schema.json",
  "control-adapter": "control-adapter.schema.json",
  "eval-fixture": "eval-fixture.schema.json",
  rigor: "rigor.schema.json",
};

export type SchemaName = keyof typeof SCHEMA_FILES;

let cached: AjvLike | undefined;
let cachedRoot: string | undefined;

export function listSchemaNames(): SchemaName[] {
  return Object.keys(SCHEMA_FILES) as SchemaName[];
}

export function loadSchemaDocument(name: SchemaName, root = methodrailRoot()): object {
  const file = SCHEMA_FILES[name];
  if (!file) throw new Error(`Unknown schema ${name}`);
  const raw = readFileSync(join(pathsFor(root).protocols, file), "utf8");
  return JSON.parse(raw) as object;
}

export function getAjv(root = methodrailRoot()): AjvLike {
  if (cached && cachedRoot === root) {
    return cached;
  }
  const ajv = new Ajv2020({
    allErrors: true,
    strict: false,
    allowUnionTypes: true,
  });
  addFormats(ajv);
  for (const name of listSchemaNames()) {
    ajv.addSchema(loadSchemaDocument(name, root));
  }
  cached = ajv;
  cachedRoot = root;
  return ajv;
}

export function resetAjvCache(): void {
  cached = undefined;
  cachedRoot = undefined;
}

export function formatAjvErrors(errors: AjvError[] | null | undefined): ValidationIssue[] {
  if (!errors || errors.length === 0) {
    return [];
  }
  return errors.map((err) => {
    const instancePath = err.instancePath === "" ? "/" : err.instancePath;
    const suffix = err.params && "additionalProperty" in err.params
      ? ` (unexpected property "${String((err.params as { additionalProperty: string }).additionalProperty)}")`
      : "";
    return {
      path: instancePath,
      message: `${err.message ?? "validation error"}${suffix}`,
      ...(typeof err.schemaPath === "string" ? { schema: err.schemaPath } : {}),
    };
  });
}

export function validateAgainst(
  schemaName: SchemaName,
  data: unknown,
  root = methodrailRoot(),
): ValidationResult {
  const ajv = getAjv(root);
  const schema = loadSchemaDocument(schemaName, root) as { $id: string };
  const validate = ajv.getSchema(schema.$id);
  if (!validate) {
    return {
      ok: false,
      issues: [{ path: "/", message: `Schema ${schemaName} was not registered` }],
    };
  }
  const ok = validate(data);
  if (ok) {
    return { ok: true, issues: [] };
  }
  return { ok: false, issues: formatAjvErrors(validate.errors) };
}

export function parseYamlDocument(raw: string): unknown {
  return parseYaml(raw);
}

export function readYamlFile(filePath: string): unknown {
  return parseYaml(readFileSync(filePath, "utf8"));
}

export function readJsonFile(filePath: string): unknown {
  return JSON.parse(readFileSync(filePath, "utf8"));
}

export function listProtocolFiles(root = methodrailRoot()): string[] {
  return readdirSync(pathsFor(root).protocols).filter((f) => f.endsWith(".schema.json"));
}
