import { readFileSync, realpathSync } from "node:fs";
import { dirname, isAbsolute, resolve } from "node:path";

export class HarnessManifestError extends Error {}

function isRecord(value) {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function stripComment(line) {
  let inSingle = false;
  let inDouble = false;
  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    const prev = index > 0 ? line[index - 1] : "";
    if (char === "'" && !inDouble) inSingle = !inSingle;
    else if (char === '"' && !inSingle && prev !== "\\") inDouble = !inDouble;
    else if (char === "#" && !inSingle && !inDouble) return line.slice(0, index).trimEnd();
  }
  return line;
}

function parseScalar(raw) {
  const text = raw.trim();
  if (text === "" || text === "null" || text === "~") return null;
  if (text === "true") return true;
  if (text === "false") return false;
  if (text.length >= 2 && text.startsWith('"') && text.endsWith('"')) {
    return JSON.parse(text);
  }
  if (text.length >= 2 && text.startsWith("'") && text.endsWith("'")) {
    return text.slice(1, -1).replaceAll("''", "'");
  }
  if (/^-?(?:0|[1-9]\d*)$/.test(text)) return Number(text);
  if (/^-?(?:0|[1-9]\d*)\.\d+$/.test(text)) return Number(text);
  return text;
}

function parseMapping(rows, index, indent) {
  const value = {};
  while (index < rows.length) {
    const row = rows[index];
    if (row.indent < indent) break;
    if (row.indent > indent) {
      throw new Error(`Invalid YAML indent at line ${row.line}`);
    }
    const match = /^(.+?):\s*(.*)$/.exec(row.text);
    if (!match) throw new Error(`Invalid YAML mapping at line ${row.line}`);
    const key = parseScalar(match[1]);
    if (typeof key !== "string" || key.length === 0) {
      throw new Error(`Invalid YAML key at line ${row.line}`);
    }
    const rest = match[2];
    index += 1;
    if (rest === "") {
      if (index < rows.length && rows[index].indent > indent) {
        const nested = parseMapping(rows, index, rows[index].indent);
        value[key] = nested.value;
        index = nested.index;
      } else {
        value[key] = null;
      }
    } else if (rest.startsWith("{") || rest.startsWith("[")) {
      throw new Error(`YAML flow collections are not supported at line ${row.line}`);
    } else {
      value[key] = parseScalar(rest);
    }
  }
  return { value, index };
}

function parseHarnessYamlDocument(source) {
  const rows = [];
  for (const [offset, line] of source.split(/\r?\n/).entries()) {
    if (line.includes("\t")) throw new Error("YAML tabs are not allowed");
    const text = stripComment(line);
    if (text.trim() === "") continue;
    const indent = text.match(/^ */)[0].length;
    rows.push({ line: offset + 1, indent, text: text.trim() });
  }
  if (rows.length === 0) throw new Error("HARNESS.yaml is empty");
  const parsed = parseMapping(rows, 0, rows[0].indent);
  if (parsed.index !== rows.length) throw new Error("Unexpected YAML content");
  return parsed.value;
}

export function parseLinkedHarnessManifest(source) {
  let value;
  try {
    value = parseHarnessYamlDocument(source);
  } catch (error) {
    throw new HarnessManifestError(
      `HARNESS.yaml is invalid YAML: ${error instanceof Error ? error.message : String(error)}`,
    );
  }
  const repositoryPath = isRecord(value.repository) ? value.repository.path : undefined;
  if (
    value.schema_version !== 1 ||
    value.placement !== "linked-external" ||
    typeof repositoryPath !== "string" ||
    repositoryPath.trim() === "" ||
    isAbsolute(repositoryPath)
  ) {
    throw new HarnessManifestError(
      "HARNESS.yaml requires schema_version: 1, placement: linked-external, and a relative repository.path",
    );
  }
  return { repositoryPath };
}

export function resolveBoundRepository(manifestPath) {
  const { repositoryPath } = parseLinkedHarnessManifest(readFileSync(manifestPath, "utf8"));
  return realpathSync(resolve(dirname(manifestPath), repositoryPath));
}
