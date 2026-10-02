---
layout: default
title: Batch Procurement & Execution
parent: Core Mechanics
nav_order: 3
---

# Batch Procurement & Execution

How TheFatCat decouples entitlement accounting from market execution, confines MEV sandwich exposure via discrete interval boundaries and on-chain TWAPs, and provides permissionless fallback realization.

---

## 1. Decoupled Accounting vs. Market Swaps

In traditional DEX dividend protocols, purchasing reward tokens occurs synchronously within user transactions or scheduled intervals. If a trade encounters high slippage or front-running, stakers suffer immediate loss.

TheFatCat addresses this via a **two-phase decoupled architecture**:

<div class="tfc-diagram-frame">
  <div class="tfc-diagram-bar">
    <span class="tfc-diagram-tag">ARCHITECTURE</span>
    <span class="tfc-diagram-title">Two-Phase Decoupled Execution Pipeline</span>
  </div>
  <pre class="tfc-diagram-content"><code>Phase 1: Interval Roll (Accounting)     Phase 2: Batch Execution (Swaps)
┌─────────────────────────────────┐     ┌─────────────────────────────────┐
│ Meal Closes: W_open Locked      │ ──► │ Router Swaps Quote for Target   │
│ Entitlements Locked In          │     │ TWAP & protocolMinOut Guarded   │
└─────────────────────────────────┘     │ Distributor Updates liability   │
                                        └─────────────────────────────────┘</code></pre>
</div>

1. **Phase 1: Deterministic Entitlement Locking**: When a meal closes, quote budgets are allocated to each diet asset pool. Staker entitlement shares are mathematically locked. Market volatility or external sandwich attacks cannot rewrite eligible entitlement units.
2. **Phase 2: Asynchronous Market Execution**: The [`ExecutionRouter`]({% link contracts.md %}) executes purchases in aggregate batches only when market liquidity and price boundaries are favorable.

### Global meal settlement order

Each procurement or funded fallback call settles one whole pending meal for one asset. The earliest positive unsettled interval across all listed assets, including disabled assets with pending funds, must clear before any later interval can spend. Assets in that earliest meal may settle in any order. Clock advancement can continue recording allocations while settlement waits.

An earlier blocked asset can delay later meals in other diets until execution or eligible fallback clears it. The rotating FEED batch does not override this ordering. `ExecutionRouter.spendFor()` returning zero because an earlier meal is waiting does not by itself make fallback eligible; the structural size test uses `RewardDistributor.spendFor()`.

### Architectural Tradeoff Analysis
Decoupling execution from entitlement yields significant security benefits but introduces operational tradeoffs:
- **Advantage**: User transactions (deposits, claims, redemptions) incur zero DEX routing risk or slippage exposure. Front-running individual stakers is structurally impossible.
- **Tradeoff**: Payout delivery depends on aggregate batch execution. The protocol concentrates swap volume into discrete, permissionlessly triggered batches, confining the MEV attack surface to the aggregate execution window, which is governed by TWAP bounds and harmonic liquidity floors.

---

## 2. On-Chain TWAP & Slippage Bounds

To confine MEV exposure and prevent predatory sandwich extraction during batch swaps:

- **Route-Specific Oracles**: The Router uses the adapter and oracle configured in Registry. The initial menu is BNB/WBNB, QQQB, SPCXB, NVDAB, SPYB and GOOGLB. WBNB uses the direct identity route; the five bStocks use V3 two-hop WBNB → USDT → asset routes with `PancakeV3TwoHopTwapOracle`. V2 routes use `PancakeV2TwapOracle` where appropriate. FATCAT requires a separately verified reward route; its FATCAT/QQQB launch pair is not a direct FATCAT/WBNB oracle.
- **Strict Slippage Verification**: Before submitting a market swap, the router verifies that actual output cannot drop below:

$$\text{protocolMinOut} = \left\lfloor \frac{\text{expectedOut} \cdot (10000 - \text{deviationBps})}{10000} \right\rfloor$$

If price deviation exceeds the configured threshold (default 200 bps / 2%), the swap reverts safely on-chain.

---

## 3. The 5% Probation Cap for Tokenized Equities (bStocks)

Tokenized real-world assets (bStocks) carry institutional counterparty and issuer upgrade risks. TheFatCat limits this exposure at the protocol level:

- **Per-Interval 5% Probation Cap**: Newly listed non-canonical assets operate under a strict **5% single-meal allocation cap** (`PROBATION_CAP_BPS = 500`) during their 7-day probation window (`PROBATION = 7 days`). After 7 days, the cap lifts to 100% (`BPS`). It is a per-interval allocation throttle, not a cumulative lifetime cap.
- **Genesis Menu Exemption**: In [`InitialRewardAssetRegistry`]({% link contracts.md %}), assets in the signed launch menu have completed depth verification prior to genesis and are explicitly exempt from the initial 7-day probation (`_isProbationExempt`). Any later re-enabled asset must serve the standard 7-day probation.
- **Credit and Timing Boundaries**: Issuer exposure follows the asset allocated to a position. Global settlement order means an earlier blocked asset can also delay later meals in other diets. WBNB remains the default and fallback asset.

---

## 4. Permissionless Fallback Finalization

What happens if a reward asset halts trading, liquidity dries up, or execution encounters structural ceilings? The protocol provides a permissionless fallback mechanism: when an asset cannot be procured, eligible pending amounts can be settled in native network currency (BNB).

The fallback settlement route becomes eligible if and only if any of the following conditions are met:
1. **Execution Timeout**: A procurement pool remains unexecuted beyond the timeout threshold (default **1 day**, corresponding to contract state `pendingAge > maxPendingAge`);
2. **Asset Disabled**: The asset is deactivated by risk parameters or governance (corresponding to contract state `!enabled`);
3. **Single Execution Cap Insufficient for First Interval**: When the quote funds required for an interval exceed the maximum permissible execution quote (`maxExecQuote`), preventing procurement of the first whole interval from starting (corresponding to contract state `spendFor == 0`). **Note**: Standard slippage fluctuations during market trades do not trigger this route; it activates strictly when procurement cannot be structurally initiated.

```solidity
function fallbackFinalize(address asset) external returns (uint256 quoteIn);
```

- **Permissionless**: Anyone can invoke the low-level `fallbackFinalize(asset)` interface when its contract conditions are met. See [Decentralized Maintenance]({% link guides/community-keeper.md %}) for the public maintenance model.
- **Native BNB Fallback Settlement**: Gross WBNB spent is recorded one-for-one in `quoteLiability[asset]`, claimable as native BNB through `RewardDistributor`. Position payouts use the batch rate and forfeiture-netted claimable pot, with downward rounding.
- **Rate Limiting & Interval Constraints**: Moving pending quote from Belly into the Distributor remains subject to the 8-hour window outflow cap ($\le 16/168$), global meal order and whole-meal boundaries. Ordinary claims of already settled liabilities do not consume Belly's window allowance.


## Sustainable menu lifecycle

The Registry exposes `menuCapacity` (default 16, hard limit 32) and `feedBatchSize` (default 4, hard limit 8 and no larger than capacity). Governor queues both settings with `queueMaintenanceConfig`, waits three days, then calls `executeMaintenanceConfig`; Governor/Guardian can cancel. Execution rechecks current listed occupancy and the proposal's configuration version. This adds no withdrawal or route-replacement authority.

Capacity includes the permanent WBNB fallback, enabled assets and disabled assets still winding down. To free a slot, disable a non-default asset, advance past its opening/exiting weights, clear pending quote and unconsumed forfeits through normal settlement, then call `remove` as Governor. The Ledger archives it without deleting historical claims or requiring all users to claim first. A disabled asset can be re-enabled only before permanent migration; a migrated/archived token address cannot be relisted in this version.

Only active assets participate in per-meal loops. The historical index stays append-only and archived cumulative snapshots remain available for old rewards. Increasing the number of archived assets therefore does not grow the per-meal loop. FEED checks the cursor-assigned batch, not the full selection menu. Flap and the website retain separate current-menu and historical-reward views.

Before increasing capacity or batch size, verify gas use against the actual routes and active-menu workload. See [FEED operation and reward conditions]({% link guides/community-keeper.md %}).
