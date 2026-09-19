---
layout: default
title: Batch Procurement & Execution
parent: Core Mechanics
nav_order: 3
---

# Batch Procurement & Execution

How TheFatCat decouples entitlement accounting from market execution, protects against MEV sandwich attacks via on-chain TWAPs, and provides permissionless fallback realization.

---

## 1. Decoupled Accounting vs. Market Swaps

In traditional DEX dividend protocols, buying reward tokens occurs synchronously within user transactions or scheduled intervals. If a trade encounters high slippage or front-running, stakers suffer immediate loss.

TheFatCat solves this via a **two-phase decoupled architecture**:

```
Phase 1: Interval Roll (Accounting)     Phase 2: Batch Execution (Swaps)
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│ Meal Closes: W_open Locked      │ ──► │ Router Swaps Quote for Target   │
│ Entitlements Locked In          │     │ TWAP & protocolMinOut Guarded   │
└─────────────────────────────────┘     │ Distributor Updates liability   │
                                        └─────────────────────────────────┘
```

1. **Phase 1: Deterministic Entitlement Locking**: When a meal closes, quote budgets are allocated to each diet asset pot. Staker entitlement shares are mathematically locked. Market conditions cannot rewrite who was eligible.
2. **Phase 2: Asynchronous Market Execution**: The [`ExecutionRouter`]({% link contracts.md %}) executes purchases in batches only when market liquidity and price boundaries are favorable.

---

## 2. On-Chain TWAP & Slippage Bounds

To prevent sandwich attacks and predatory MEV extraction:

- **Endogenous TWAP Oracle**: [`PancakeV2TwapOracle`]({% link contracts.md %}) reads cumulative price accumulators from PancakeSwap V2 pairs over observation windows.
- **Strict Slippage Verification**: Before submitting a market swap, the router verifies that actual output cannot drop below:

$$\text{protocolMinOut} = \left\lfloor \frac{\text{expectedOut} \cdot (10000 - \text{deviationBps})}{10000} \right\rfloor$$

If price deviation exceeds the configured threshold (default 200 bps / 2%), the swap reverts safely on-chain.

---

## 3. The 5% Probation Cap for Tokenized Equities (bStocks)

Tokenized real-world assets (bStocks) carry institutional counterparty and issuer upgrade risks. TheFatCat limits this exposure at the protocol level:

- **Per-Interval 5% Probation Cap**: Newly listed non-canonical assets operate under a strict **5% single-meal allocation cap** (`PROBATION_CAP_BPS = 500`) during their 7-day probation window (`PROBATION = 7 days`). After 7 days, the cap lifts to 100% (`BPS`). It is a per-interval allocation throttle, not a cumulative lifetime cap.
- **Genesis Menu Exemption**: In [`InitialRewardAssetRegistry`]({% link contracts.md %}), assets in the signed launch menu have completed depth verification prior to genesis and are explicitly exempt from the initial 7-day probation (`_isProbationExempt`). Any later re-enabled asset must serve the standard 7-day probation.
- **Credit Isolation**: Problems with a bStock issuer can never impair more than its allocated share. WBNB remains the invariant default and fallback asset.

---

## 4. Permissionless Fallback Finalization

What happens if a reward asset halts trading, liquidity dries up, or execution encounters structural ceilings? The protocol provides a permissionless fallback mechanism: when an asset cannot be procured, eligible pending amounts can be settled in native network currency (BNB).

The fallback settlement route becomes eligible if and only if any of the following conditions are met:
1. **Execution Timeout**: A procurement pot remains unexecuted beyond the timeout threshold (default **3 days**, corresponding to contract state `pendingAge > maxPendingAge`);
2. **Asset Disabled**: The asset is deactivated by risk parameters or governance (corresponding to contract state `!enabled`);
3. **Single Execution Cap Insufficient for First Interval**: When the quote funds required for an interval exceed the maximum permissible execution quote (`maxExecQuote`), preventing procurement of the first whole interval from starting (corresponding to contract state `spendFor == 0`). **Note**: Standard slippage fluctuations during market trades do not trigger this route; it activates strictly when procurement cannot be structurally initiated.

```solidity
function fallbackFinalize(address asset) external returns (uint256 quoteIn);
```

- **Permissionless**: Anyone (keeper, user, or arbitrageur) can invoke the low-level `fallbackFinalize(asset)` interface.
- **Native BNB Fallback Settlement**: The unexecuted quote funds (WBNB) are credited 1:1 to stakers as pending BNB entitlements (`quoteLiability[asset]`), claimable as native BNB through `RewardDistributor`.
- **Rate Limiting & Interval Constraints**: Claimed quote funds remain governed by The Belly's 8-hour window outflow throttle cap ($\le 16/168$) and whole-interval accounting boundaries to protect treasury reserves, rather than permitting unbounded instant withdrawals.
