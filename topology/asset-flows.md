---
layout: default
title: Dual-Track Asset Flows
parent: System Topology
nav_order: 1
---

# Dual-Track Asset Topology & Vault Segregation

TheFatCat enforces strict contract-level segregation between staker principal and fee routing reserves. Below is the complete capital topology map:

![TheFatCat Protocol Capital Flow & State Topology]({{ '/assets/images/fig1-topology.svg' | relative_url }})

---

## 1. DEX Tax Inflow & Threshold Batching

1. **Secondary DEX Swaps**: Every eligible trade on the bonding curve or PancakeSwap V2 pool carries a **4% dynamic FATCAT trading tax**.
2. **Flap Platform Upstream Fee**: The Flap factory system withholds a **10% platform fee** (~0.4% of swap value). The remaining 90% (~3.6% of swap value) is pushed to the custom forwarding vault upon eligible sells once the liquidation threshold is crossed.

---

## 2. Forwarding Vault Accounting & `flush()` Dispatch

Upon receiving native BNB tax proceeds, the forwarding vault securely records the balance delta. A keeper or any caller invokes `flush()` to wrap the accumulated native BNB into WBNB and automatically dispatch it according to immutable proportions (see [Help Keep the Protocol Running]({% link guides/community-keeper.md %}) to run this yourself):
- **5/36 (~0.5% of trade value)** $\rightarrow$ **Protocol Operations**: Dedicated operational reserve for community art, hosting, keeper incentives, continuous security reviews, and infrastructure gas. This account possesses zero administrative privileges over user staking vaults or contracts.
- **31/36 + integer floor remainder (~3.1% of trade value)** $\rightarrow$ **The Belly**: Deposited directly into the unprivileged reward reservoir.

---

## 3. Strict Vault Boundary Isolation

- **Principal Vault (`StakingVault.sol`)**: Holds 100% of user-deposited FATCAT principal. It contains zero trading tax inflow and zero swap logic.
- **Reward Reservoir (`Belly.sol`)**: Holds only tax proceeds in quote asset (WBNB). It cannot access, sweep, or transfer staker principal.
