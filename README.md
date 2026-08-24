# Methodrail

Methodrail is an evidence-driven software-engineering methodology for AI coding agents.

Install it once. Run `/methodrail-init` in a repository. Methodrail learns the project and creates a lightweight, project-specific AI harness for future agents.

## Start in under a minute

1. Install this repository as a Cursor Plugin.
2. Open a project in Cursor.
3. Run `/methodrail-init`.
4. Use `/investigate`, `/develop`, `/debug`, or `/review`.

For local plugin development, clone this repository into Cursor's local plugins directory and reload the window:

```bash
git clone https://github.com/MonsterousDev/Methodrail.git \
  ~/.cursor/plugins/local/methodrail
```

Methodrail then appears in **Cursor Customize**. Consuming projects do not install an npm dependency, run a daemon, or use a Methodrail CLI.

## How it works

```text
                 METHODRAIL
            installed once globally
                     │
       ┌─────────────┼─────────────┐
       │             │             │
      skills        rules       methodology
       │
       ▼
 /methodrail-init
       │
       ▼
           CURRENT REPOSITORY
                  │
        ┌─────────┼─────────┐
        ▼         ▼         ▼
    knowledge   control   project rules
        │         │         │
        └─────────┼─────────┘
                  ▼
             AI agent work
                  │
      ┌───────────┼───────────┐
      ▼           ▼           ▼
 investigate    develop      debug
      │           │           │
      └──────── evidence ─────┘
```

Cursor is the runtime. Methodrail supplies the methodology and builds a small repository-specific context layer.

## Two layers

**Global plugin:** portable Agent Skills, one small rule, reusable references, and `/methodrail-init`.

**Project harness:** a concise `.methodrail/PROJECT.md` index plus only the knowledge, control procedures, thin host integration, and project-specific skills that the repository actually justifies.

Project source, manifests, configuration, tests, and existing instructions remain authoritative. The harness points to canonical sources instead of copying them.

## Skills

Workflow entry skills are explicit:

- `/methodrail-init` — inspect a repository and safely create or update its harness
- `/investigate` — answer existing-system questions with labeled evidence
- `/develop` — understand, decide, implement, and verify proportionally
- `/debug` — reproduce and find root cause before fixing
- `/review` — review intent, diff, evidence, and blast radius

Leaf skills load when relevant: `how`, `observe`, `why`, `domain-modeling`, `prototype`, `architect`, `systematic-debugging`, `verify-change`, and `blast-radius`. `interrogate` is explicit-only because adversarial review is expensive.

The key distinctions remain:

```text
how          = what current source does
observe      = what actually happens
why          = evidence for historical motivation
prototype    = executable experiment
blast-radius = what else may be affected
```

## Repository development

The TypeScript in this repository validates Methodrail itself; it is not a consumer runtime.

```bash
npm install
npm test
npm run validate
```

Validation checks plugin metadata, native skill frontmatter, references, permanent-context size, and the realistic initialized-project fixture.

See `references/` for the methodology and `adapters/` for thin host-specific installation guidance.

## Status

v0.2.0 simplifies Methodrail into a native Cursor Plugin and project harness builder. Cursor is first-class; the reusable skills remain compatible with Agent Skills-oriented Claude Code and Codex setups.
