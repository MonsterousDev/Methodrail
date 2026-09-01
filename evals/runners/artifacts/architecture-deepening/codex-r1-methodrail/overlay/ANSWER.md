# Refactor Brief: Deepen `src/orderIntake.js`

## Top candidate

`src/orderIntake.js` is the strongest architecture-deepening candidate.

Recommendation strength: **Strong**.

## Evidence-backed friction statement

Observed churn: `CHURN.md:1` names `src/orderIntake.js` as hot with 14 commits this month. It is also marked in project context as "hot shallow intake" and in `.methodrail/knowledge/intake.md:13-21` as a verified leakage point where order intake callers pass pricing internals across the seam.

Observed source friction: `src/orderIntake.js:3-9` accepts `pricingInternals`, manually extracts `priceCents` and `taxCode`, adds `sku`, then forwards the shape to `ledger.record`. Its exported channel functions, `fromCart`, `fromApi`, and `fromCli`, are pass-through wrappers at `src/orderIntake.js:12-21`, so each caller-facing entry point still requires knowledge of pricing internals.

Inferred architectural issue: intake earns existence because it represents multiple intake channels, but its current interface is shallow. The caller-visible contract includes billing/pricing details that should be hidden behind intake or ledger-facing preparation.

## Current interface

Current exports: `intake(order, pricingInternals)`, `fromCart(order, pricingInternals)`, `fromApi(order, pricingInternals)`, `fromCli(order, pricingInternals)`.

Current caller burden: every entry path must supply an `order` plus a pricing-internal object containing at least `priceCents` and `taxCode`. That duplicates knowledge of the ledger entry shape outside the ledger-facing module.

## Proposed interface

Proposed direction: make intake accept source-specific order input and own the quote-to-ledger translation.

Candidate interface shape:

```js
fromCart(cartOrder)
fromApi(apiOrder)
fromCli(cliOrder)
```

Optional shared internal helper:

```js
recordIntake(source, order)
```

The important interface reduction is that callers should not pass `pricingInternals` across the intake seam. Intake should either derive the ledger entry from a stable quote/order representation or call a pricing/quote dependency internally, then submit the narrow ledger entry to `ledger.record`.

## Caller list and blast radius

Observed exported caller-facing functions:

- `src/orderIntake.js:12` `fromCart`
- `src/orderIntake.js:16` `fromApi`
- `src/orderIntake.js:20` `fromCli`

Observed repository references: `rg` found no other source callers in this fixture. Blast radius is therefore concentrated in `src/orderIntake.js` plus any external callers not present in the repository.

## Behavior and contracts to preserve

Preserve the ledger-facing behavior currently performed at `src/orderIntake.js:4-9` and `src/billing/ledger.js:3-8`:

- ledger receives `priceCents`, `taxCode`, and `sku`
- exempt tax code produces zero tax
- non-exempt tax is rounded 10% of `priceCents`
- successful intake returns the ledger result `{ id, total }`

Preserve ADR-0001: `docs/adr/0001-ledger-owns-money.md:3` says money movement stays behind the ledger module's small interface. This refactor should not split ledger into pass-through helpers or move money movement out of ledger.

## Verification route and gaps

Observed verification gap: there are no test/spec files and `package.json` has no scripts.

Baseline characterization route before refactoring:

- add focused characterization tests around `fromCart`, `fromApi`, and `fromCli`
- cover exempt tax, non-exempt rounded tax, `sku` propagation, returned `{ id, total }`, and ledger balance/reversal interactions if shared ledger state remains observable
- because `ledger.js` holds module-level mutable `rows`, tests will need module isolation or explicit state reset strategy

## Related knowledge and ADRs

- `.methodrail/PROJECT.md` identifies `orderIntake` as hot shallow intake and `ledger` as a deep billing module.
- `.methodrail/knowledge/intake.md` says order intake leaks pricing internals and should not be treated as a deep module.
- `docs/adr/0001-ledger-owns-money.md` protects the ledger seam.

## Rejected or lower-priority candidates

`src/billing/ledger.js` is also hot with 12 commits this month, but it is already a small ledger interface with meaningful behavior behind `record`, `balance`, and `reverse`. ADR-0001 explicitly says not to split it into pass-through helpers. Classification: **preserve**.

`src/quiet/format.js` has no callers and no commits this quarter per `CHURN.md:1`. It is not a current high-churn architecture-deepening candidate. Classification: **reject** as quiet speculative cleanup.

`src/userService.js` is a pass-through over `db.getUser`, but it is not identified as high churn. Classification: **delete/consolidate candidate only if it becomes active**, not part of this task's top recommendation.

## Unresolved choices

- Where pricing/quote data should come from once callers stop passing `pricingInternals`.
- Whether `intake` remains public or becomes an internal helper behind source-specific entry points.
- Whether ledger state isolation should be introduced for tests before or during the refactor.

## Route

Use `/refactor` for behavior-preserving work after characterization tests exist. Use `/develop` only if removing `pricingInternals` requires an intentional product contract change for external callers.
