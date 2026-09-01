# Architecture survey and refactor brief

Survey of current high-churn code only. Source was not edited. Claims are labeled **observed** (read from files in this tree), **test-confirmed** (exercised with `node` this turn), or **historically-confirmed** (`CHURN.md`; this tree is not a git repository, so commit counts were not re-derived).

Knowledge note `.methodrail/knowledge/intake.md` was freshness-checked against `src/orderIntake.js`. The claim that callers pass pricing internals across the intake seam still holds. The note’s evidence line (“returns priceCents and taxCode to three callers”) is imprecise: the three channel wrappers **require** `pricingInternals` on the way in and forward `priceCents` / `taxCode` to the ledger; they return `{ id, total }`, not those fields.

## Candidates

| Module | Churn / relevance | Deletion test | Classification | Strength |
| --- | --- | --- | --- | --- |
| `src/orderIntake.js` | Hot this month (**historically-confirmed**: 14 commits). PROJECT.md: hot shallow intake. | Delete `fromCart` / `fromApi` / `fromCli` and complexity vanishes (identical pass-throughs). Delete `intake` and quoting + pricing-field assembly reappear at every caller. Earned seam, still shallow. | **deepen** (and consolidate the three wrappers) | **Strong** |
| `src/billing/ledger.js` | Hot this month (**historically-confirmed**: 12 commits). | Delete it and tax, totals, in-memory rows, `balance`, and `reverse` reappear across callers. Small interface already hides that. | **preserve** | — |
| `src/userService.js` | Not in current-work churn. | Delete it and callers just call `db.getUser`. Pass-through. | **delete/consolidate** | Speculative (quiet, not current work) |
| `src/quiet/format.js` | No callers, no commits this quarter (**historically-confirmed**). | Unused helper. | **reject** | — |

**Ledger is not a rewrite candidate.** High churn on an already-deep module is not a reason to split it. ADR-0001: keep money movement behind the ledger’s small interface; do not split ledger into pass-through helpers.

**Top recommendation:** deepen `orderIntake`. The rest of this document is the refactor brief for that candidate.

---

# Refactor brief: deepen order intake

## Friction

`orderIntake` is the hottest file and a shallow seam.

**Observed:** every public entry point is `(order, pricingInternals)`. `intake` copies `pricingInternals.priceCents`, `pricingInternals.taxCode`, and `order.sku` into a quote and calls `ledger.record`. `fromCart`, `fromApi`, and `fromCli` are identical wrappers around `intake`. Callers must know pricing internals to use intake at all.

**Test-confirmed this turn:**

- `fromCart({ sku: "SKU-1" }, { priceCents: 1000, taxCode: "standard" })` → `{ id: "1", total: 1100 }`
- `fromApi(..., { priceCents: 1000, taxCode: "exempt" })` → `{ id: "2", total: 1000 }`
- `fromCli(..., { priceCents: 500, taxCode: "standard" })` → `{ id: "3", total: 550 }`
- `intake(..., { priceCents: 200, taxCode: "standard" })` → `{ id: "4", total: 220 }`
- `ledger.balance()` after those four records → `2870`
- `ledger.reverse("1")` marks the row reversed; missing id → `null`

Expected interface reduction: drop `pricingInternals` from the public seam, and drop the three identical channel wrappers until a channel actually varies.

## Current interface

```text
intake(order, pricingInternals) → { id, total }
fromCart(order, pricingInternals) → { id, total }
fromApi(order, pricingInternals)  → { id, total }
fromCli(order, pricingInternals)  → { id, total }
```

Callers must know: `order.sku`, `pricingInternals.priceCents`, `pricingInternals.taxCode`. Ordering: none. Errors: none declared; `ledger.record` always records. Downstream ledger interface (do not widen or split): `record({ priceCents, taxCode, sku })`, `balance()`, `reverse(id)`.

## Proposed interface

Design-it-twice comparison (same constraints: still call `ledger.record`; hide `priceCents` / `taxCode`; in-process dependency on ledger — DEEPENING category 1):

1. **Minimize (recommended):** one entry point `intake(order)` with `order.sku`. Pricing lookup and quoting live in the implementation. Delete `fromCart` / `fromApi` / `fromCli`. Highest leverage; wrappers fail the deletion test today.
2. **Maximise flexibility:** keep three channel functions, each taking only `order`, with per-channel pricing rules inside. Extra surface with no current variation — a hypothetical seam (one adapter, three names).
3. **Optimise for the common caller:** make `fromCart(order)` the trivial default and leave API/CLI as thin aliases. Same as (2) until cart actually differs.

**Recommendation:** design 1. Intake owns quoting; ledger still owns money (ADR-0001). Do not introduce a pricing port unless a second adapter is real (production + test stand-in). In-process pricing behind `intake` is enough.

```text
intake(order) → { id, total }   // order.sku; pricing internals not part of the interface
```

## Callers and blast radius

In-tree, nothing else `require`s `orderIntake`. The public seam is the four exports; the three wrappers are the only in-tree callers of `intake`.

Blast radius of deepening: those three wrappers and any out-of-tree callers that currently pass `pricingInternals`. Ledger callers other than intake are unaffected if `record` / `balance` / `reverse` stay put. Do not touch `src/billing/ledger.js` as part of this refactor.

## Behavior and contracts to preserve

- Ledger still receives `{ priceCents, taxCode, sku }` and still computes tax (**test-confirmed**: 10% of `priceCents`, or `0` when `taxCode === "exempt"`).
- `record` still returns `{ id, total }` with `total = net + tax`.
- `balance` and `reverse` unchanged.
- Same sku on the stored row as `order.sku`.
- No new money-movement helpers outside ledger.

## Verification

**Baseline:** none. `package.json` has no test script; no test files exist outside skills.

**Credible route (must land before or with the refactor):** characterization tests through today’s leaky seam, then replacement tests through `intake(order)`:

- standard tax: `priceCents: 1000` → `total: 1100`
- exempt: `priceCents: 1000` → `total: 1000`
- sku forwarded into the ledger row (observable via `reverse` or a later `record` result plus `balance`)

After deepening, delete characterization that exists only to pin `pricingInternals` on the public interface. The interface is the test surface. Dependency category: in-process; no adapter.

A UI baseline is not applicable. This can be **Strong** because the verification path is in-process and already exercised once this turn.

## Related knowledge and ADRs

- `.methodrail/knowledge/intake.md` — intake leaks pricing; do not treat current intake as deep. Refresh when `src/orderIntake.js` changes.
- `.methodrail/PROJECT.md` — orderIntake is the hot shallow intake; ledger is the deep billing module.
- ADR-0001 — ledger owns money; do not split ledger. This brief does **not** reopen that ADR.
- Feature-map: none in this tree.

## Unresolved choices

- Where `priceCents` and `taxCode` come from once callers stop passing them (in-module table keyed by sku vs. a later real pricing adapter). Must be decided before implementation; default is an in-process lookup inside intake.
- Whether any out-of-tree caller actually needs a distinct cart/API/CLI seam. In-tree evidence says no.
- Whether wrapping `intake` after deepening is `/refactor` (same totals, smaller interface) or `/develop` (intake starts owning a pricing policy that callers used to supply). If pricing numbers stay equivalent for known skus, `/refactor`; if intake invents new prices, `/develop`.

## Route

**`/refactor`** once characterization exists and pricing lookup is specified as equivalent to today’s caller-supplied numbers.

Not `/develop` unless the work changes quoted money. Not `to-spec` / `to-tickets`: one module, one seam, one in-process dependency.
