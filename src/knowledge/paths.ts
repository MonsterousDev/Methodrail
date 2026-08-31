import { isAbsolute, normalize, resolve, sep } from "node:path";
import type { KnowledgeNote } from "./types.js";

const GLOB_LIKE = /[*?[\]]/;
const DRIVE_ABSOLUTE = /^[a-zA-Z]:[\\/]/;

export function canonicalizeRepoPath(declared: string): string | undefined {
  if (declared.includes("\0")) return undefined;
  let path = declared.trim().replaceAll("\\", "/");
  while (path.startsWith("./")) path = path.slice(2);
  while (path.endsWith("/") && path.length > 1) path = path.slice(0, -1);
  if (!path || path === ".") return undefined;
  if (isAbsolute(path) || path.startsWith("/") || DRIVE_ABSOLUTE.test(declared.trim())) return undefined;
  if (GLOB_LIKE.test(path)) return undefined;
  const segments = path.split("/");
  if (segments.some((segment) => segment === "" || segment === "." || segment === "..")) return undefined;
  return path;
}

export function pathEscapesRepository(projectRoot: string, declared: string): boolean {
  if (declared.includes("\0") || isAbsolute(declared) || DRIVE_ABSOLUTE.test(declared.trim())) return true;
  const normalized = normalize(declared);
  if (normalized.startsWith(`..${sep}`) || normalized === "..") return true;
  const resolved = resolve(projectRoot, declared);
  const root = resolve(projectRoot);
  return resolved === root || !resolved.startsWith(root + sep);
}

export function isValidScopePath(declared: string): boolean {
  return canonicalizeRepoPath(declared) !== undefined;
}

export function pathIsPrefixOf(prefix: string, candidate: string): boolean {
  const parent = canonicalizeRepoPath(prefix);
  const child = canonicalizeRepoPath(candidate);
  if (!parent || !child) return false;
  if (parent === child) return true;
  return child.startsWith(`${parent}/`);
}

export function noteIdentity(note: KnowledgeNote): string | undefined {
  const rel = note.relativePath.replaceAll("\\", "/");
  const match = /(?:^|\/)\.methodrail\/(knowledge\/.+\.md)$/i.exec(rel);
  const identity = match?.[1];
  if (!identity || /knowledge\/decisions\//i.test(identity)) return undefined;
  return identity;
}

export function parseNoteIdentity(href: string): string | undefined {
  let path = href.trim().replaceAll("\\", "/").replace(/^\.\//, "").split("#", 1)[0] ?? "";
  if (path.startsWith(".methodrail/")) path = path.slice(".methodrail/".length);
  if (!/^knowledge\/[^/].+\.md$/i.test(path)) return undefined;
  if (path.includes("\0") || path.includes("..") || /knowledge\/decisions\//i.test(path)) return undefined;
  if (GLOB_LIKE.test(path)) return undefined;
  return path;
}

export function identitiesEqual(left: string, right: string): boolean {
  return left.replaceAll("\\", "/").toLowerCase() === right.replaceAll("\\", "/").toLowerCase();
}

export function noteHasIdentity(note: KnowledgeNote, identity: string): boolean {
  const own = noteIdentity(note);
  const parsed = parseNoteIdentity(identity);
  if (!own || !parsed) return false;
  return identitiesEqual(own, parsed);
}
