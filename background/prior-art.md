---
layout: default
title: Related Mechanisms & References
parent: Background & Philosophy
nav_order: 2
---

# Related Mechanisms and References

Reserve allocation, time weighting and cumulative reward indexes address different questions. Comparing them requires the same accounting units, participation boundaries and asset assumptions; a shared rounding operation alone does not establish equivalent safety.

| Topic | TheFatCat's approach | Details |
|:---|:---|:---|
| Accounting cadence | Meals last at least eight hours; an advance ends at most one meal. | [Meal rules]({% link protocol/meals-and-seniority.md %}) |
| Position weighting | Principal multiplied by an accrued seniority coefficient. | [Meals & Seniority]({% link protocol/meals-and-seniority.md %}) |
| Claims | Settled reward records preserve each position's historical entitlements for later claiming. | [Custody and accounting]({% link safety/custody.md %}) |
| Rounding | Integer payout calculations round down; residue is retained by the distributor. | [Accounting constraints]({% link definitions/invariants.md %}) |
| Market execution | Procurement uses TWAP, liquidity and output checks, with conditional WBNB fallback. | [Execution]({% link protocol/execution.md %}) |

## Reference material

- [Curve voting escrow documentation](https://curve.readthedocs.io/dao-vecrv.html): A reference for locked-duration voting weight.
- [Pendle documentation](https://docs.pendle.finance/): Protocol mechanics and version-specific tokenomics.
- [Synthetix V3 overview](https://blog.synthetix.io/a-quick-explainer-on-synthetix-v3/): Pool, collateral and reward-distributor architecture.

These references are publicly accessible and describe only their respective systems. This project makes no claim that TheFatCat is unique, safer than other protocols or formally verified. Source review and testing remain dependent on the version and behavior being examined.
