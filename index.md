---
title: Home
layout: home
nav_order: 1
---

# TheFatCat

Trading fees pool in a treasury. Feeders choose which asset the treasury buys
for their positions, and time in the pool determines each position's share of
the next purchase.

{: .warning }
The protocol is not live. Contract addresses, transaction links and launch
dates are intentionally absent until deployment and verification are complete.

## Start here

- [Protocol overview]({% link protocol.md %}) explains the product in one pass.
- [Fees and the Belly]({% link protocol/belly.md %}) documents how trading fees
  are pooled and released.
- [Meals and seniority]({% link protocol/meals-and-seniority.md %}) explains
  eligibility, timing and exits.
- [Custody and invariants]({% link safety/custody.md %}) states the properties
  the contracts must preserve.
- [Risks and launch status]({% link safety/risks-and-status.md %}) records what
  is unfinished and what the mechanism does not promise.

## The short version

TheFatCat treats fees as a reservoir rather than a pass-through. A meal releases
a fraction of the Belly instead of distributing only the fees collected during
that period. Each position has one diet, its own seniority and its own claimable
reward history.

There is no published APY or APR. Rewards depend on trading activity, the Belly
balance, eligible weight and the assets Feeders choose.
