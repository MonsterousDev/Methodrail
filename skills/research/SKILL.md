---
name: research
description: "Investigate a question against high-trust primary sources and capture cited findings. Use for external docs, specs, APIs, or first-party references. Do not use for current-codebase how, historical why, or live observe."
---

# Research

External / reference research against authoritative primary sources. Distinct from:

```text
how      = current codebase understanding
why      = historical project reasoning
observe  = live behavior
research = external/reference sources
```

## Method

If the host supports a background or child agent, spin one up so this context can keep working. Otherwise do the research here. See [host capabilities](../../references/host-capabilities.md).

1. Investigate the question against **primary sources** (official docs, source of the dependency, specs, first-party APIs), not a secondary write-up. Follow every claim back to the source that owns it.
2. Write the findings to a single Markdown file, citing each claim's source.
3. Save it where the repo already keeps such notes. If there is none, put it in `.methodrail/knowledge/` or another sensible project location and say where.

Findings may become a knowledge candidate. Do not promote them to standing rules automatically. See [knowledge lifecycle](../../references/knowledge/lifecycle.md).

## Neighbors

```text
Current code                  → how
History                       → why
Live behavior                 → observe
```

Do not use research for the local codebase.
