import { spawnSync } from "node:child_process";
import { existsSync, lstatSync, readFileSync, realpathSync } from "node:fs";
import { isAbsolute, join, relative, resolve, sep } from "node:path";
import { parseLinkedHarnessManifest } from "../skills/methodrail-init/scripts/harness-manifest.mjs";

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

function inside(parent: string, child: string): boolean {
  return child === parent || child.startsWith(parent + sep);
}

function gitCommand(repositoryRoot: string, args: string[]) {
  return spawnSync("git", args, {
    cwd: repositoryRoot,
    encoding: "utf8",
    stdio: ["ignore", "pipe", "pipe"],
  });
}

function gitSucceeds(repositoryRoot: string, args: string[]): boolean {
  return gitCommand(repositoryRoot, args).status === 0;
}

function localExcludeIgnoresMethodrail(repositoryRoot: string): { ignored: boolean; source: string } {
  const result = gitCommand(repositoryRoot, ["check-ignore", "-v", "--", ".methodrail"]);
  if (result.status !== 0) return { ignored: false, source: "" };
  const line = (result.stdout ?? "").trim().split(/\r?\n/).pop() ?? "";
  const beforeTab = line.split("\t")[0] ?? "";
  const match = /^(.*):(\d+):(.*)$/.exec(beforeTab);
  const source = match?.[1] ?? "";
  if (!source) return { ignored: false, source: "" };
  const exclude = join(repositoryRoot, ".git", "info", "exclude");
  const resolvedSource = isAbsolute(source) ? resolve(source) : resolve(repositoryRoot, source);
  let matchesExclude = false;
  try {
    matchesExclude = realpathSync(resolvedSource) === realpathSync(exclude);
  } catch {
    matchesExclude = resolve(resolvedSource) === resolve(exclude);
  }
  return { ignored: matchesExclude, source };
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

  let repositoryPath: string;
  try {
    ({ repositoryPath } = parseLinkedHarnessManifest(readFileSync(manifestPath, "utf8")));
  } catch (error) {
    diagnostics.push({
      level: "error",
      path: manifestPath,
      message: (error as Error).message,
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
  const ignore = localExcludeIgnoresMethodrail(repository);
  if (!ignore.ignored) {
    diagnostics.push({
      level: "error",
      path: logicalHarnessRoot,
      message: ignore.source
        ? `Linked external .methodrail must be ignored through Git's local exclude file (.git/info/exclude), not ${ignore.source}`
        : "Linked external .methodrail must be ignored through Git's local exclude file (.git/info/exclude)",
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
