import { existsSync, readFileSync, statSync } from "node:fs";
import { dirname, relative, resolve, sep } from "node:path";
import { pathInside } from "./fs-walk.js";

export interface ProjectMdQuality {
  ok: boolean;
  issues: string[];
}

const MAX_LINES = 120;
const MAX_CHARS = 8000;

export function evaluateProjectMd(source: string): ProjectMdQuality {
  const issues: string[] = [];
  const lines = source.length === 0 ? 0 : source.split(/\r?\n/).length;
  if (lines > MAX_LINES) {
    issues.push(`PROJECT.md must stay at or below ${MAX_LINES} lines (found ${lines})`);
  }
  if (source.length > MAX_CHARS) {
    issues.push(`PROJECT.md must stay at or below ${MAX_CHARS} characters (found ${source.length})`);
  }
  if (!/\[[^\]]+\]\([^)]+\)/.test(source)) {
    issues.push("PROJECT.md must contain at least one markdown link");
  }
  const fenceMarkers = source.match(/```/g)?.length ?? 0;
  if (fenceMarkers > 4) {
    issues.push("PROJECT.md should stay an index; it contains too many code fences");
  }
  const starts = (source.match(/<!--\s*methodrail:start\s*-->/g) ?? []).length;
  const ends = (source.match(/<!--\s*methodrail:end\s*-->/g) ?? []).length;
  if (starts !== ends) {
    issues.push("Methodrail-owned block markers are unmatched");
  }
  return { ok: issues.length === 0, issues };
}

function posixRel(from: string, to: string): string {
  return relative(from, to).split(sep).join("/");
}

function markdownLinks(source: string): { title: string; href: string }[] {
  const entries: { title: string; href: string }[] = [];
  for (const match of source.matchAll(/(?<!!)\[[^\]]*]\(([^)]+)\)/g)) {
    const href = match[1]?.trim().replace(/^<|>$/g, "") ?? "";
    const title = match[0]?.replace(/^\[/, "").replace(/]\([^)]*\)$/, "") ?? "";
    if (!href) continue;
    entries.push({ title, href });
  }
  return entries;
}

/**
 * Repo-relative paths PROJECT.md already points at, after resolving hrefs
 * relative to the index file. Anchors and external URLs are ignored.
 * Broken or escaping links are omitted rather than substring-matched.
 */
export function projectMdPointerPaths(source: string, projectMdPath: string, projectRoot: string): Set<string> {
  const out = new Set<string>();
  for (const entry of markdownLinks(source)) {
    const href = entry.href;
    if (!href || href.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(href)) continue;
    let local: string;
    try {
      local = decodeURIComponent(href.split("#", 1)[0] ?? "");
    } catch {
      continue;
    }
    if (!local) continue;
    const resolved = resolve(dirname(projectMdPath), local);
    if (!pathInside(projectRoot, resolved) || !existsSync(resolved)) continue;
    out.add(posixRel(projectRoot, resolved));
  }
  return out;
}

/**
 * Extra PROJECT.md checks that need the file's directory.
 * Optional artifact roles may be absent; a written link must still resolve.
 */
export function evaluateProjectMdLinks(source: string, projectMdPath: string, projectRoot: string): ProjectMdQuality {
  const issues: string[] = [];
  const seen = new Set<string>();
  for (const entry of markdownLinks(source)) {
    const href = entry.href;
    if (!href || href.startsWith("#") || /^[a-z][a-z0-9+.-]*:/i.test(href)) continue;
    let local: string;
    try {
      local = decodeURIComponent(href.split("#", 1)[0] ?? "");
    } catch {
      issues.push(`Link is not valid URL-encoded text: ${href}`);
      continue;
    }
    if (!local) continue;
    const key = local.replace(/\/$/, "");
    const isKnowledgeIndex = /knowledge\/.+\.md$/i.test(key) && !/knowledge\/decisions\//i.test(key);
    if (isKnowledgeIndex) {
      if (seen.has(key)) {
        issues.push(`Duplicate Methodrail index entry: ${local}`);
      }
      seen.add(key);
    }
    const resolved = resolve(dirname(projectMdPath), local);
    if (!pathInside(projectRoot, resolved)) {
      issues.push(`Link escapes the intended repository root: ${local}`);
      continue;
    }
    if (!existsSync(resolved)) {
      issues.push(`Broken repository-relative link: ${local}`);
      continue;
    }
    try {
      const st = statSync(resolved);
      if (!st.isFile() && !st.isDirectory()) {
        issues.push(`Broken repository-relative link: ${local}`);
      }
      if (st.isFile()) {
        const target = readFileSync(resolved, "utf8").trim();
        if (target.length > 200 && source.includes(target)) {
          issues.push(`PROJECT.md copies artifact contents from ${local}`);
        }
      }
    } catch {
      issues.push(`Broken repository-relative link: ${local}`);
    }
  }
  return { ok: issues.length === 0, issues };
}

export function evaluateProjectMdFile(projectMdPath: string, projectRoot: string): ProjectMdQuality {
  const source = readFileSync(projectMdPath, "utf8");
  const quality = evaluateProjectMd(source);
  const links = evaluateProjectMdLinks(source, projectMdPath, projectRoot);
  const issues = [...quality.issues, ...links.issues];
  return { ok: issues.length === 0, issues };
}
