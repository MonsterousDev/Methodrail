# Refactor brief: deepen `orderIntake`

## Survey

Hot files this month (from `CHURN.md`):

| File | Commits | Notes |
|---|---|---|
| `src/orderIntake.js` | 14 | Highest churn. Thin adapter plus three identical entry wrappers. |
| `src/billing/ledger.js` | 12 | Money owner. Small interface (`record`, `balance`, `reverse`). |
| `src/quiet/format.js` | 0 this quarter | Dead: no callers in this tree. Not a candidate. |

Other modules (`src/userService.js`, `src/db.js`) are pass-throughs but not in the current hot set.

Observed from source (not runtime):

- `orderIntake.intake` copies `pricingInternals.priceCents` / `taxCode` and `order.sku` into a quote object, then calls `ledger.record`.
- `fromCart`, `fromApi`, and `fromCli` are identical one-line wrappers around `intake`.
- `ledger.record` already owns tax math (10% unless `taxCode === "exempt"`) and returns `{ id, total }`.
- ADR-0001: keep money movement behind the ledger module’s small interface; do not split ledger into pass-through helpers.

## Top candidate

**`src/orderIntake.js`** — highest churn and the shallowest public surface on the hot path.

Ledger is the wrong target. It is already the money boundary, and ADR-0001 forbids splitting it into helpers. Churn there is more likely “money rules changing” than “module is too shallow.” `format.js` is unused noise, not architecture work.

## Problem

`orderIntake` does not hide complexity. Every caller must know ledger’s pricing fields (`priceCents`, `taxCode`) and pick among four exports that all do the same thing. That leaked quote shape plus the extra wrappers is a large interface with almost no behavior: a shallow module. High churn is the expected result — each new channel or quote tweak touches the same 24-line file.

## Proposed deepening

Keep ledger as the money owner. Make intake a single deep facade over “turn an order into a ledger recording.”

1. Collapse `fromCart` / `fromApi` / `fromCli` / `intake` into one public function, e.g. `intake(order, { source })`. Channel-specific rules belong inside that function, not as extra exports.
2. Stop taking `pricingInternals`. Accept a domain order (sku, quantity, customer/tax status, list price or catalog id) and compute or look up the quote internally before calling `ledger.record`. Callers should not mention `taxCode` or `priceCents`.
3. Return a small result (`id`, `total`, maybe `source`). Do not re-export ledger row fields.
4. Leave `src/billing/ledger.js` intact: same `record` / `balance` / `reverse` surface; no new pass-through helpers.

After the change, adding a channel should be an internal branch or mapper, not another exported wrapper and not another leak of tax/price fields.

## Out of scope

- Do not split or “simplify” the ledger.
- Do not delete `src/quiet/format.js` as part of this refactor (dead, but not on the hot path).
- Do not rewrite `userService` / `db` in this pass.

## Risks

- Existing callers of `fromCart` / `fromApi` / `fromCli` need a one-time signature change. There are no other in-repo callers today, so the blast radius in this tree is the intake module itself.
- Quote lookup (price, tax status) has to live somewhere. If it is invented ad hoc inside intake without a catalog/tax source, money rules could drift from the ledger. Prefer passing enough order facts for ledger.record to keep computing tax.
- `ledger.reverse` currently flags a row but `balance()` still sums it. Unrelated to intake; do not fold that into this refactor.

## Suggested steps

1. Replace the four exports with one `intake(order)` (source optional, used only inside the module).
2. Map order → `{ sku, priceCents, taxCode }` privately; call `ledger.record` once.
3. Update any future call sites to pass orders, not pricing internals.
4. Keep ADR-0001: all money movement still goes through `ledger.record`.
