---
layout: default
title: Tax Routing & Model
parent: Core Mechanics
nav_order: 4
---

# Tax Routing & Fee Distribution Model

A complete accounting breakdown of TheFatCat's 4% dynamic trading tax, Flap platform withholdings, atomic vault splits, and the 100-year tax expiration schedule.

---

## 1. The 4% Dynamic Trading Tax Breakdown

Every eligible buy and sell transaction on the Flap bonding curve or PancakeSwap V2 primary liquidity pool incurs a **4.0% FATCAT trading tax**.

The table below outlines the exact mathematical allocation of each nominal trade:

| Fee Component | Nominal Rate | Exact Mathematical Split | Recipient | Architectural Purpose |
|:---|:---|:---|:---|:---|
| **The Belly Allocation** | **~3.1%** | $31/36$ of Vault Receipt | `Belly.sol` | Staker reward capital, subject to exponential damping release |
| **Operations Share** | **~0.5%** | $5/36$ of Vault Receipt | Operations Multi-Sig Safe (2-of-3) | Hosting, art, keeper bounties, security audits, and infrastructure |
| **Flap Platform Fee** | **~0.4%** | $10\%$ of 4% Tax | Flap Factory | Launchpad platform fee (withheld at source) |
| **Total Token Tax** | **4.0%** | **100% of Tax** | — | **Total tax deducted during trade** |

{: .note }
**Wallet-to-Wallet Transfers Are Untaxed**: Moving FATCAT tokens between personal wallets is not a trade and incurs **0% tax**. Only transactions routed through designated AMM pair contracts trigger the tax processor. The nominal fee split (4% → 0.4% Flap / 0.5% Ops / 3.1% Belly) reflects Flap platform design parameters (`feeRate=1000`, 10% platform fee), subject to final confirmation via mainnet rehearsal verification.

{: .important }
**Operations Share Scope & Non-Committal Forward Guidance**: The Operations Share is allocated toward early-stage and ongoing protocol operational expenditures (hosting, art, keeper bounties, security audits, and infrastructure gas). This distribution split ($5/36$ of vault receipt) is an immutable, hardcoded on-chain constant with a one-time bound recipient (`OPS_SAFE`); the protocol currently contains no automated rebalancing mechanisms. In the future, once the protocol reaches operational maturity, any proposal to transition portions of this share toward core protocol reserves, buyback-and-burn, or a decentralized DAO governance treasury would be announced separately through official governance processes — such directional statements do not constitute a binding commitment or promise.

---

## 2. Liquidation Mechanics & Vault Routing

On BNB Chain, tax mechanics operate with distinct characteristics between the pre-bond and post-graduation phases:

1. **Pre-Bond Bonding Curve Phase**:
   - Under Flap's Prebond Tax mechanism, trading on the bonding curve **does not deduct FATCAT tokens first**. Instead, the platform collects an extra fee directly in the **quote asset (native BNB)** at a nominal 4% rate alongside its standard trading venue fee;
   - Net proceeds after Flap's platform fee are deposited according to the protocol routing design.
2. **Post-Graduation DEX Phase**:
   - In the PancakeSwap V2 pool, Flap's Tax Token mechanism withholds 4% in raw FATCAT tokens on each transfer;
   - When accrued tokens exceed the liquidation threshold (currently ~400,000 FATCAT) and an eligible sell swap occurs, the processor automatically liquidates accumulated tokens into canonical WBNB/BNB.
3. **Dedicated Vault Accounting & Manual `flush()` Dispatch**:
   - Liquidated native BNB flows into TheFatCat's dedicated routing vault (`FatCatStakingVault.sol` / Flap V3 Beacon Proxy);
   - **The vault performs passive accounting upon receipt (`receive()`), rather than executing an atomic forward in the same transaction**;
   - A keeper or any caller must execute `flush()` to route the accumulated BNB: dispatching $5/36$ (~0.5%) to protocol operations (`OPS_SAFE`) and $31/36$ (~3.1%) to The Belly.

{: .tip }
During early launch hours, The Belly may display zero new inflows until the first liquidation threshold is crossed upstream or `flush()` is called. This is expected on-chain batching behavior and not a contract fault.

---

## 3. Venue Trading Fees (Isolated from Token Tax)

In addition to token trading taxes, underlying decentralized trading venues charge standard swap fees:
- **Flap Bonding Curve (Pre-Graduation Only)**: 1.0% venue fee charged by the platform while trading on the bonding curve. Once FATCAT graduates to PancakeSwap V2, the bonding curve permanently closes and this 1.0% venue fee ceases to exist.
- **PancakeSwap V2 Pool (Post-Graduation)**: Standard 0.25% decentralized swap fee. According to PancakeSwap's official fee schedule, **0.17%** is captured by decentralized liquidity providers (LP), while the remaining **0.08%** is routed to the PancakeSwap Protocol Treasury (0.03%) and CAKE buyback-and-burn (0.05%), rather than being entirely captured by LPs.

These venue fees are captured directly by AMM liquidity providers and curve platforms, and are strictly isolated from TheFatCat's internal tax routing.

---

## 4. 100-Year Tax Duration & Anti-Farmer Protection

According to the verified bytecode on BNB Chain:
- **100-Year Post-Graduation Expiration**: The trading tax is configured with an immutable expiration of **100 years post-graduation**. Upon expiration, the token automatically becomes permanently **0% tax-free**.
- **1-Year Anti-Farmer Window**: For the first 365 days post-graduation, secondary liquidity pools are restricted from bypassing taxes. After 1 year, taxes apply exclusively to the primary liquidity pool pair.
