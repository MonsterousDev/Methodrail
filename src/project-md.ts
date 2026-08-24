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
  return { ok: issues.length === 0, issues };
}
