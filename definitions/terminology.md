---
layout: default
title: Dual-Track Terminology Matrix
parent: Definitions & Notation
nav_order: 2
---

# Dual-Track Terminology Mapping

To maintain bridging between community communications and mathematical specifications, the protocol defines an exact two-way mapping between product metaphors and formal smart contract components:

| Product Metaphor | Technical Formal Term | Smart Contract Entity | Mathematical Symbol | Implementation Invariant |
|:---|:---|:---|:---|:---|
| **The Belly** | Rate-Limited Treasury Reservoir | `Belly.sol` | $\mathcal{B}$ | Single authorized spender (`ExecutionRouter`), unprivileged, zero admin sweep. |
| **Meal** | Discrete Accounting Interval | `IntervalController.sol` | $m$ ($\Delta t \ge 8\text{h}$) | Advances only when $\Delta t \ge 8\text{h}$; evaluated at discrete boundaries. |
| **Diet** | Output Reward Asset | Whitelisted `address asset` | $a \in \mathcal{A}$ | User-selected; WBNB default fallback; decoupled accounting from execution. |
| **Seniority Ladder** | Additive Duration Multiplier | `SeniorityLedger.sol` notch | $c_i(m) \in [1, 22]$ | Linear additive climbing ($+1/\text{interval}$); capped at 22; non-compounding. |
| **Graduation Ring** | 22-Slot Circular Buffer | `graduatingPrincipal[m % 22]` | $P_{\text{settled}}, P_{\text{climb}}$ | Cohort scalar shift in $O(1)$ constant gas, independent of staker count $N$. |
| **Forfeit** | Unfinalized Interval Weight Surrender | `forfeitedWeight` | $W_{\text{exiting}}$ | Early exit before interval close surrenders current interval's unfinalized rewards. |
| **Belly Flush / Drain** | Outflow Cap Throttle | `Belly.release(amount)` | $\text{OutflowLimit}_m$ | Maximum single-window draw $\le U(m) \times 16/168 \approx 9.5238\%$. |
