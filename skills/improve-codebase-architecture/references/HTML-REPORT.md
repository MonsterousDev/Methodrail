# Architecture report format

Markdown in the conversation is the default. Generate HTML only when several module relationships materially benefit from a visual comparison.

Write optional HTML to the OS temp directory. Do not commit it. Open and inspect the rendered file before presenting it.

CDN-backed output is not self-contained. Prefer inline CSS and native HTML/SVG. If Mermaid or another remote asset is used, disclose the dependency in the report and provide a readable HTML/SVG or Markdown fallback that still names every candidate.

## Markdown default

```markdown
# Architecture review for {repo}

## Candidates

### {title} — {delete | deepen | preserve | reject} — {Strong | Worth exploring | Speculative}

- Files:
- Friction (with evidence):
- Current interface / proposed interface:
- Callers / blast radius:
- Behavior to preserve / verification gap:
- Related ADRs, notes, feature maps:
- Why this strength:
```

End with one top recommendation and a question: which candidate to grill.

## Optional HTML scaffold

Use inline CSS. No Tailwind CDN. Native `<div>` and `<svg>` are enough for before/after boxes.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>Architecture review for {{repo name}}</title>
    <style>
      body { font-family: ui-sans-serif, system-ui, sans-serif; background: #fafaf9; color: #0f172a; margin: 0; }
      main { max-width: 56rem; margin: 0 auto; padding: 2.5rem 1.5rem; }
      .badge-strong { color: #047857; }
      .badge-explore { color: #b45309; }
      .badge-spec { color: #475569; }
      .seam { stroke-dasharray: 4 4; }
      .leak { stroke: #dc2626; }
      .deep { background: #0f172a; color: #f8fafc; }
      .fallback { border: 1px solid #e2e8f0; padding: 0.75rem; }
    </style>
  </head>
  <body>
    <main>
      <header>...</header>
      <section id="candidates">...</section>
      <section id="top-recommendation">...</section>
    </main>
  </body>
</html>
```

If you still need Mermaid for a dense call graph, import it explicitly, say so in the header ("requires network access to mermaid"), and keep a `.fallback` list of the same edges as plain HTML.

## Candidate card

Each candidate is one article:

- **Title** plus classification (delete / deepen / preserve / reject)
- **Badge**: `Strong` / `Worth exploring` / `Speculative` with the reason
- **Files**, **Problem**, **Solution**, **Wins** (≤6 words, glossary terms)
- **ADR callout** when an active decision constrains the change

## Vocabulary

Use exactly: module, interface, implementation, depth, deep, shallow, seam, adapter, leverage, locality. Do not substitute component, service, unit, API, signature, or boundary.

Inspect the rendered HTML. If remote assets failed, present the fallback, not a blank page.
