---
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
Phase 1: Interval Roll (Accounting)               Phase 2: Batch Execution (Market Swaps)
[ Meal Closes: W_open & Entitlement Locked ] ───► [ Router Swaps Quote for Target Asset ]
                                                  [ Twap & protocolMinOut Verified ]
                                                  [ Distributor Updates liability[asset] ]
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

- **5% Probation Cap**: Non-canonical assets operate under a strict **5% allocation cap** during their probation period.
- **Credit Isolation**: Problems with a bStock issuer can never impair more than its allocated share. WBNB remains the invariant default and fallback asset.

---

## 4. Permissionless Fallback Finalization

What happens if a reward asset halts trading or liquidity dries up?

If a procurement pot remains unexecuted beyond the timeout threshold (`maxPendingAge`, default **3 days**):

```solidity
function fallbackFinalize(uint256 batchId) external;
```

- **Permissionless**: Anyone (keeper, user, or bot) can invoke `fallbackFinalize()`.
- **Quote Settlement**: The unexecuted quote funds (WBNB) are credited 1:1 to stakers as `quoteLiability[asset]`.
- **Zero Asset Liquidation**: The protocol settles directly in safe network quote currency, preventing bad debt or trapped funds.
