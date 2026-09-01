# Project

## Architecture pointers

- [userService](../src/userService.js) — pass-through
- [orderIntake](../src/orderIntake.js) — hot shallow intake
- [ledger](../src/billing/ledger.js) — deep billing module
- [format](../src/quiet/format.js) — unused helper

## Decision records

- [ADR-0001](../docs/adr/0001-ledger-owns-money.md)

## Knowledge index

- [intake](knowledge/intake.md) — intake currently leaks pricing
