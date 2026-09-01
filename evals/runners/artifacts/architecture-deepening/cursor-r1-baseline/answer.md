# Refactor brief: deepen order intake

## Survey

High-churn this month (from `CHURN.md`):

| File | Commits | Role |
|---|---|---|
| `src/orderIntake.js` | 14 | Order entry; four nearly identical functions that leak pricing internals into `ledger.record` |
| `src/billing/ledger.js` | 12 | Money movement: tax, net, reverse, balance |

Other code is not a deepening candidate:

- `src/quiet/format.js` — no callers, no commits this quarter. Dead, not hot.
- `src/userService.js` / `src/db.js` — pass-through, but not in the churn set.

ADR-0001 keeps money behind the ledger's small interface (`record`, `balance`, `reverse`) and forbids splitting ledger into pass-through helpers. Ledger is already the deep module. Churn there is expected; splitting it would make the architecture shallower.

**Top candidate: `src/orderIntake.js`.**

## Why this file

The module is shallow: a wide surface and almost no hidden complexity.

```js
function intake(order, pricingInternals) {
  const quoted = {
    priceCents: pricingInternals.priceCents,
    taxCode: pricingInternals.taxCode,
    sku: order.sku,
  };
  return ledger.record(quoted);
}

function fromCart(order, pricingInternals) { return intake(order, pricingInternals); }
function fromApi(order, pricingInternals)  { return intake(order, pricingInternals); }
function fromCli(order, pricingInternals)  { return intake(order, pricingInternals); }
```

Problems:

1. **Channel wrappers add no behavior.** `fromCart` / `fromApi` / `fromCli` are identical pass-throughs. Every intake change is multiplied across four exports, which matches the 14-commit hotspot.
2. **Pricing internals leak across the seam.** Callers must supply `priceCents` and `taxCode`. Intake does not quote, validate, or hide tax policy; it copies fields and forwards them. Pricing knowledge lives in every caller instead of behind one interface.
3. **Ledger stays correctly deep.** Tax math and reversal already belong in `ledger.js`. Intake should not grow money logic, and ledger should not be split (ADR-0001).

## Proposed shape

Collapse to one intake function whose argument is an order, not a pricing dump:

```js
function intake(order) {
  const quote = pricing.quote(order); // priceCents + taxCode derived here
  return ledger.record({ sku: order.sku, ...quote });
}

module.exports = { intake };
```

- Delete `fromCart`, `fromApi`, `fromCli`. Channel differences belong in the cart/API/CLI adapters, or they do not exist.
- Hide `priceCents` / `taxCode` behind a pricing quote (new small module or a function local to intake). Callers pass `sku` (and whatever order fields quoting needs), not tax codes.
- Keep calling `ledger.record` with the same money fields. Do not add tax, totals, or reverse into intake. Do not add intake-shaped helpers inside ledger.

## Out of scope

- Do not refactor `src/billing/ledger.js` into thinner wrappers.
- Do not spend this pass on `src/quiet/format.js` or `userService` unless they start showing up in the hot set.
- Do not edit source in this survey; this brief is the deliverable.

## Success criteria

- One public intake entry point.
- No caller outside pricing/ledger mentions `taxCode` or raw `priceCents` for intake.
- Ledger interface unchanged: `record`, `balance`, `reverse`.
- Follow-up churn on order entry concentrates in quoting or in ledger, not in cloned channel wrappers.
