---
layout: default
title: Core Architectural Invariants
parent: Definitions & Notation
nav_order: 3
---

# Core Architectural Invariants

Every subsystem in TheFatCat is bound by strict, formally tested mathematical invariants:

1. **Principal Isolation Invariant (`StakingVault.sol`)**:
   $$\text{balanceOf}(\text{StakingVault}) \ge \sum_{i \in \text{Stakers}} p_i$$
   The principal vault receives 0% of trading taxes and 0% of external swaps. Redemption (`redeem()`) is unpausable and operates without administrator intervention under all conditions.

2. **Discrete Rate-Limiting Invariant (`Belly.sol`)**:
   $$\text{Emission}(m) \le U(m) \times \frac{\min(\Delta t, 16\text{h})}{168\text{h}}$$
   The reservoir never discharges 100% of accumulated inflows in a single transaction or block. Release rate is governed by an exponential damping operator anchored to a 168-hour calendar week.

3. **Constant-Time Evaluation Invariant (`SeniorityLedger.sol`)**:
   $$\text{GasCost}(\text{advance}()) = \mathcal{O}(|\mathcal{A}|), \quad \text{independent of } N$$
   State transitions require zero loops across individual stakers. Active weight evaluation $W(m)$ is maintained via scalar prefix sums updated in constant time.

4. **Non-Negative Dust Solvency Bound (`RewardDistributor.sol`)**:
   $$\sum_{i} \text{claimable}_i(a) \le \text{liability}(a) \le \text{balanceOf}(a)$$
   Integer truncation during share division floors payouts in favor of the protocol pool (claimant-adverse). Residual dust remains permanently within the distribution contract, ensuring zero under-collateralization.
