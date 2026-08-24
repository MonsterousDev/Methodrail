import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { existsSync } from "node:fs";

const here = dirname(fileURLToPath(import.meta.url));

/**
 * Methodrail package root (the repository when developing; the installed
 * package root when consumed as a dependency).
 */
export function methodrailRoot(): string {
  const fromSrc = join(here, "..");
  const fromDist = join(here, "..");
  if (existsSync(join(fromSrc, "protocols")) && existsSync(join(fromSrc, "skills"))) {
    return fromSrc;
  }
  if (existsSync(join(fromDist, "protocols"))) {
    return fromDist;
  }
  return fromSrc;
}

export function pathsFor(root: string = methodrailRoot()) {
  return {
    root,
    skills: join(root, "skills"),
    workflows: join(root, "workflows"),
    protocols: join(root, "protocols"),
    principles: join(root, "principles"),
    knowledge: join(root, "knowledge"),
    rigor: join(root, "rigor", "levels.yaml"),
    adapters: join(root, "adapters"),
    evals: join(root, "evals"),
  };
}

export type MethodrailPaths = ReturnType<typeof pathsFor>;
