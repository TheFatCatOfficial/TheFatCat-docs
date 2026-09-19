---
layout: default
title: Routers & Oracles
parent: Verified Contracts
nav_order: 2
---

# Execution Routers & Oracle Contracts

The perimeter infrastructure layer handles decentralized market execution, oracle verification, and approved asset whitelisting:

---

## 1. Execution Router (`ExecutionRouter.sol`)

- **Architectural Scope**: Orchestrates batch market swaps from quote asset (WBNB) into diet tokens.
- **Key Invariants**:
  - **Single Active Implementation**: Upgrades are guarded behind a multi-day timelock; only one active router can receive funds from The Belly.
  - **Atomic Solvency Check**: Output tokens from batch market swaps are delivered directly to the `RewardDistributor` before the transaction completes.
  - **MEV-Resistant Batch Execution**: Aggregates all meal diet allocations into single unified swaps, eliminating sandwich vulnerability for individual stakers.

---

## 2. TWAP Oracle (`PancakeV2TwapOracle.sol`)

- **Architectural Scope**: Reads cumulative prices directly from the PancakeSwap V2 `FATCAT/WBNB` pool.
- **Key Invariants**:
  - **Endogenous Time-Weighted Averages**: Requires at least 2 consecutive price observations across a minimum time window before publishing valid rates.
  - **Slippage Bounds**: Provides verified price bounds to `ExecutionRouter`, enforcing the `protocolMinOut` safety threshold.

---

## 3. Reward Asset Registry (`RewardAssetRegistry.sol`)

- **Architectural Scope**: Maintains the authoritative MENU whitelist of approved diet assets.
- **Key Invariants**:
  - **Canonical Assets**: Native BNB (via WBNB) is permanent and immutable.
  - **Probation Assets (bStocks)**: Tokenized equities are subject to a strict 5% cumulative allocation cap, containing real-world issuer risks.
  - **Native FATCAT**: Eligible for addition only post-graduation and after TWAP warmup stabilization.
