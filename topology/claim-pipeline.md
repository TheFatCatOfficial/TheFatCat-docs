---
layout: default
title: Procurement & Claims Pipeline
parent: System Topology
nav_order: 3
---

# Batch Procurement & Reward Distribution Pipeline

TheFatCat decouples entitlement accounting from actual market swaps, insulating stakers from slippage, front-running, and DEX execution delays:

---

## 1. Diet Budget Allocation
- Total released quote funds are segregated into per-asset procurement pools proportional to the locked staker weights for each diet asset.

---

## 2. MEV-Protected Batch Swaps
- The `ExecutionRouter` queries on-chain TWAP prices from `PancakeV2TwapOracle`.
- Enforces strict slippage bounds (`protocolMinOut`).
- Large batches execute via unified single swaps, removing individual user-transaction sandwich vulnerabilities by confining execution risk to the TWAP-bounded aggregate batch window.

---

## 3. Dual-Liability Settlement Accounting
- Upon swap execution, `RewardDistributor` increments the realized token liability (`liability[asset]`) while decrementing quote reserves.
- Accruals are tracked via $O(1)$ prefix sum accumulators ($A_{a, m}, B_{a, m}$).

---

## 4. User Reward Claims
- Stakers may claim their accrued rewards at any time via `claim()`.
- Unclaimed rewards never expire and remain fully solvent on-chain.
- For stakers selecting native BNB, calling `claimNative()` automatically unwraps WBNB into native BNB in a single atomic transaction without extra manual steps.
