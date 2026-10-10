---
layout: default
title: The Reservoir Model
parent: Background & Philosophy
nav_order: 3
---

# The Reserve Model

The Belly holds quote funds before procurement. The controller subtracts funds already reserved for existing entitlements before making a new meal allocation. Advancing the meal records budgets; the router later draws funds subject to the Belly's separate window allowance and execution conditions.

For an on-time 8-hour meal, the nominal allocation is at most **1/21 of unreserved quote funds**. A delayed advance counts at most 16 hours of eligible allocation time; it does not create every missed meal. Actual allocation also depends on launch and participation conditions. See [Belly allocation and limits]({% link protocol/belly.md %}).

## Ideal decay estimate

With no new inflow, allocation and settlement every eight hours, no pause or backlog, and integer rounding ignored, unreserved funds shrink by 20/21 per meal. The resulting model half-life is approximately **4.736 days**. This is an illustration of a regular schedule, not a deadline for actual payments or a guarantee of stable income.

## Settlement is separate

Each position selects a menu asset. Its accounting share is recorded before market procurement; the quantity finally received depends on execution or WBNB fallback. Price checks do not eliminate execution costs, MEV or delay. See [procurement and fallback]({% link protocol/execution.md %}).
