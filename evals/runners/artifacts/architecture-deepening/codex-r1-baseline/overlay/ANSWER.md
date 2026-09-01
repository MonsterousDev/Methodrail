# Refactor brief: stabilize the order-to-ledger boundary

## Churn signal

The current churn record identifies `src/orderIntake.js` as the hottest file this month with 14 commits, followed closely by `src/billing/ledger.js` with 12 commits. There is no `.git` repository metadata in this worktree, so this brief uses `CHURN.md` as the available churn source.

## Top candidate

Deepen the boundary between order intake and billing by introducing a single explicit ledger command/value object at the intake boundary.

Today, `src/orderIntake.js` reaches into `pricingInternals` and forwards selected internal pricing fields directly to `ledger.record()`:

- `priceCents`
- `taxCode`
- `sku`

That makes order intake aware of pricing internals and ledger input shape at the same time. The three entrypoints, `fromCart`, `fromApi`, and `fromCli`, are currently identical pass-through wrappers around `intake()`, so any future channel-specific behavior is likely to keep accumulating in this hot file unless the boundary is clarified.

`src/billing/ledger.js` also owns tax calculation and money persistence, which matches `docs/adr/0001-ledger-owns-money.md`: "Ledger owns money" and should not be split into pass-through helpers. The refactor should preserve that decision. The goal is not to move money logic out of ledger; it is to stop upstream intake code from depending on loose pricing internals.

## Proposed shape

Create an explicit ledger recording input contract, for example:

```js
{
  sku,
  netCents,
  taxTreatment
}
```

Then make `orderIntake` responsible only for translating external order/channel input into that contract, while `ledger.record()` remains responsible for money calculation, tax calculation, row creation, balance behavior, and reversal behavior.

A pragmatic implementation path:

1. Add a small constructor/normalizer near the boundary, either in `src/orderIntake.js` initially or as a focused billing-owned module if the code grows.
2. Rename the ledger-facing fields away from `pricingInternals` names, especially `priceCents`, so the contract reads as ledger input rather than leaked pricing state.
3. Keep `ledger.record()` as the only function that computes tax and totals.
4. Add characterization tests for `fromCart`, `fromApi`, `fromCli`, `ledger.record`, `ledger.balance`, and `ledger.reverse` before changing names or flow.
5. Only after tests exist, make the channel entrypoints accept channel-shaped inputs directly instead of all delegating blindly to the same `(order, pricingInternals)` signature.

## Why this is the best candidate

This boundary sits exactly where the two high-churn files meet. It is also a domain boundary: order intake handles source/channel concerns, while ledger owns money movement. The current code keeps that separation only informally, through a small object literal in `orderIntake`. As the system changes, that informal boundary is likely to become a source of repeated edits because channel behavior, pricing payload shape, tax treatment, and ledger persistence all converge there.

By making the ledger command explicit, future changes have a clearer home:

- Channel parsing changes stay in order intake.
- Money calculation changes stay in ledger.
- Pricing internals can evolve without directly changing ledger callers.
- The existing ADR remains intact because ledger is still the money owner.

## Risks and constraints

The main risk is over-abstracting too early. The repository is currently small, and the ADR warns against splitting ledger into pass-through helpers. Keep the first refactor narrow: one explicit input contract, tests around existing behavior, and no new service layer unless real channel-specific behavior appears.

Avoid making `src/quiet/format.js` part of this refactor. `CHURN.md` says it has no callers and no commits this quarter, so it is not a high-churn architecture-deepening target.

## Definition of done

The refactor is complete when order intake no longer forwards raw `pricingInternals` directly to ledger, ledger still owns all money calculation, the three intake entrypoints have tests covering their current behavior, and the ledger API has a named, documented input shape that can absorb future pricing/channel changes without repeated edits across both hot files.
