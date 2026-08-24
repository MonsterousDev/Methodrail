# PROJECT.md template

Use only sections supported by repository evidence. Omit empty headings.

```markdown
# Project

## Purpose
One or two sentences describing what this repository builds.

## Important boundaries
- Package, service, ownership, security, and compatibility boundaries
- Generated, vendored, sensitive, or out-of-scope paths

## Canonical commands
- Install: `<observed command>`
- Build: `<observed command>`
- Test: `<observed command>`
- Lint/typecheck: `<observed command>`
- Run: `<observed command>`

## Verification
- Smallest useful checks by change type
- Environment limits or required services

## Domain vocabulary
- Terms whose project-specific meaning is not obvious

## Architecture pointers
- Links to canonical source, docs, ADRs, or package notes

## Runtime and control
- Link to `control/CONTROL.md` when non-obvious runtime procedures justify it

## Important constraints
- Existing conventions or invariants that materially affect changes

## Knowledge index
- Links to focused `.methodrail/knowledge/` notes when any exist

## Existing AI guidance
- Links to authoritative repository instruction files
```

Keep it operational and concise. Link to authoritative docs rather than duplicating them. Do not include generic advice such as “write clean code.”
