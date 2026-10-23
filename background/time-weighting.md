---
layout: default
title: Time Weighting
parent: Design Background
nav_order: 4
---

# Time Weighting

Reward weight combines deposited principal, the position's seniority multiplier and the incentive multiplier of its diet asset:

$$w_i = p_i \, c_i \, k_a$$

For an ordinary position, the multiplier is zero before its participation boundary, starts at 1× in the next meal and rises by 1× per active meal to 22×. The 21-step climb takes seven days only under regular eight-hour advancement after eligibility starts; maintenance delays can extend it.

At equal seniority, ten times the principal produces ten times the weight. A 22× position has 22 times the weight per unit principal of a 1× position, but its reward also depends on revenue, all other weights and settlement. Larger deposits can still receive larger total shares.

## Exit

Ordinary principal redemption remains available during a protocol pause and has no exit fee. Exiting ends future participation and forfeits the unfinalized active-meal entitlement. Finalized rewards remain claimable. An ordinary new position starts its own seniority history.

Further reading: [meals and seniority]({% link protocol/meals-and-seniority.md %}), [staking]({% link guides/staking.md %}) and [certificates]({% link guides/seniority-certificates.md %}).
