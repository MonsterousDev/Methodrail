import type { CommandLogEntry, VerificationRecord, VerificationStep } from "./types.js";

const NONE_RE = /^(none\b|n\/a\b|waiting on human)/i;
const VERIFICATION_PHASES = new Set(["repro", "regression", "verify"]);

export function isNoneToken(value: string): boolean {
  const trimmed = value.trim();
  return trimmed.length === 0 || NONE_RE.test(trimmed);
}

export function stepCommand(step: VerificationStep): string {
  if (typeof step === "string") return step;
  return step.command ?? "";
}

export function isRealVerificationStep(step: VerificationStep): boolean {
  if (isNoneToken(stepCommand(step))) return false;
  if (typeof step === "string" || step.phase === undefined) return true;
  return VERIFICATION_PHASES.has(step.phase);
}

export function realVerificationCount(
  steps: VerificationStep[],
  commandLog?: CommandLogEntry[],
): number {
  if (commandLog && commandLog.length > 0) {
    return commandLog.filter(
      (entry) =>
        !isNoneToken(entry.command ?? "") &&
        typeof entry.phase === "string" &&
        VERIFICATION_PHASES.has(entry.phase),
    ).length;
  }
  return steps.filter(isRealVerificationStep).length;
}

export function asRecord(step: VerificationStep): VerificationRecord {
  if (typeof step === "string") {
    return { command: step, exit_status: null };
  }
  return step;
}
