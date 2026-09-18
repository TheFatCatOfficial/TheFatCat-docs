---
title: Custody & Solvency Proofs
parent: Security & Governance
nav_order: 2
---

# Custody & Solvency Proofs

A formal exposition of TheFatCat's non-custodial capital boundaries, zero-sweep invariant, and the mathematical proof of super-solvency via integer floor truncation.

---

## 1. Physical Isolation of Principal

In TheFatCat, staked FATCAT tokens are principal, never reward inventory:

- **Isolated Storage**: Staked tokens are locked strictly inside [`StakingVault.sol`]({% link contracts.md %}).
- **No Bridging to Belly**: Principal never touches `Belly.sol`, the router, or distributor contracts.
- **Unconditional Redemption**: `redeem()` ignores contract pauses and requires zero external keeper approvals.

---

## 2. The Zero-Sweep Principle

A "sweep", "rescue", or "skimming" function in a smart contract is simply an administrative backdoor with friendlier marketing.

{: .important }
**The Zero-Sweep Invariant**: None of the core protocol contracts (`StakingVault`, `Belly`, `RewardDistributor`, `SeniorityLedger`) contain any `sweepToken()`, `rescueFunds()`, or `emergencyWithdraw()` functions.

If a contract holds user funds, nobody — not the developer, not the multi-sig, not the community — can withdraw or transfer those assets except through the deterministic state-transition rules defined at deployment.

---

## 3. Mathematical Proof of Solvency (Non-Negative Dust Theorem)

A critical failure mode in DeFi dividend distributors is rounding overflow, where integer division rounding errors accumulate until the vault owes more tokens than it physically holds, causing transaction reverts for the final claimers.

TheFatCat mathematically eliminates insolvency through dual-scaled integer floor division:

### Theorem: Non-Negative Dust Vesting
Let $R$ (in D18{tok}) be the total reward tokens acquired in an execution batch, and let $S$ (in D18{quote}) be the allocated quote pot. For any $N$ stakers with quote entitlements $x_i$ satisfying $\sum_{i=1}^N x_i \le S$, the aggregate claimed tokens $\sum_{i=1}^N r_i$ is strictly less than or equal to $R$:

$$\sum_{i=1}^N r_i \le R$$

### Step-by-Step Proof:
1. **Batch Conversion Rate**:
   
   $$\text{Rate} = \left\lfloor \frac{R \cdot \text{RAY}}{S} \right\rfloor \le \frac{R \cdot \text{RAY}}{S}$$

2. **Per-User Claimed Tokens**:
   
   $$r_i = \left\lfloor \frac{x_i \cdot \text{Rate}}{\text{RAY}} \right\rfloor \le \frac{x_i \cdot \text{Rate}}{\text{RAY}}$$

3. **Summing Across All $N$ Claimers**:
   
   $$\sum_{i=1}^N r_i \le \sum_{i=1}^N \frac{x_i \cdot \text{Rate}}{\text{RAY}} = \frac{\text{Rate}}{\text{RAY}} \cdot \sum_{i=1}^N x_i$$

4. **Substituting Constraints**: Since $\sum_{i=1}^N x_i \le S$ and $\text{Rate} \le \frac{R \cdot \text{RAY}}{S}$:
   
   $$\sum_{i=1}^N r_i \le \frac{\text{Rate} \cdot S}{\text{RAY}} \le \frac{\left( \frac{R \cdot \text{RAY}}{S} \right) \cdot S}{\text{RAY}} = R \quad \blacksquare$$

### Corollary: Physical Dust Vesting (Security Invariant D1)
The residual rounding dust $\Delta_{\text{dust}} = R - \sum_{i=1}^N r_i \ge 0$ permanently vests inside the distributor. Physical reserves strictly dominate recorded accounting liabilities:

$$\text{balanceOf}(\text{Distributor}, a) \ge \text{liability}[a]$$

$$\text{balanceOf}(\text{Distributor}, \text{quote}) \ge \sum_a \text{quoteLiability}[a]$$
