---
layout: default
title: The Belly Hydrodynamics
parent: Core Mechanics
nav_order: 1
---

# The Belly Reserve and Release Mechanics

The Belly holds WBNB reward reserves. Meal allocation and actual treasury outflow are separate operations.

![The Belly Reserve Model]({{ '/assets/images/fig2-hydrodynamics.svg' | relative_url }}?v=20261010u2)

## 1. Meal Allocation

On a successful meal advance, the protocol computes a budget from the net unreserved balance:

The budget uses unreserved funds and eligible reward time as a fraction of 168 hours, counting at most 16 hours and rounding down.

- The calculation excludes funds already reserved for earlier allocations, so the same funds are not allocated twice.
- Rewarded time excludes the initial seven-day accumulation period. Advances require at least eight hours, but each closes only one meal and starts the next at the current timestamp. Delays do not backfill missed meals.
- An on-time, fully rewarded eight-hour meal budgets 8/168 = 1/21, about 4.76%, of unreserved funds. This denominator corresponds to 21 eight-hour meals per week.
- Per-asset integer floors, probation caps and meals without eligible claimants can leave part of the budget unallocated. Below the minimum release weight, no new budget is allocated.

Advancing a meal records allocations without moving tokens. Funds leave Belly later, when purchases, direct WBNB settlement or fallback funding complete. See [Execution and settlement order]({% link protocol/execution.md %}).

## 2. Ideal Decay Model

With no new inflow, regular eight-hour advances and no allocation constraints, unreserved stock follows the simplified model:

$$U_k = U_0\left(\frac{20}{21}\right)^k$$

The discrete half-life is approximately **4.736 days**, and about **1.24%** remains after 30 days. This describes an ideal allocation model, not a promised payout schedule or the physical Belly balance while allocations await settlement.

## 3. Eight-Hour Outflow Cap

To limit concentrated outflows, Belly enforces a standing maximum within each eight-hour window. At initial deployment, the cap is **16/168, about 9.5238%, of the total WBNB balance at window opening**, rounded down.

**This is a safety ceiling, not a fixed payout percentage every eight hours.** Normal meal budgets follow the meal allocation rules and settle when execution conditions are met.

When market execution is blocked or other exceptional conditions delay settlement of allocated rewards, pending funds can accumulate. Concentrated outflows after settlement resumes may reach this cap. A settlement that exceeds the window's remaining allowance cannot execute; it must wait for a later window and still meet settlement conditions.

The cap is independent of allocation accounting and applies to all actual Belly outflows. Consecutive windows require at least eight hours between openings, and deposits during a window do not raise its allowance. The cap slows concentrated outflows, but does not guarantee detection or intervention.

Global meal order and whole-allocation requirements can delay a release even when a pool is fallback-eligible. Claims of **already settled** rewards draw from separately recorded reward funds and do not consume Belly's allowance.

## 4. Opening Rules and Operating State

- Reward outflow requires an initial authorization with a separate seven-day delay. This is independent of the seven-day reward warmup after staking opens; the two periods need not end together.
- No new reward budget is allocated during warmup. Tax inflow still depends on successful upstream liquidation and QQQB conversion.
- Emergency measures can pause Belly outflows. Principal redemption and claims of already settled rewards do not depend on Belly's pause state.
