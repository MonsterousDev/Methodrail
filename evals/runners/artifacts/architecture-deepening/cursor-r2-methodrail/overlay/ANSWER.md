# Architecture deepening survey

Scope: current high-churn shop code. No source edits. Evidence is labeled. Git history is **unknown** in this tree (not a git repository); churn is taken from `CHURN.md` as historically-confirmed in the fixture.

## Candidates

### 1. `src/orderIntake.js` — **deepen** (Strong)

- **Churn / current work:** historically-confirmed 14 commits this month (`CHURN.md`). Hottest file.
- **Friction:** callers must supply `pricingInternals.priceCents` and `pricingInternals.taxCode`. Three channel entry points (`fromCart`, `fromApi`, `fromCli`) are identical pass-throughs to `intake`. Observed in source; **observed** at runtime that all four entry points only differ by which function name is used — they all return `{ id, total }` from `ledger.record`.
- **Deletion test:** deleting `fromCart` / `fromApi` / `fromCli` removes complexity (they add no behavior). Deleting `intake` itself would reappear as the same quote-and-record wiring at every channel. Intake earns a seam; it is not deep enough.
- **Interface leakage:** `priceCents` and `taxCode` cross the intake seam. Stored note `.methodrail/knowledge/intake.md` claims callers *return* those fields; **observed** source shows they are *inputs*. The leakage claim is still current; the “returns” wording is stale.
- **Related:** PROJECT.md calls this “hot shallow intake”. Knowledge: do not treat intake as already deep. ADR-0001 does not protect this module.
- **Verification:** no tests in the tree. Runtime characterization is cheap (in-process). See brief.

### 2. `src/billing/ledger.js` — **preserve**

- **Churn:** historically-confirmed 12 commits this month. High churn is not a rewrite reason.
- **Depth:** **observed** small interface `{ record, balance, reverse }` hiding in-memory rows, 10% tax (0 when `taxCode === "exempt"`), totals, and reverse-by-id. Runtime: `record({ priceCents: 1000, taxCode: "std", sku })` → `{ id: "1", total: 1100 }`; exempt → tax 0; `reverse` missing id → `null`.
- **ADR-0001:** keep money movement behind this interface; do not split ledger into pass-through helpers.
- Do not reopen the ADR. Deepening work must keep calling `ledger.record`.

### 3. `src/userService.js` — **delete/consolidate** (Speculative for this survey)

- Pass-through: `getUser` forwards to `db.getUser`. Deletion test: complexity vanishes.
- Not in the hot set. Out of scope for “current high-churn”.

### 4. `src/quiet/format.js` — **reject**

- **Observed** unused (`formatSku` has no in-tree callers). Historically-confirmed: no commits this quarter. Quiet speculative cleanup.

### 5. `src/db.js` — **reject**

- Quiet data adapter. No churn pointer. Not current work.

**Top recommendation:** deepen `orderIntake`. Ledger stays as-is.

---

# Refactor brief: deepen order intake

## Friction

Order intake is the hottest module and a shallow seam. Channel callers must know billing quote fields (`priceCents`, `taxCode`) and pick among three identical wrappers. Pricing knowledge is spread to every caller instead of sitting behind intake. Ledger already owns money movement; intake should own *quoting into that interface*, not re-export the quote shape.

## Current interface

```text
intake(order, pricingInternals) → { id, total }
fromCart(order, pricingInternals) → intake(...)
fromApi(order, pricingInternals) → intake(...)
fromCli(order, pricingInternals) → intake(...)
```

Callers must know: `order.sku`, `pricingInternals.priceCents`, `pricingInternals.taxCode`.  
**Observed** implementation copies those three fields into `quoted` and calls `ledger.record(quoted)`.  
**Observed** result is ledger’s `{ id, total }` only — quote fields do not come back.

## Proposed interface

Minimize the seam. One entry point; hide quoting.

```text
intake(order) → { id, total }
```

Callers know: `order.sku` (and any order fields needed to choose a price, once that table exists). They do not know `priceCents`, `taxCode`, or ledger’s `quoted` shape.

Drop `fromCart` / `fromApi` / `fromCli` until a channel actually differs (one-adapter / identical-wrapper deletion test). If a channel later needs different intake policy, add it as a real adapter, not a rename of the same function.

**In-process dependency** (DEEPENING.md category 1): `ledger` is in-memory. No new port. Tests call `intake` directly. Do not wrap ledger.

### Alternatives considered

| Design | Shape | Depth | Locality |
| --- | --- | --- | --- |
| A. Minimize (recommended) | `intake(order)` | Highest: quoting + record behind one call | Pricing + channel wiring concentrate in intake |
| B. Keep named channels | `fromCart(order)` etc., each hides pricing | Same depth, wider interface | Same, extra names with no current variance |
| C. Common-caller default | `fromCart(order)` as the only export | Similar, misnames the seam | Cart looks privileged; API/CLI still identical |

Recommendation: A. B is premature until two channels diverge. C is A with a worse name.

## Callers and blast radius

**In-tree callers of intake: none** (only the module’s own wrappers). Blast radius is the future cart/API/CLI call sites that today would have to pass `pricingInternals`. No other shop module `require`s `orderIntake.js`.

Do not change `ledger` exports. `userService`, `db`, and `formatSku` are out of blast radius.

## Behavior and contracts to preserve

From **observed** runtime (not test-confirmed in a suite):

- Non-exempt quote: `priceCents: 1000` → `{ total: 1100 }` (10% tax, rounded).
- `taxCode === "exempt"` → tax 0; `priceCents: 1000` → `{ total: 1000 }`.
- Success result stays `{ id, total }` with string ids `"1"`, `"2"`, …
- `ledger.record` remains the only money-movement write. Intake must not compute net/tax itself in a second place, and must not split ledger.

Unresolved vs preserve: where the *price* comes from once callers stop passing `priceCents`. That is the deepening. Until a price table exists, characterization should pin today’s mapping for known SKUs or a temporary internal quote helper **inside** intake — not on the public interface.

## Verification

**Baseline:** none. `package.json` has no test script; no test files.

**Gap:** add characterization at the *intake* seam before moving quoting:

1. `intake` with today’s quote inputs (or a fixture SKU once prices are internal) yields the same `{ id, total }` as current `ledger.record`.
2. Exempt vs standard tax.
3. After deepen, tests still only use `intake(order)` and assert `{ id, total }` — not `quoted`, not `rows`.

Ledger tests, if added, stay on `{ record, balance, reverse }` and should survive intake changes. Old wrapper-level tests (if any appear) become waste once the deepened seam is tested.

A UI visual baseline is N/A. Verification route is credible (in-process Node), so the candidate can be Strong once those tests exist. **Do not implement the deepen without them.**

## Related knowledge and ADRs

- `.methodrail/PROJECT.md` — orderIntake: hot shallow intake; ledger: deep.
- `.methodrail/knowledge/intake.md` — intake leaks pricing; do not treat as deep. Refresh if `src/orderIntake.js` changes. Stale clause: “returns priceCents and taxCode”; **observed** they are parameters.
- `docs/adr/0001-ledger-owns-money.md` — do not split ledger; keep money behind its small interface. This brief does not reopen it.
- No feature-map / verification skill in this tree.

## Unresolved choices

1. Price source inside intake (hardcoded SKU table vs injected in-process catalog). Catalog injection is still category 1 if it is in-memory; do not invent a network port.
2. Whether `order` grows fields (`qty`, customer tax status) or tax status stays an internal lookup.
3. Whether `balance` should ignore reversed rows (today it does not). That is ledger behavior; out of this brief unless intake starts depending on it.

## Route

**`/refactor`** for behavior-preserving deepen: same totals for the same SKU/tax facts, smaller interface, wrappers deleted.

Use **`/develop`** only if product intent is to change who is allowed to set prices (callers lose the ability to pass arbitrary `priceCents`). That is the likely real move; if so, lock the new price table in tests first, then land the interface shrink.

Not large enough for to-spec / to-tickets.
