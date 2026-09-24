---
layout: default
title: Dual-Track Asset Flows
parent: System Topology
nav_order: 1
---

# Dual-Track Asset Topology & Vault Segregation

TheFatCat enforces strict contract-level segregation between staker principal and fee routing reserves. Below is the complete capital topology map:

![TheFatCat Protocol Capital Flow & State Topology]({{ '/assets/images/fig1-topology.svg' | relative_url }}?v=20260923p6)

---

## 1. Tax Inflow in QQQB

Eligible FATCAT trades carry the configured 4% tax. Flap deducts its platform fee and sends QQQB revenue to `FatCatQqqbVault`. After graduation, FATCAT tax-token liquidation is batched; revenue does not necessarily arrive on every trade. The final launch must verify the actual fee configuration, quote asset and routing.

---

## 2. Fixed Conversion and Existing Receiver

<div class="tfc-diagram-frame">
  <div class="tfc-diagram-bar">
    <span class="tfc-diagram-tag">ASSET FLOW</span>
    <span class="tfc-diagram-title">QQQB Tax Liquidation & Routing Pipeline</span>
  </div>
  <pre class="tfc-diagram-content"><code>Flap QQQB revenue
  -> FatCatQqqbVault: QQQB -> USDT -> WBNB
     -> qualifying caller: 0.1% of gross WBNB credited as claimable bounty
  -> Proceeds allocation:
     -> 3/19 of remaining WBNB to Ops Safe
     -> remainder (16/19) to Belly</code></pre>
</div>

Anyone may use the public one-tx executor or individual protected entrypoints as soon as on-chain conditions permit; official maintenance can step in when needed. The caller pays gas and supplies no QQQB. The output recipient, route and price protections are enforced by the contracts. Conversion and revenue allocation complete automatically in the same transaction. The conversion layer charges no second Ops allocation. The downstream fractions apply to actual proceeds after upstream fees, market execution and any earned bounty, not to trade value. See [Tax Routing]({% link protocol/fees.md %}) and [Decentralized Maintenance]({% link guides/community-keeper.md %}).

The upstream QQQB Vault is a Beacon proxy. Its Factory owns the Beacon; only Flap Guardian can upgrade or permanently lock it through the Factory. The BNB receiver is a fixed-implementation clone and the reward core remains separate.

---

## 3. Strict Vault Boundary Isolation

- **Principal Vault (`StakingVault.sol`)**: Holds 100% of user-deposited FATCAT principal. It contains zero trading tax inflow and zero swap logic.
- **Reward Reservoir (`Belly.sol`)**: Holds only tax proceeds in quote asset (WBNB). It cannot access, sweep, or transfer staker principal.
