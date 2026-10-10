---
layout: default
title: Accounting Constraints
parent: Definitions & Notation
nav_order: 3
---

# Accounting Constraints

These rules explain how principal and rewards are recorded separately, and how allocations and outflows are limited. They do not establish safety for arbitrary token behavior, market value or chain outages.

## Principal Custody

The principal vault should retain FATCAT corresponding to recorded outstanding principal. Reward purchases are separate. Ordinary principal redemption remains available during a protocol pause; completion still depends on an available chain and successful token transfers. See [Custody Boundaries]({% link safety/custody.md %}).

## Allocation and Outflow

A new meal's budget uses recognized Belly reserves minus existing reserved funds, counting at most 16 hours. An on-time eight-hour meal in the reward period allocates at most 1/21 of this unreserved balance.

Actual outflow uses a different base: **the total WBNB balance when the eight-hour spending window opens**, including funds reserved for pending shares. The initial allowance is 16/168 of that balance. New deposits do not increase the current allowance. Allocation limits and outflow limits apply separately. See [Belly Rules]({% link protocol/belly.md %}).

## Advancement and Transaction Costs

Meal advancement does not process every staker individually, but it still handles the relevant menu assets. Menu size and the particular operation affect gas; this is not a fixed transaction-cost guarantee.

## Settled Rewards and Rounding

With valid accounting and supported token behavior, total claims from a batch should not exceed the assets actually received for it. Downward rounding may leave small residual balances in the reward-distribution stage.

Settled unclaimed rewards must retain their funding. Pending purchase budgets also cannot become free balance merely because a user has not claimed. Reservations can be released only when the rules establish that no eligible claimant remains. See [Custody Boundaries]({% link safety/custody.md %}) and [Procurement and Settlement]({% link protocol/execution.md %}).
