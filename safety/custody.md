---
title: Custody and invariants
parent: Safety and status
nav_order: 1
---

# Custody and invariants

## Principal

Staked FATCAT is principal, never reward inventory. The withdrawal path is
designed to remain open even if new stakes or reward settlement are paused.
No administrator should be able to move a position's principal.

## Reward capital

The Belly is designed without an administrative withdrawal, sweep or rescue
path. Its authorised outflow is restricted to protocol execution and capped per
window. The distributor that holds purchased rewards follows the same no-sweep
principle.

## Core invariants

1. Principal is never part of reward inventory.
2. Entitlement never changes retroactively.
3. Settlement never skips history.
4. An allocation belongs only to the weights active when it was computed.
5. Seniority rises monotonically during a position's life and resets on exit.
6. Accounting must conserve every unit across the Belly, pending execution,
   reserves, outstanding rewards and claims.

These properties are intended to be checked with unit tests, fuzzing,
differential accounting tests and live-network fork rehearsals.
