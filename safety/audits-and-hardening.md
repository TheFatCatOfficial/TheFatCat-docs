---
layout: default
title: Audits & Hardening Post-Mortems
parent: Security & Governance
nav_order: 2
---

# Audits & Hardening Post-Mortems

File names below are internal implementation/test references, not public source links. Published source verification is referenced on the [Contracts]({% link contracts.md %}) page.

During adversarial auditing and internal regression and invariant testing (PocAudit test harness), several critical accounting edge cases, race conditions, and precision bounds were investigated and systematically hardened.

This document discloses three representative accounting vulnerabilities and the contract changes and tests that cover those scenarios, complete with test references from `contracts/test/`.

---

## 1. Upstream Payout Interleaving & Wrapper Race Condition

- **Test Suite**: `SweepWrappedRace.t.sol`
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

- **Test Suite**: `RewardDustEstimate.t.sol`
- **Target Contracts**: `RewardDistributor.sol`, `SeniorityLedger.sol`

### Vulnerability Vector
When distributing batch rewards $R$ among $M$ active positions, each position's claim is computed via integer division:

$$r_i = \left\lfloor \frac{R \cdot W_i}{W_{\text{active}}} \right\rfloor$$

In a high-throughput system with thousands of open positions spanning dozens of consecutive intervals, cumulative rounding residue could theoretically drift or, if rounded upwards, result in vault insolvency ($\sum r_i > R$). Conversely, if residue accumulates without clear liability accounting, stakers might be unable to withdraw their full allocations.

### Hardening & Verification
The accounting engine rounds down at several stages, including quote entitlements, batch conversion rates and token claims. The displayed single-floor equation illustrates the direction of rounding; it is not the full implementation.

`RewardDustEstimateTest` samples 2, 99 and 1,000 positions across one or 30 batches, including immediate and accumulated claims. After the sampled users claim, it checks that the remaining asset balance equals recorded residual liability. That result is a scenario assertion, not a universal bound on dust.

A single mathematical floor loses less than one unit at that operation's scale. Multiple rounding stages and fixed-point conversions can accumulate larger residuals; these tests do not establish a universal sub-wei or one-wei-per-position-per-batch bound. Residue remains recorded in the Distributor and has no admin withdrawal or automatic recycling path.

The algebraic inequality $\sum r_i \le R$ holds under its stated entitlement and rate assumptions. Regression and stateful invariant tests check the implementation against those assumptions; they are not a formal proof of all possible executions.


---

## 3. Vault Revenue Split Integrity & Skimming Prevention

- **Test Suite**: `VaultRevenueSplit.t.sol`
- **Target Contracts**: `FatCatStakingVault.sol`

### Vulnerability Vector
In conventional staking vault implementations, revenue-sharing ratios between the protocol treasury, operations, and stakers are often stored in mutable storage variables managed by administrative roles or multisig timelocks.

This introduces two distinct vulnerabilities:
1. **Governance Skimming**: A malicious or compromised admin key can increase the operational cut to 100%, siphoning all staking yield before depositors can react.
2. **Migration Desynchronization**: Changing fee parameters mid-stream can cause discrepancies between accrued but unforwarded revenue and new distribution ratios.

### Hardening & Verification
To permanently eliminate governance skimming attack vectors, the revenue split is hardcoded as an immutable mathematical constant:
- **Project Development, Operations and Marketing**: 15% of post-bounty net revenue (exactly $3/20$), routed to the Ops Safe.
- **Reward Treasury**: 85% of the same net revenue (exactly $17/20$), plus integer rounding remainder, routed to The Belly.
- There are **no setter functions**, no administrative override interfaces, and no governance upgrade pathways for this ratio (`FatCatStakingVault.sol:94–95`).
- In `VaultRevenueSplitTest`, tests verify that every incoming unit of revenue is atomically split with the 15% team share (exactly $3/20$) and the treasury receiving the remainder, and that third-party callers cannot alter or divert the flow.

---

## Adversarial Test Suite Index

The following is a selected index, not a complete release test count. Validation records must identify the source commit, command, result and any skipped fork tests:

| Test File | Target Domain | Core Invariant Verified |
| :--- | :--- | :--- |
| `contracts/test/SweepWrappedRace.t.sol` | Payout Concurrency | Custody conservation under transfer/ping interleaving; zero reentrancy during wrapper unwraps. |
| `contracts/test/RewardDustEstimate.t.sol` | Rounding samples | Remaining balance equals residual liability after sampled claims; reports measured residue without a universal per-claim bound. |
| `contracts/test/VaultRevenueSplit.t.sol` | Fee Accounting | Fixed 15% team share (exactly $3/20$); zero admin fee adjustment surface. |
| `contracts/test/PocAudit09Invariant.t.sol` | Composed solvency | WBNB balance covers WBNB token liability plus all quote liabilities; other assets cover their own liabilities. |
| `contracts/test/PocAudit03Oracle.t.sol` | V2 oracle age | V2 observation windows age out; stale observations cannot remain valid indefinitely. |
| `contracts/test/PancakeV3TwoHopTwapOracle.t.sol` | V3 two-hop oracle | Checks TWAP windows and harmonic liquidity floors across both pools. |
