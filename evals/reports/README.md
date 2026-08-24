# Eval reports

Maintainer comparison output lives here. `npm run eval` scores recorded example runs. It does not launch an agent.

Committed examples are under `evals/runners/examples/`. Generated files matching `*.generated.md` are ignored.

A report should answer:

- Did Methodrail help?
- Where?
- At what cost?
- What extra complexity appeared?

Tracked cost signals: skill count, loaded references, subagents, verification steps, latency if provided. More steps can be better when they prevent an expensive miss.
