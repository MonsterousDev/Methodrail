import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { dirname, join, relative } from "node:path";

const OVERLAY_MANIFEST = ".methodrail-overlay.json";

const orig = process.argv[2];
const work = process.argv[3];
const out = process.argv[4];
if (!orig || !work || !out) {
  console.error("usage: extract-overlay.mjs <original-repo> <work-repo> <overlay-out>");
  process.exit(1);
}

function walk(root, current = root, files = []) {
  if (!existsSync(current)) return files;
  for (const name of readdirSync(current)) {
    if (name === "node_modules" || name === ".git") continue;
    const path = join(current, name);
    if (statSync(path).isDirectory()) walk(root, path, files);
    else files.push(relative(root, path));
  }
  return files;
}

const origFiles = new Set(walk(orig));
const workFiles = walk(work);
const workFileSet = new Set(workFiles);
mkdirSync(out, { recursive: true });
let copied = 0;
for (const rel of workFiles) {
  const a = join(orig, rel);
  const b = join(work, rel);
  const src = readFileSync(b);
  const same = existsSync(a) && readFileSync(a).equals(src);
  if (same) continue;
  const dest = join(out, rel);
  mkdirSync(dirname(dest), { recursive: true });
  writeFileSync(dest, src);
  copied += 1;
}
const deletions = [...origFiles].filter((rel) => !workFileSet.has(rel)).sort();
writeFileSync(join(out, OVERLAY_MANIFEST), `${JSON.stringify({ deletions }, null, 2)}\n`);
console.log(`copied ${copied} changed files and recorded ${deletions.length} deletions to ${out}`);
