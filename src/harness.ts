import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { parse } from "yaml";

export const HARNESS_MANIFEST = "HARNESS.yaml";

export type HarnessPlacement = "in-repository" | "linked-external";

export interface HarnessBinding {
  placement: HarnessPlacement;
  repositoryRoot: string;
  logicalHarnessRoot: string;
  storageHarnessRoot: string;
  manifestPath?: string;
}

export interface HarnessBindingDiagnostic {
  level: "error" | "warning";
  path: string;
  message: string;
}

export interface HarnessBindingResult {
  binding?: HarnessBinding;
  diagnostics: HarnessBindingDiagnostic[];
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function inside(parent: string, child: string): boolean {
  return child === parent || child.startsWith(parent + sep);
}

function gitSucceeds(repositoryRoot: string, args: string[]): boolean {
  return spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  }).status === 0;
}

export function inspectHarnessBinding(repositoryRoot: string): HarnessBindingResult {
  const repository = resolve(repositoryRoot);
  const logicalHarnessRoot = join(repository, ".methodrail");
  const diagnostics: HarnessBindingDiagnostic[] = [];
  let stat;
  try {
    stat = lstatSync(logicalHarnessRoot);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (code === "ENOENT") return { diagnostics };
    return {
      diagnostics: [{ level: "error", path: logicalHarnessRoot, message: `Cannot inspect harness: ${(error as Error).message}` }],
    };
  }

  if (!stat.isSymbolicLink()) {
    if (!stat.isDirectory()) {
      return {
        diagnostics: [{ level: "error", path: logicalHarnessRoot, message: ".methodrail must be a directory or linked directory" }],
      };
    }
    return {
      binding: {
        placement: "in-repository",
        repositoryRoot: repository,
        logicalHarnessRoot,
        storageHarnessRoot: logicalHarnessRoot,
      },
      diagnostics,
    };
  }

  let storageHarnessRoot: string;
  try {
    storageHarnessRoot = realpathSync(logicalHarnessRoot);
  } catch {
    return {
      diagnostics: [{ level: "error", path: logicalHarnessRoot, message: "Linked external harness target does not exist" }],
    };
  }
  if (inside(realpathSync(repository), storageHarnessRoot)) {
    diagnostics.push({
      level: "error",
      path: logicalHarnessRoot,
      message: "Linked external harness storage must live outside the repository",
    });
  }

  const manifestPath = join(storageHarnessRoot, HARNESS_MANIFEST);
  if (!existsSync(manifestPath)) {
    diagnostics.push({
      level: "error",
      path: manifestPath,
      message: "Linked external harness requires HARNESS.yaml",
    });
    return { diagnostics };
  }

  let value: unknown;
  try {
    value = parse(readFileSync(manifestPath, "utf8"));
  } catch (error) {
    diagnostics.push({
      level: "error",
      path: manifestPath,
      message: `HARNESS.yaml is invalid YAML: ${(error as Error).message}`,
    });
    return { diagnostics };
  }
  const repositoryRecord = isRecord(value) && isRecord(value.repository) ? value.repository : undefined;
  const repositoryPath = repositoryRecord?.path;
  if (
    !isRecord(value) ||
    value.schema_version !== 1 ||
    value.placement !== "linked-external" ||
    typeof repositoryPath !== "string" ||
    repositoryPath.trim() === "" ||
    isAbsolute(repositoryPath)
  ) {
    diagnostics.push({
      level: "error",
      path: manifestPath,
      message: "HARNESS.yaml requires schema_version: 1, placement: linked-external, and a relative repository.path",
    });
    return { diagnostics };
  }

  const declaredRepository = resolve(storageHarnessRoot, repositoryPath);
  let declaredReal: string;
  try {
    declaredReal = realpathSync(declaredRepository);
  } catch {
    diagnostics.push({
      level: "error",
      path: manifestPath,
      message: `HARNESS.yaml repository.path does not resolve: ${repositoryPath}`,
    });
    return { diagnostics };
  }
  const repositoryReal = realpathSync(repository);
  if (declaredReal !== repositoryReal) {
    diagnostics.push({
      level: "error",
      path: manifestPath,
      message: `HARNESS.yaml is bound to a different repository: ${relative(storageHarnessRoot, declaredReal)}`,
    });
  }

  if (gitSucceeds(repository, ["ls-files", "--error-unmatch", ".methodrail"])) {
    diagnostics.push({
      level: "error",
      path: logicalHarnessRoot,
      message: "Linked external .methodrail must not be tracked by Git",
    });
  }
  if (!gitSucceeds(repository, ["check-ignore", "-q", ".methodrail"])) {
    diagnostics.push({
      level: "error",
      path: logicalHarnessRoot,
      message: "Linked external .methodrail must be ignored through Git's local exclude file",
    });
  }

  if (diagnostics.some((diagnostic) => diagnostic.level === "error")) return { diagnostics };
  return {
    binding: {
      placement: "linked-external",
      repositoryRoot: repository,
      logicalHarnessRoot,
      storageHarnessRoot,
      manifestPath,
    },
    diagnostics,
  };
}
