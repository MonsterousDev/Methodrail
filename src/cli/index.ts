#!/usr/bin/env node
import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { inspectWorkflow } from "../workflows/engine.js";
import { loadRegistry, getSkill, getWorkflow } from "../registry/index.js";
import { validateRepository } from "../validation/index.js";
import { runEvals } from "../evals/runner.js";
import { generateAdapters, ADAPTER_TARGETS } from "../adapters/generate.js";
import { initProject } from "../init/skeleton.js";
import { route } from "../routing/index.js";
import { methodrailRoot } from "../paths.js";
import type { AdapterTarget } from "../adapters/generate.js";

interface Flags {
  json?: boolean;
  root?: string;
  out?: string;
  help?: boolean;
}

function parseArgs(argv: string[]): { command: string; args: string[]; flags: Flags } {
  const flags: Flags = {};
  const positional: string[] = [];
  for (let i = 0; i < argv.length; i += 1) {
    const token = argv[i];
    if (token === undefined) break;
    if (token === "--json") flags.json = true;
    else if (token === "--help" || token === "-h") flags.help = true;
    else if (token === "--root") {
      const value = argv[i + 1];
      if (value) flags.root = value;
      i += 1;
    } else if (token === "--out") {
      const value = argv[i + 1];
      if (value) flags.out = value;
      i += 1;
    } else if (token.startsWith("--root=")) flags.root = token.slice("--root=".length);
    else if (token.startsWith("--out=")) flags.out = token.slice("--out=".length);
    else positional.push(token);
  }
  const [command = "help", ...args] = positional;
  return { command, args, flags };
}

function print(data: unknown, flags: Flags): void {
  if (flags.json) {
    process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
    return;
  }
  if (typeof data === "string") {
    process.stdout.write(`${data}\n`);
    return;
  }
  process.stdout.write(`${JSON.stringify(data, null, 2)}\n`);
}

function usage(): string {
  return `methodrail — evidence-driven methodology for AI coding agents

Usage:
  methodrail validate
  methodrail list skills|workflows|principles|adapters|schemas
  methodrail show skill <name>
  methodrail show workflow <name>
  methodrail eval [routing|pressure|skill <name>]
  methodrail generate-adapter <cursor|claude-code|codex|generic|all>
  methodrail init [dir]
  methodrail check
  methodrail route <prompt>

Options:
  --root <path>   Methodrail package root (default: this package)
  --out <path>    Adapter output directory
  --json          Machine-readable output
`;
}

function main(argv = process.argv.slice(2)): number {
  const { command, args, flags } = parseArgs(argv);
  if (flags.help || command === "help") {
    process.stdout.write(usage());
    return 0;
  }
  const root = flags.root ? resolve(flags.root) : methodrailRoot();

  try {
    switch (command) {
      case "validate": {
        const result = validateRepository(root);
        print(
          flags.json
            ? result
            : result.ok
              ? "ok"
              : result.issues.map((i) => `${i.path}: ${i.message}`).join("\n"),
          flags,
        );
        return result.ok ? 0 : 1;
      }
      case "list": {
        const registry = loadRegistry(root);
        const what = args[0] ?? "skills";
        if (what === "skills") print(registry.skills.map((s) => s.id), flags);
        else if (what === "workflows") print(registry.workflows.map((w) => w.id), flags);
        else if (what === "principles") print(registry.principles.map((p) => p.id), flags);
        else if (what === "adapters") print(registry.adapters, flags);
        else if (what === "schemas") print(registry.schemas, flags);
        else {
          process.stderr.write(`Unknown list target "${what}"\n`);
          return 1;
        }
        return 0;
      }
      case "show": {
        const kind = args[0];
        const name = args[1];
        if (!kind || !name) {
          process.stderr.write("usage: methodrail show skill|workflow <name>\n");
          return 1;
        }
        const registry = loadRegistry(root);
        if (kind === "skill") {
          const skill = getSkill(registry, name);
          if (!skill) {
            process.stderr.write(`Unknown skill "${name}"\n`);
            return 1;
          }
          print(skill.metadata, flags);
          if (!flags.json) {
            process.stdout.write(`\n# ${skill.id}\n\n${skill.metadata.summary}\n`);
            process.stdout.write(`invocation: ${skill.metadata.invocation.modes.join(", ")}\n`);
            process.stdout.write(`completion: ${skill.metadata.completion.requires.join(", ")}\n`);
          }
          return 0;
        }
        if (kind === "workflow") {
          const wf = getWorkflow(registry, name);
          if (!wf) {
            process.stderr.write(`Unknown workflow "${name}"\n`);
            return 1;
          }
          print(flags.json ? wf : inspectWorkflow(wf), flags);
          return 0;
        }
        process.stderr.write(`Unknown show target "${kind}"\n`);
        return 1;
      }
      case "eval": {
        const kind = args[0];
        const skill = kind === "skill" ? args[1] : undefined;
        const report = runEvals({
          root,
          ...(kind
            ? { filter: { kind, ...(skill ? { skill } : {}) } }
            : {}),
        });
        if (flags.json) print(report, flags);
        else {
          for (const result of report.results) {
            const mark = result.status === "pass" ? "PASS" : result.status === "skip" ? "SKIP" : "FAIL";
            process.stdout.write(`${mark}  ${result.id}\n`);
            for (const message of result.messages) process.stdout.write(`      ${message}\n`);
          }
          process.stdout.write(
            `\n${report.passed} passed, ${report.failed} failed, ${report.skipped} skipped\n`,
          );
        }
        return report.failed === 0 ? 0 : 1;
      }
      case "generate-adapter": {
        const target = (args[0] ?? "all") as AdapterTarget | "all";
        if (target !== "all" && !(ADAPTER_TARGETS as readonly string[]).includes(target)) {
          process.stderr.write(`Unknown adapter "${target}"\n`);
          return 1;
        }
        const written = generateAdapters({
          root,
          target,
          ...(flags.out ? { outDir: resolve(flags.out) } : {}),
        });
        print(flags.json ? written : `wrote ${written.length} files`, flags);
        return 0;
      }
      case "init": {
        const dir = resolve(args[0] ?? process.cwd());
        const result = initProject(dir);
        print(result, flags);
        return 0;
      }
      case "check": {
        const validation = validateRepository(root);
        const evals = runEvals({ root });
        const ok = validation.ok && evals.failed === 0;
        print(
          {
            validation: validation.ok ? "ok" : validation.issues,
            evals: { passed: evals.passed, failed: evals.failed, skipped: evals.skipped },
          },
          { json: true },
        );
        return ok ? 0 : 1;
      }
      case "route": {
        const prompt = args.join(" ").trim();
        if (!prompt) {
          process.stderr.write("usage: methodrail route <prompt>\n");
          return 1;
        }
        print(route({ prompt }), { json: true });
        return 0;
      }
      default:
        process.stderr.write(`Unknown command "${command}"\n\n${usage()}`);
        return 1;
    }
  } catch (err) {
    process.stderr.write(`${(err as Error).stack ?? (err as Error).message}\n`);
    return 1;
  }
}

const exit = main();
process.exitCode = exit;
