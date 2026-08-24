---
name: wayfinder
description: "Plan work too large or foggy for one session as a shared map of decision tickets, resolved one at a time until the way is clear. Use for huge uncertain projects, not for ordinary planning or implementation."
disable-model-invocation: true
---

# Wayfinder

A loose idea has arrived, too big for one agent session, and wrapped in fog. Wayfinding finds the way; it does not charge at the destination. Chart the way as a **shared map** of **decision tickets** (questions whose resolution is a decision, not slices of a build), then resolve them one at a time until the route is clear.

This is Methodrail's operational implementation of the [decision frontier](../../references/decision-frontier.md). Do not replace it with a simplified summary. Do not force foggy large work into a premature full implementation plan.

## Plan, don't do

Each ticket resolves a decision. The map is done when the way is clear. The pull to just do the work is usually the signal you've reached the edge of the map. Absent an explicit Notes override, produce decisions, not deliverables.

## Refer by name

Every map and ticket has a **name** (its title). Refer to it by that name, never by a bare id.

## The map

The map is an **index**, not a store. Decisions live in their tickets. The map gists and links.

**Where it lives:** use the project's existing issue tracker when one is already in use (native parent/child and blocking if the tracker has them). Otherwise use local markdown:

```text
.scratch/<effort-slug>/wayfinder/MAP.md
.scratch/<effort-slug>/wayfinder/tickets/<nn>-<slug>.md
```

Labels such as `wayfinder:map` apply on real trackers. Locally, the MAP.md file *is* the map. Do not require a setup skill.

### The map body

```markdown
## Destination

<what reaching the end looks like. One or two lines.>

## Notes

<domain; skills every session should consult; standing preferences>

## Decisions so far

- [<closed ticket title>](link): <one-line gist>

## Not yet specified

<in-scope fog you can't ticket yet>

## Out of scope

<work ruled beyond the destination>
```

Open tickets are **not** listed on the map; they are found by query (or by listing the tickets directory).

### Tickets

Each ticket is a child of the map, sized to one session:

```markdown
## Question

<the decision or investigation this ticket resolves>
```

Types: `research`, `prototype`, `grilling`, `task`.

- **Research** (AFK): call `research`.
- **Prototype** (HITL): call `prototype`.
- **Grilling** (HITL): call `grill-with-docs` (which includes `domain-modeling`).
- **Task**: manual work that unblocks a decision, not delivery of the destination.

A session **claims** a ticket before any work. A ticket is **unblocked** when every blocker is closed. The **frontier** is open, unblocked, unclaimed children.

## Fog of war

Don't chart what you can't yet see. **Ticket** when the question is already sharp. **Not yet specified** when you can't yet phrase it that sharply. Out of scope is not fog.

## Invocation

Never resolve more than one ticket per session, except research tickets which may run in parallel.

### Chart the map

1. **Name the destination** with `grill-with-docs`.
2. **Map the frontier**, breadth-first. If this surfaces no fog (the whole journey fits one session), stop and ask how the user wants to proceed. You don't need a map.
3. **Create the map.**
4. **Create the tickets you can specify now**, then wire blocking edges.
5. **Fire research subagents** for research tickets.
6. Stop. Charting hand-resolves nothing.

### Work through the map

1. Load the map (low-res).
2. Choose the next frontier ticket, or the one the user named. Claim it.
3. Resolve it. Call skills named in Notes; default `grill-with-docs` if in doubt.
4. Record the answer, close the ticket, append a gist to Decisions so far.
5. Add newly surfaced tickets; graduate fog that is now specifiable; rule out-of-scope work out of the route.
