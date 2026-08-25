import { execFileSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";
import { materializeFixture, readIfExists, removeWorktree } from "./worktree.js";
import type { CommandLogEntry, EvalContext, EvalRun, OutcomeCheck, OutcomeGrade } from "./types.js";

function check(id: string, passed: boolean, detail: string): OutcomeCheck {
  return { id, passed, detail };
}

function gradeFrom(checks: OutcomeCheck[], incomplete = false): OutcomeGrade {
  const failures = checks.filter((item) => !item.passed).map((item) => `${item.id}: ${item.detail}`);
  return {
    passed: !incomplete && failures.length === 0,
    incomplete,
    checks,
    failures,
  };
}

function incompleteGrade(reason: string): OutcomeGrade {
  return gradeFrom([check("artifacts", false, reason)], true);
}

function resolve(repoRoot: string, path: string | undefined): string | undefined {
  if (!path) return undefined;
  return join(repoRoot, path);
}

function loadAnswer(run: EvalRun, repoRoot: string): string {
  const answerPath = resolve(repoRoot, run.artifacts?.answer);
  if (answerPath && existsSync(answerPath)) return readFileSync(answerPath, "utf8");
  return run.outcome ?? "";
}

function loadCommandLog(run: EvalRun, repoRoot: string): CommandLogEntry[] {
  const path = resolve(repoRoot, run.artifacts?.command_log);
  if (!path || !existsSync(path)) return [];
  try {
    const parsed: unknown = JSON.parse(readFileSync(path, "utf8"));
    return Array.isArray(parsed) ? (parsed as CommandLogEntry[]) : [];
  } catch {
    return [];
  }
}

function overlayDir(run: EvalRun, repoRoot: string): string | undefined {
  return resolve(repoRoot, run.artifacts?.overlay ?? run.artifacts?.patch);
}

function withWorktree<T>(fixtureDir: string, overlay: string | undefined, fn: (root: string) => T): T {
  const dest = materializeFixture(fixtureDir, overlay);
  try {
    return fn(dest);
  } finally {
    removeWorktree(dest);
  }
}

function runNode(args: string[], cwd: string): { ok: boolean; output: string } {
  try {
    const output = execFileSync("node", args, {
      cwd,
      encoding: "utf8",
      timeout: 20000,
      stdio: ["ignore", "pipe", "pipe"],
    });
    return { ok: true, output };
  } catch (error) {
    const err = error as { stdout?: string; stderr?: string };
    return { ok: false, output: `${err.stdout ?? ""}${err.stderr ?? ""}` };
  }
}

function fixtureDir(ctx: EvalContext, id: string): string {
  return join(ctx.repoRoot, "evals", "fixtures", id);
}

function npmInstallAction(command: string): "ci" | "install" | null {
  for (const segment of command.split(/\s*(?:&&|\|\||;)\s*/)) {
    const match = segment
      .trim()
      .match(/^(?:[A-Za-z_][A-Za-z0-9_]*=\S+\s+)*npm(?:\s+--[^\s]+)*\s+(ci|install)(?:\s|$)/);
    if (match?.[1] === "ci" || match?.[1] === "install") return match[1];
  }
  return null;
}

function gradeSimpleChange(run: EvalRun, ctx: EvalContext): OutcomeGrade {
  const overlay = overlayDir(run, ctx.repoRoot);
  if (!overlay) return incompleteGrade("simple-change requires an overlay/patch artifact");
  return withWorktree(fixtureDir(ctx, "simple-change"), overlay, (root) => {
    const repo = join(root, "repo");
    const source = readIfExists(join(repo, "src/button.js")) ?? "";
    const label = /return "Create"/.test(source) && !/return "Save"/.test(source);
    const test = runNode(["--test", "src/button.test.js"], repo);
    return gradeFrom([
      check("label", label, label ? "buttonLabel returns Create" : "buttonLabel does not return Create"),
      check("test", test.ok, test.ok ? "fixture unit test passed" : `fixture unit test failed: ${test.output.slice(0, 400)}`),
    ]);
  });
}

function gradeMediumFeature(run: EvalRun, ctx: EvalContext): OutcomeGrade {
  const overlay = overlayDir(run, ctx.repoRoot);
  if (!overlay) return incompleteGrade("medium-feature requires an overlay/patch artifact");
  return withWorktree(fixtureDir(ctx, "medium-feature"), overlay, (root) => {
    const repo = join(root, "repo");
    const source = readIfExists(join(repo, "src/cli.js")) ?? "";
    const hasGreet = /--greet/.test(source) && /hello,\s*/.test(source);
    const keepsDefault = source.includes("`hi ${") || source.includes("hi ${nameFromArgs") || /return `hi /.test(source);
    const test = runNode(["--test", "src/cli.test.js"], repo);
    return gradeFrom([
      check("greet-flag", hasGreet, hasGreet ? "--greet prints hello, <name>" : "missing --greet hello, <name> behavior"),
      check("default-kept", keepsDefault, keepsDefault ? "default greeting kept" : "default greeting missing"),
      check("test", test.ok, test.ok ? "CLI tests passed" : `CLI tests failed: ${test.output.slice(0, 400)}`),
    ]);
  });
}

function gradeRuntimeBug(run: EvalRun, ctx: EvalContext): OutcomeGrade {
  const overlay = overlayDir(run, ctx.repoRoot);
  if (!overlay) return incompleteGrade("runtime-bug requires an overlay/patch artifact");
  return withWorktree(fixtureDir(ctx, "runtime-bug"), overlay, (root) => {
    const file = join(root, "repo/src/session.js");
    const driver = `
      import { landingPath } from ${JSON.stringify(file)};
      const cases = [
        [{}, "/login"],
        [{ token: "x", expired: true }, "/login"],
        [{ token: "x", expiresAt: "2000-01-01T00:00:00.000Z" }, "/login"],
        [{ token: "x", expiresAt: "2099-01-01T00:00:00.000Z" }, "/dashboard"],
      ];
      let failed = [];
      for (const [session, expected] of cases) {
        const actual = landingPath(session);
        if (actual !== expected) failed.push(JSON.stringify({ session, expected, actual }));
      }
      if (failed.length) {
        console.error(failed.join("\\n"));
        process.exit(1);
      }
    `;
    const result = runNode(["--input-type=module", "-e", driver], root);
    return gradeFrom([
      check(
        "expired-landing",
        result.ok,
        result.ok
          ? "expired sessions land on /login; valid sessions keep /dashboard"
          : `landingPath driver failed: ${result.output.slice(0, 500)}`,
      ),
    ]);
  });
}

function gradeArchitectureDecision(run: EvalRun, ctx: EvalContext): OutcomeGrade {
  const overlay = overlayDir(run, ctx.repoRoot);
  if (!overlay) return incompleteGrade("architecture-decision requires an overlay artifact");
  return withWorktree(fixtureDir(ctx, "architecture-decision"), overlay, (root) => {
    const session = readIfExists(join(root, "repo/src/session.js")) ?? "";
    const decisionDir = join(root, ".methodrail/knowledge/decisions");
    let decision = "";
    if (existsSync(decisionDir)) {
      for (const name of readdirSync(decisionDir)) {
        decision += readIfExists(join(decisionDir, name)) ?? "";
      }
    }
    const recorded = /session/i.test(decision) && /organization/i.test(decision);
    const rewrite = /orgId/.test(session) && !/userId/.test(session);
    const grounded = /userId/.test(session);
    return gradeFrom([
      check("grounded", grounded && !rewrite, rewrite ? "rewrote session ownership without a first slice" : "current User-keyed implementation still present"),
      check("decision", recorded, recorded ? "recorded a session-ownership decision" : "no decision record naming Session/Organization"),
    ]);
  });
}

function gradeReviewRisk(run: EvalRun, ctx: EvalContext): OutcomeGrade {
  const answer = loadAnswer(run, ctx.repoRoot);
  if (!answer.trim()) return incompleteGrade("review-risk requires an answer artifact");
  const flagsMissing = /missing|no test|no evidence|author claim|unverified/i.test(answer);
  const payment = /payment|charge|blast|retry/i.test(answer);
  const trustedClaim = /lgtm|tests passed,? ship|author is correct/i.test(answer) && !flagsMissing;
  return gradeFrom([
    check("missing-evidence", flagsMissing && !trustedClaim, flagsMissing ? "flagged missing evidence" : "did not flag missing test evidence"),
    check("blast-radius", payment, payment ? "noted payment-path risk" : "did not note payment blast radius"),
  ]);
}

function gradeProjectInit(run: EvalRun, ctx: EvalContext): OutcomeGrade {
  const overlay = overlayDir(run, ctx.repoRoot);
  if (!overlay) return incompleteGrade("project-init requires an overlay artifact");
  return withWorktree(fixtureDir(ctx, "project-init"), overlay, (root) => {
    const project = readIfExists(join(root, "repo/.methodrail/PROJECT.md")) ?? readIfExists(join(root, ".methodrail/PROJECT.md")) ?? "";
    const readme = readIfExists(join(root, "repo/README.md")) ?? "";
    const exists = project.length > 0;
    const copied = exists && readme.length > 0 && project.includes(readme.trim()) && project.trim() === readme.trim();
    const pointer = exists && /npm test/i.test(project) && project.split(/\r?\n/).length <= 80;
    const notCopied = exists && !copied && !/# Widget CLI/.test(project);
    return gradeFrom([
      check("project-md", exists, exists ? "PROJECT.md present" : "PROJECT.md missing"),
      check("pointer-index", pointer && notCopied, pointer && notCopied ? "pointer index names npm test" : "PROJECT.md copies README or omits npm test"),
    ]);
  });
}

function gradeInitValue(run: EvalRun, ctx: EvalContext): OutcomeGrade {
  const overlay = overlayDir(run, ctx.repoRoot);
  if (!overlay) return incompleteGrade("init-value requires an overlay artifact");
  const installActions = loadCommandLog(run, ctx.repoRoot)
    .map((entry) => npmInstallAction(entry.command ?? ""))
    .filter((action): action is "ci" | "install" => action !== null);
  return withWorktree(fixtureDir(ctx, "init-value"), overlay, (root) => {
    const repo = join(root, "repo");
    let testSource = "";
    const walk = (dir: string): void => {
      if (!existsSync(dir)) return;
      for (const name of readdirSync(dir)) {
        const path = join(dir, name);
        if (statSync(path).isDirectory()) walk(path);
        else if (/\.(js|mjs|cjs|ts)$/.test(name)) testSource += readFileSync(path, "utf8") + "\n";
      }
    };
    walk(join(repo, "test"));
    const usedCi = installActions.includes("ci");
    const usedInstall = installActions.includes("install");
    const listens = /app\.listen|\.listen\(3000\)/.test(testSource);
    const inProcess = /createApp\(/.test(testSource) && !listens;
    const test = runNode(["--test", "test/hello.test.js"], repo);
    return gradeFrom([
      check("install", usedInstall && !usedCi, usedCi ? "used npm ci" : usedInstall ? "used npm install" : "no npm install in command log"),
      check("in-process", inProcess, inProcess ? "HTTP driven in-process" : "test listens or does not drive createApp"),
      check("test", test.ok, test.ok ? "hello tests passed" : `hello tests failed: ${test.output.slice(0, 400)}`),
    ]);
  });
}

function gradeKnowledgeFreshness(run: EvalRun, ctx: EvalContext): OutcomeGrade {
  const answer = loadAnswer(run, ctx.repoRoot);
  if (!answer.trim()) return incompleteGrade("knowledge-freshness requires an answer artifact");
  const source = readFileSync(join(fixtureDir(ctx, "knowledge-freshness"), "repo/src/auth.js"), "utf8");
  const cookieFact = /sid=/.test(source) && /set-cookie/.test(source);
  const mentionsSession = /sid|cookie|session/i.test(answer);
  const treatsJwtAsCurrent = /jwt\.sign|bearer/i.test(answer) && !/stale|not |no longer|retired|flag/i.test(answer);
  const flagsStale = /stale|retired|not JWT|no longer|flag/i.test(answer);
  return gradeFrom([
    check("source-fact", cookieFact, "fixture source uses sid cookies"),
    check("answer-sessions", mentionsSession && !treatsJwtAsCurrent, mentionsSession && !treatsJwtAsCurrent ? "answer uses current session/cookie mechanism" : "answer treats JWT as current or omits sessions"),
    check("stale-flag", flagsStale || !treatsJwtAsCurrent, flagsStale || !treatsJwtAsCurrent ? "JWT not treated as current" : "trusted stale JWT knowledge"),
  ]);
}

function gradeKnowledgeAccumulation(run: EvalRun, ctx: EvalContext): OutcomeGrade {
  const overlay = overlayDir(run, ctx.repoRoot);
  if (!overlay) return incompleteGrade("knowledge-accumulation requires an overlay artifact");
  return withWorktree(fixtureDir(ctx, "knowledge-accumulation"), overlay, (root) => {
    const driver = `
      const { handle, balanceOf } = require("./repo/src/webhooks.js");
      const event = { id: "evt_inv_grade", type: "invoice.paid", data: { walletId: "w_grade", cents: 900 } };
      const first = handle(event);
      const second = handle(event);
      if (!first) { console.error("invoice.paid not routed"); process.exit(1); }
      if (balanceOf("w_grade") !== 900) { console.error("double credit or miss", balanceOf("w_grade")); process.exit(1); }
      if (second && second.seq !== first.seq && second !== first) {
        console.error("retry did not no-op");
        process.exit(1);
      }
    `;
    const result = runNode(["--input-type=commonjs", "-e", driver], root);
    return gradeFrom([
      check(
        "idempotent-invoice",
        result.ok,
        result.ok ? "invoice.paid is idempotent on eventId" : `idempotency driver failed: ${result.output.slice(0, 500)}`,
      ),
    ]);
  });
}

function gradePartialKnowledge(run: EvalRun, ctx: EvalContext): OutcomeGrade {
  const answer = loadAnswer(run, ctx.repoRoot);
  if (!answer.trim()) return incompleteGrade("partial-knowledge requires an answer artifact");
  const stripe =
    /stripe[^.\n]{0,100}subscri/i.test(answer) ||
    /subscri[^.\n]{0,100}(?:charged|handled|processed|via|through|by|→)[^.\n]{0,60}stripe/i.test(answer);
  const adyen =
    /adyen[^.\n]{0,100}(?:invoice|one-time|one time)/i.test(answer) ||
    /(?:invoice|one-time|one time)[^.\n]{0,100}(?:charged|handled|processed|via|through|by|→)[^.\n]{0,60}adyen/i.test(answer);
  return gradeFrom([
    check("stripe-subs", stripe, stripe ? "retained Stripe subscriptions" : "lost Stripe subscriptions fact"),
    check("adyen-invoice", adyen, adyen ? "named Adyen for one-time invoices" : "missed Adyen gap or trusted all-Stripe claim"),
  ]);
}

function filesUnchanged(root: string, relative: string, original: string): boolean {
  const current = readIfExists(join(root, relative)) ?? "";
  return current === original;
}

function gradeHumanDecision(run: EvalRun, ctx: EvalContext): OutcomeGrade {
  const answer = loadAnswer(run, ctx.repoRoot);
  if (!answer.trim()) return incompleteGrade("human-decision requires an answer artifact");
  const fixture = fixtureDir(ctx, "human-decision");
  const originalOrg = readFileSync(join(fixture, "repo/src/org.js"), "utf8");
  const overlay = overlayDir(run, ctx.repoRoot);
  return withWorktree(fixture, overlay, (root) => {
    const unchanged = filesUnchanged(root, "repo/src/org.js", originalOrg);
    const ambiguity = /ambig|mixed|customer emails|product copy|not (?:a )?rename instruction|without enough evidence/i.test(answer);
    const renameCost = /cross-product|global rename|branding|API change|migration|code churn|support burden|overwriting|changing the code/i.test(answer);
    const currentContract = /billing.owner|current (?:contract|terminology)|organizationType|noun is Organization/i.test(answer);
    const tradeoffs = /trade-?offs?/i.test(answer) || (ambiguity && (renameCost || currentContract));
    const human = /human|preference|policy|product(?:-language|\/owner)?(?:\/domain)? decision|owner call|owner decision|explicit product/i.test(answer);
    const implemented = /rename applied|implemented the rename|Account rename/i.test(answer);
    return gradeFrom([
      check("protected-files", unchanged, unchanged ? "org.js unchanged" : "org.js was modified"),
      check("tradeoffs", tradeoffs, tradeoffs ? "answer presents tradeoffs" : "answer missing tradeoffs"),
      check("escalate", human && !implemented, implemented ? "implemented the rename" : human ? "escalated to a human" : "did not escalate to a human"),
    ]);
  });
}

function gradeKnowledgeReuse(run: EvalRun, ctx: EvalContext): OutcomeGrade {
  const overlay = overlayDir(run, ctx.repoRoot);
  if (!overlay) return incompleteGrade("knowledge-reuse requires an overlay artifact");
  return withWorktree(fixtureDir(ctx, "knowledge-reuse"), overlay, (root) => {
    const driver = `
      const { handle, countFor } = require("./repo/src/notify.js");
      const delayed = { id: "evt_delay_grade", type: "shipment.delayed", data: { shipmentId: "s_grade", to: "ops@x.test" } };
      const first = handle(delayed);
      handle(delayed);
      if (!first) { console.error("shipment.delayed not routed"); process.exit(1); }
      if (countFor("shipment.delayed") !== 1) {
        console.error("double notify or miss", countFor("shipment.delayed"));
        process.exit(1);
      }
      const created = { id: "evt_created_grade", type: "shipment.created", data: { shipmentId: "s_created_grade", to: "ops@x.test" } };
      handle(created);
      handle(created);
      if (countFor("shipment.created") !== 1) {
        console.error("shipment.created broken", countFor("shipment.created"));
        process.exit(1);
      }
    `;
    const result = runNode(["--input-type=commonjs", "-e", driver], root);
    return gradeFrom([
      check(
        "idempotent-delayed",
        result.ok,
        result.ok ? "shipment.delayed is keyed on event id" : `event-id driver failed: ${result.output.slice(0, 500)}`,
      ),
    ]);
  });
}

function proposesNoteUpdate(answer: string): boolean {
  return (
    /propos(?:e|ed|ing).{0,80}(?:note update|updat(?:e|ing).{0,40}(?:note|mail\.md|\.methodrail\/knowledge))/is.test(answer) ||
    /(?:note|mail\.md|\.methodrail\/knowledge).{0,60}(?:should|must|needs? to).{0,40}(?:update|refresh|revise|correct|amend)/is.test(
      answer,
    ) ||
    /(?:update|refresh|revise|correct|amend).{0,50}(?:the )?(?:stored )?(?:mail )?(?:knowledge )?note/is.test(answer)
  );
}

function gradeKnowledgeRefresh(run: EvalRun, ctx: EvalContext): OutcomeGrade {
  const answer = loadAnswer(run, ctx.repoRoot);
  if (!answer.trim()) return incompleteGrade("knowledge-refresh requires an answer artifact");
  const overlay = overlayDir(run, ctx.repoRoot);
  if (!overlay) return incompleteGrade("knowledge-refresh requires an overlay artifact");
  const fixture = fixtureDir(ctx, "knowledge-refresh");
  const originalNote = readFileSync(join(fixture, ".methodrail/knowledge/mail.md"), "utf8");
  return withWorktree(fixture, overlay, (root) => {
    const driver = `
      const mailer = require("./repo/src/mailer.js");
      const outbox = require("./repo/src/outbox.js");
      const event = { id: "evt_res_grade", type: "ticket.resolved", data: { ticketId: "t_grade", to: "user@x.test" } };
      const first = mailer.handle(event);
      mailer.handle(event);
      const count = typeof mailer.countFor === "function"
        ? mailer.countFor("ticket.resolved")
        : outbox.deliveries().filter((row) => row.channel === "ticket.resolved").length;
      if (!first) { console.error("ticket.resolved not routed"); process.exit(1); }
      if (count !== 1) { console.error("double mail or miss", count); process.exit(1); }
      const fail = mailer.failSend || outbox.markFailed;
      if (typeof fail !== "function") { console.error("no failSend/markFailed"); process.exit(1); }
      fail(event.id);
      const row = outbox.deliveries().find((item) => item.eventId === event.id);
      if (!row) { console.error("failed send deleted the outbox row"); process.exit(1); }
      console.log("ok");
    `;
    const result = runNode(["--input-type=commonjs", "-e", driver], root);
    const output = result.output;
    const notRouted = /not routed/i.test(output);
    const doubled = /double mail or miss/i.test(output);
    const deleted = /deleted the outbox row/i.test(output);
    const missingFailureApi = /no failSend\/markFailed/i.test(output);
    const completed = result.ok && /(?:^|\n)ok(?:\r?\n|$)/.test(output);
    const keyed = completed || (!notRouted && !doubled && (missingFailureApi || deleted));
    const keptRow = completed;
    const noteUnchanged = filesUnchanged(root, ".methodrail/knowledge/mail.md", originalNote);
    const proposed = proposesNoteUpdate(answer);
    return gradeFrom([
      check("event-id-key", keyed, keyed ? "ticket.resolved is keyed on event id" : `event-id driver failed: ${output.slice(0, 500)}`),
      check(
        "kept-row",
        keptRow,
        keptRow ? "failed send kept the outbox row" : `refresh driver did not complete successfully: ${output.slice(0, 500)}`,
      ),
      check("propose-update", proposed, proposed ? "answer proposes a note update" : "answer did not propose a note update"),
      check("note-untouched", noteUnchanged, noteUnchanged ? "mail.md was not rewritten" : "silently rewrote the knowledge note"),
    ]);
  });
}

const GRADERS: Record<string, (run: EvalRun, ctx: EvalContext) => OutcomeGrade> = {
  "simple-change": gradeSimpleChange,
  "medium-feature": gradeMediumFeature,
  "runtime-bug": gradeRuntimeBug,
  "architecture-decision": gradeArchitectureDecision,
  "review-risk": gradeReviewRisk,
  "project-init": gradeProjectInit,
  "init-value": gradeInitValue,
  "knowledge-freshness": gradeKnowledgeFreshness,
  "knowledge-accumulation": gradeKnowledgeAccumulation,
  "partial-knowledge": gradePartialKnowledge,
  "human-decision": gradeHumanDecision,
  "knowledge-reuse": gradeKnowledgeReuse,
  "knowledge-refresh": gradeKnowledgeRefresh,
};

export function gradeOutcome(run: EvalRun, ctx: EvalContext): OutcomeGrade {
  const grader = GRADERS[run.fixture_id];
  if (!grader) return incompleteGrade(`no fixture grader for ${run.fixture_id}`);
  return grader(run, ctx);
}

export function requiredArtifactPaths(run: EvalRun): string[] {
  const a = run.artifacts ?? {};
  const paths = [a.overlay, a.patch, a.command_log, a.answer, a.transcript, a.worktree];
  return paths.filter((path): path is string => typeof path === "string" && path.length > 0);
}

export { loadAnswer, loadCommandLog, overlayDir };
