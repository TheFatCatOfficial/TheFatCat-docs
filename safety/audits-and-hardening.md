---
layout: default
title: Audits & Hardening Post-Mortems
parent: Security & Governance
nav_order: 2
---

# Audits & Hardening Post-Mortems

During adversarial auditing and internal formal verification (PocAudit test harness), several critical accounting edge cases, race conditions, and precision bounds were investigated and systematically hardened. 

This document discloses three representative accounting vulnerabilities and the formal defenses implemented in production contracts, complete with test references from `contracts/test/`.

---

## 1. Upstream Payout Interleaving & Wrapper Race Condition

- **Test Suite**: [`SweepWrappedRace.t.sol`](file:///Users/levan/Desktop/TheFatCat/contracts/test/SweepWrappedRace.t.sol)
- **Target Contracts**: `FatCatStakingVault.sol`, `FatCatStakingVaultFactory.sol`

### Vulnerability Vector
Upstream launchpad protocols (such as Flap V3) deliver protocol yield to external vaults through a split pattern: an ERC-20 / wrapped native transfer followed by an asynchronous notification ping (`transfer-then-ping`). 

This architecture created a potential race condition:
1. If an unprivileged caller front-runs or interleaves a call to `sweepWrapped()` between the physical asset transfer and the ping notification, the funds are swept into The Belly before the vault's accounting hook registers the deposit.
2. If an upstream wrapper (e.g., WBNB) reverts or pauses temporarily mid-execution, a partial state update could desynchronize recorded vault revenue from physical custody.

### Hardening & Verification
The vault was hardened with idempotent state checks and atomic unwrapped/wrapped self-healing:
- Before `flush()`, native BNB revenue sits unwrapped; calling `sweepWrapped()` is a harmless no-op because wrapped token balances are zero.
- Mid-flush execution introduces zero reentrancy surface: external invocations are restricted strictly to trusted wrapper contracts.
- In `SweepWrappedRaceTest`, an adversarial interleaving was simulated where payouts are transferred and intercepted by a sweep before the ping. The test suite proved that custody is conserved, no funds are stranded, and the contract balance self-heals without administrative intervention.

---

## 2. Multi-Position Rounding Residue & Liability Bounding

- **Test Suite**: [`RewardDustEstimate.t.sol`](file:///Users/levan/Desktop/TheFatCat/contracts/test/RewardDustEstimate.t.sol)
- **Target Contracts**: `RewardDistributor.sol`, `SeniorityLedger.sol`

### Vulnerability Vector
When distributing batch rewards $R$ among $M$ active positions, each position's claim is computed via integer division:

$$r_i = \left\lfloor \frac{R \cdot W_i}{W_{\text{active}}} \right\rfloor$$

In a high-throughput system with thousands of open positions spanning dozens of consecutive intervals, cumulative rounding residue could theoretically drift or, if rounded upwards, result in vault insolvency ($\sum r_i > R$). Conversely, if residue accumulates without clear liability accounting, stakers might be unable to withdraw their full allocations.

### Hardening & Verification
The accounting engine enforces a strict **claimant-adverse integer floor** discipline:
- Floor truncation is applied once per claim calculation (`SeniorityLedger.sol:863–867`), guaranteeing that each allocation $r_i$ is at most the mathematically exact share.
- In `RewardDustEstimateTest`, large-scale simulations were executed under varying scenarios:
  - 2 positions across 30 batches
  - 99 positions across 30 batches (both batched and immediate claiming)
  - 1,000 positions across 30 batches (both batched and immediate claiming)
- The test harness formally verified:
  
  $$\text{balanceOf}(\text{Distributor}) \equiv \text{liability}(\text{token})$$

  Residual truncation dust is bounded to sub-wei fractions per allocation, remains permanently accounted for within the unassigned contract balance, and never exceeds physical custody.

---

## 3. Vault Revenue Split Integrity & Skimming Prevention

- **Test Suite**: [`VaultRevenueSplit.t.sol`](file:///Users/levan/Desktop/TheFatCat/contracts/test/VaultRevenueSplit.t.sol)
- **Target Contracts**: `FatCatStakingVault.sol`

### Vulnerability Vector
In conventional staking vault implementations, revenue-sharing ratios between the protocol treasury, operations, and stakers are often stored in mutable storage variables managed by administrative roles or multisig timelocks. 

This introduces two distinct vulnerabilities:
1. **Governance Skimming**: A malicious or compromised admin key can increase the operational cut to 100%, siphoning all staking yield before depositors can react.
2. **Migration Desynchronization**: Changing fee parameters mid-stream can cause discrepancies between accrued but unforwarded revenue and new distribution ratios.

### Hardening & Verification
To permanently eliminate governance skimming attack vectors, the revenue split is hardcoded as an immutable mathematical constant:
- **Operations Cut**: Exactly $3/19$ ($\approx 15.789\%$) routed to the operations Safe.
- **Protocol Belly Cut**: Exactly $16/19$ ($\approx 84.211\%$) routed to The Belly.
- There are **no setter functions**, no administrative override interfaces, and no governance upgrade pathways for this ratio (`FatCatStakingVault.sol:94–95`).
- In `VaultRevenueSplitTest`, tests verify that every incoming unit of revenue is atomically split according to the $3/19$ ratio, and that third-party callers cannot alter or divert the flow.

---

## Adversarial Test Suite Index

The complete suite of hardening and adversarial tests is available in the protocol codebase:

| Test File | Target Domain | Core Invariant Verified |
| :--- | :--- | :--- |
| `contracts/test/SweepWrappedRace.t.sol` | Payout Concurrency | Custody conservation under transfer/ping interleaving; zero reentrancy during wrapper unwraps. |
| `contracts/test/RewardDustEstimate.t.sol` | Integer Arithmetic | Physical custody always equals recorded liability; dust accumulation bounded at $O(M \times N)$ wei. |
| `contracts/test/VaultRevenueSplit.t.sol` | Fee Accounting | Non-dilutable $3/19$ operational split; zero admin fee adjustment surface. |
| `contracts/test/PocAudit09Invariant.t.sol` | Seniority State Machine | Total seniority weight monotonically increases with interval cadence up to $22.0\times$ cap. |
| `contracts/test/PocAudit03Oracle.t.sol` | TWAP Price Feeds | Harmonic liquidity floor prevents manipulation of execution router conversion quotes. |
