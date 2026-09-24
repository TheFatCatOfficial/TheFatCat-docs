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

- **Architectural Scope**: Orchestrates batch market swaps from quote asset (WBNB) into diet tokens and handles fallback quote settlement.
- **Key Invariants**:
  - **Permanent Write-Once Spender**: In The Belly, the authorized `spender` can be set and activated exactly once. Once live, it is permanently fixed and cannot be replaced or upgraded, eliminating unauthorized diversion risks. The 7-day activation delay is an immutable timelock safeguarding funds during launch week.
  - **Atomic Solvency Check**: Output tokens from batch market swaps are delivered directly to the `RewardDistributor` before the transaction completes.
  - **MEV-Resistant Batch Execution**: Aggregates all meal diet allocations into single unified swaps, removing individual user-transaction sandwich vulnerabilities and confining execution risk to the TWAP-bounded batch window.

---

## 2. TWAP Oracles (`PancakeV2TwapOracle.sol` & `PancakeV3TwoHopTwapOracle.sol`)

- **Architectural Scope**: Reads cumulative prices directly from decentralized liquidity pools.
- **Key Invariants**:
  - **PancakeSwap V2 TWAP**: Reads endogenous time-weighted prices for configured standard pairs, requiring consecutive observations over a verified window. The QQQB launch graduates into FATCAT/QQQB; do not configure that pair as a direct FATCAT/WBNB oracle. FATCAT reward activation requires a separately verified quote-compatible route.
  - **PancakeSwap V3 Two-Hop TWAP**: Prices tokenized equities (bStocks) through deep intermediary pools (WBNB $\to$ USDT $\to$ bStock) via `PancakeV3Adapter`, enforcing rigorous observation tick window verification.
  - **Slippage Bounds**: Provides verified price bounds to `ExecutionRouter`, enforcing the `protocolMinOut` safety threshold.

---

## 3. Reward Asset Registry (`RewardAssetRegistry.sol` & `InitialRewardAssetRegistry.sol`)

- **Architectural Scope**: Maintains the authoritative MENU whitelist of approved diet assets and handles probation limits.
- **Key Invariants**:
  - **Canonical Assets**: Native BNB (via WBNB) is permanent and immutable.
  - **Probation Assets (bStocks)**: Non-canonical assets operate under a 5% allocation cap per meal (`PROBATION_CAP_BPS = 500`) during their 7-day probation period (`PROBATION = 7 days`).
  - **Genesis Menu Exemption**: The initial signed launch menu in `InitialRewardAssetRegistry` is pre-vetted and exempt from probation (`_isProbationExempt`).
  - **Native FATCAT**: Eligible for addition only post-graduation and after TWAP warmup stabilization.
