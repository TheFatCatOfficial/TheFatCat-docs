---
layout: default
title: Tax Routing & Model
parent: Core Mechanics
nav_order: 4
---

# Tax Routing & Fee Distribution Model

A complete accounting breakdown of TheFatCat's 4% dynamic trading tax, Flap platform withholdings, atomic vault splits, and the 100-year tax expiration schedule.

---

## 1. The 4% Trading Tax in Percentages

Every eligible buy and sell on the Flap bonding curve or PancakeSwap V2 primary pool incurs a **4.0% FATCAT trading tax**. The Belly is the protocol's reward treasury; the Ops Safe receives income for project development, operations and marketing.

### Platform fee and FEED reward target

| Allocation | Percentage | Calculation basis |
|:---|---:|:---|
| **Flap platform fee** | **0.2%** | **Eligible FATCAT trade value** |
| **Eligible FEED conversion reward** | **0.1% target** | **Eligible trade value represented by this conversion** |

The Flap platform fee is included in the 4% trading tax: `4% × 5% = 0.2%`, or 5% of collected tax, deducted upstream.

The FEED reward targets **0.1% of the eligible trade value represented by this conversion**. Under the standard 4% tax and 5% platform share of tax, the protocol receives a nominal `4% × 95% = 3.8%` of trade value. Paying `1/38` of actual WBNB output gives the nominal equivalent `3.8% / 38 = 0.1%`. The on-chain reward is `floor(actual WBNB output / 38)`, about **2.63158% of conversion output**. Prices, conversion costs and rounding affect its trade-value equivalent.

### Shares of actual project revenue

After the platform deduction and market conversion, an eligible successful FEED conversion first earns **one thirty-eighth of its gross WBNB output**, rounded down. This implements the nominal trade-value target through a conversion-output share. Direct conversion and an ineligible caller earn no bounty.

The WBNB **remaining after any earned bounty** is allocated as follows:

| Destination | Share of that remaining net revenue | Receiver |
|:---|---:|:---|
| **Reward treasury** | **85%** | The Belly |
| **Project development, operations and marketing** | **15%** | Ops Safe |

The fixed contract implements the exact 85% treasury and 15% team shares using `17/20` and `3/20`: the team share is rounded down to the smallest unit and every remainder goes to the treasury. Revenue splitting occurs only in the receiver.

For gross conversion output `G`, the eligible bounty is `C = floor(G / 38)`; otherwise `C = 0`. Let `R = G - C`. The team receives `floor(R × 3 / 20)` and the treasury receives everything left. A later advance or purchase failure does not cancel a successful conversion's bounty. Eligibility and claiming are explained in [Decentralized Maintenance]({% link guides/community-keeper.md %}).

### Worked example: 10,000 units of trade value

Using one common unit of account, the 4% tax is **400**. Under the same no-cost/no-price-movement assumptions:

| Destination | No earned FEED bounty | Eligible FEED earns a bounty |
|:---|---:|---:|
| Flap platform | 20 | 20 |
| FEED caller | 0 | 10 |
| Project development, operations and marketing | 57 | 55.5 |
| Reward treasury | 323 | 314.5 |
| **Total** | **400** | **400** |

Without a bounty: `400 × 5% = 20` goes to Flap, leaving `380`; `380 × 15% = 57` goes to the team and `380 × 85% = 323` to the treasury.

With an eligible FEED bounty: `380 / 38 = 10` goes to the caller first, leaving `370`. The same exact net-revenue split yields `55.5` for the team and `314.5` for the treasury. The project and treasury receive **15%** and **85%** of the remaining protocol net revenue. The bounty has an equivalent **0.1%** share of trade value in this example; Flap receives **0.2%** of trade value, and all four amounts sum to the collected tax. These are illustrative equivalents, not guaranteed token amounts.

{: .note }
Ordinary wallet-to-wallet FATCAT transfers are untaxed in the tested token implementation. Tax applies to eligible trades, not to a user's staking deposit merely because it is an ERC-20 transfer.

---

## 2. Liquidation Mechanics & Vault Routing

1. **Bonding curve**: Under Flap's Prebond Tax mechanism, the selected quote asset is **QQQB**. The curve collects the configured FATCAT trading tax in QQQB alongside its separate venue fee. Platform fees are deducted upstream.
2. **After graduation**: Eligible pool trades accrue FATCAT tax tokens. Once the liquidation conditions are met, including an eligible sell and the processor’s configured liquidation threshold, the upstream processor converts them into QQQB.
3. **QQQB conversion**: `FatCatQqqbVault` receives the protocol's QQQB. Its permissionless conversion follows fixed QQQB → USDT → WBNB pools. Only conversion through FEED can credit one thirty-eighth of gross WBNB to an eligible original caller, independently of later advancement or purchases. Standalone `convertAndFlush` and `convertAndFlushWithPosition` earn no bounty. Amount, capacity, TWAP, slippage, deadline and pause checks are enforced on-chain. Callers supply gas, not QQQB, and cannot select the output recipient.
4. **Revenue allocation**: In the same transaction, the remaining WBNB is allocated: 85% to the Belly reward treasury and 15% to the Ops Safe for project development, operations and marketing, using the exact fixed contract shares.

{: .tip }
A delay may occur before upstream liquidation or while QQQB awaits a permitted conversion. Check each balance and transaction before diagnosing missing Belly inflow. If conversion fails, that transaction rolls back; accumulated QQQB is not counted as WBNB already available to Belly.

---

## 3. Venue Trading Fees (Isolated from Token Tax)

In addition to token trading taxes, underlying decentralized trading venues charge standard swap fees:
- **Flap Bonding Curve (Pre-Graduation Only)**: 1.0% venue fee charged by the platform while trading on the bonding curve. Once FATCAT graduates to PancakeSwap V2, the bonding curve permanently closes and this 1.0% venue fee ceases to exist.
- **PancakeSwap V2 Pool (Post-Graduation)**: Standard 0.25% decentralized swap fee. According to PancakeSwap's official fee schedule, **0.17%** is captured by decentralized liquidity providers (LP), while the remaining **0.08%** is routed to the PancakeSwap Protocol Treasury (0.03%) and CAKE buyback-and-burn (0.05%), rather than being entirely captured by LPs.

These venue fees are captured directly by AMM liquidity providers and curve platforms, and are strictly isolated from TheFatCat's internal tax routing.

---

## 4. 100-Year Tax Duration & Anti-Farmer Protection

According to the currently deployed Flap tax-token implementation and TaxProcessor bytecode on BNB Chain:
- **100-Year Post-Graduation Expiration**: The trading tax is configured with an immutable expiration of **100 years post-graduation**. Upon expiration, the token automatically becomes permanently **0% tax-free**.
- **1-Year Anti-Farmer Window**: For the first 365 days post-graduation, secondary liquidity pools are restricted from bypassing taxes. After 1 year, taxes apply exclusively to the primary liquidity pool pair.
