---
title: System Topology
nav_order: 3
---

# System Topology & Capital Architecture

A complete architectural map of TheFatCat's capital flows, smart contract state machines, and lifecycle transitions.

---

## High-Level Topology Map

The diagram below details the end-to-end lifecycle of trading taxes, from secondary DEX market swaps to user reward claims:

![TheFatCat Protocol Capital Flow & State Topology]({{ '/assets/images/fig1-topology.svg' | relative_url }})

---

## 1. Capital Inflow & Tax Division

1. **Secondary DEX Swaps**: Every eligible trade on the bonding curve or PancakeSwap V2 pool carries a **4% dynamic FATCAT trading tax**.
2. **Flap Tax Processor**: The Flap factory system withholds a **10% platform fee** (~0.4% of swap value). The remaining 90% (~3.6% of swap value) is pushed to the custom forwarding vault upon eligible sells once the liquidation threshold is crossed.
3. **Atomic Forwarding Vault**: The vault atomically splits the incoming funds:
   - **5/36 (~0.5% of trade value)** $\rightarrow$ **Protocol Operations**: Dedicated operational reserve for community art, hosting, keeper incentives, continuous security reviews, and infrastructure gas. This account possesses zero administrative privileges over user staking vaults or contracts.
   - **31/36 + integer floor remainder (~3.1% of trade value)** $\rightarrow$ **The Belly**: Deposited directly into the unprivileged reward reservoir.

---

## 2. Temporal State Machine (The Meal Cycle)

The protocol advances through deterministic discrete intervals called **Meals** via the [`IntervalController`]({% link contracts.md %}):

```
Interval m-1                         Interval m                         Interval m+1
[==== Active Meal ====] ───────► [==== Active Meal ====] ───────► [==== Active Meal ====]
                        ▲                                ▲
                  advanceInterval()                advanceInterval()
                  (Cadence: ≥ 8h)                  (Cadence: ≥ 8h)
```

- **Cadence**: An interval may be closed once at least **8 hours** have elapsed. Anyone (keepers or stakers) may invoke `advanceInterval()`.
- **Weight Locking**: At the exact boundary of interval $m$, active staker weights for each diet asset ($W_{\text{open}}(a, m)$) are permanently locked.
- **Graduation Ring Rotation**: The 22-slot circular graduation ring rotates by one slot, graduating mature positions without looping over stakers ($O(1)$ complexity).
- **Outflow Release**: The Belly calculates its release quota and transfers quote funds to the `ExecutionRouter`.

---

## 3. Procurement & Distribution Pipeline

1. **Diet Allocation**: Funds are segregated into per-asset procurement pots.
2. **MEV-Protected Market Swaps**: The `ExecutionRouter` checks on-chain TWAP prices from `PancakeV2TwapOracle` and enforces a strict slippage ceiling (`protocolMinOut`).
3. **Dual-Liability Settlement**: Upon swap execution, `RewardDistributor` increments `liability[asset]` while decrementing quote reserves.
4. **User Claims**: Stakers claim their realized tokens anytime via `claim()`, or call `claimNative()` to automatically unwrap WBNB into native BNB in a single transaction.
