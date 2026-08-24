import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { dirname, join, resolve } from "node:path";
import { pathToFileURL } from "node:url";
import { hostProjections, readCanonicalInvariant } from "./family-invariant.js";

export function projectFamilyInvariant(root: string): string[] {
  const body = readCanonicalInvariant(root);
  const written: string[] = [];
  for (const [relativePath, contents] of Object.entries(hostProjections(body))) {
    const path = join(root, relativePath);
    mkdirSync(dirname(path), { recursive: true });
    writeFileSync(path, contents);
    written.push(relativePath);
  }
  return written;
}

function main(): void {
  const root = resolve(process.argv[2] ?? process.cwd());
  if (!existsSync(join(root, "package.json"))) {
    throw new Error("project-family-invariant must run from the Methodrail repository");
  }
  const written = projectFamilyInvariant(root);
  console.log(`Projected family invariant to:\n${written.join("\n")}`);
}

if (import.meta.url === pathToFileURL(process.argv[1] ?? "").href) main();
