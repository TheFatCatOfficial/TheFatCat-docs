---
layout: default
title: Tax Routing & Fees
parent: Core Mechanics
nav_order: 4
---

# Tax Routing & Fees

A complete accounting breakdown of TheFatCat's 4% trading tax, Flap platform withholdings, reward-treasury and project-fund allocation, and the 100-year tax expiration schedule.

---

## 1. The 4% Trading Tax in Percentages

Every eligible buy and sell on the Flap bonding curve or PancakeSwap V2 primary pool incurs a **4.0% `$FATCAT` trading tax**. The Belly is the protocol's reward treasury; the project operations wallet receives income for project development, operations and marketing.

### Platform fee and Feeder reward target

| Allocation | Percentage | Calculation basis |
|:---|---:|:---|
| **Flap platform fee** | **0.2%** | **Eligible `$FATCAT` trade value** |
| **Eligible Feeder reward** | **0.1% target** | **Eligible trade value represented by this conversion** |

The Flap platform fee is included in the 4% trading tax: 4% × 5% = 0.2%, or 5% of collected tax, deducted upstream.

The Feeder reward targets **0.1% of the eligible trade value represented by this conversion**. Under the standard 4% tax and 5% platform share of tax, the protocol receives a nominal 4% × 95% = 3.8% of trade value. Paying 1/38 of actual WBNB output gives the nominal equivalent 3.8% / 38 = 0.1%. The on-chain reward is one thirty-eighth of gross WBNB output, rounded down, about **2.63158% of conversion output**. Prices, conversion costs and rounding affect its trade-value equivalent.

### Shares of actual project revenue

After the platform deduction and market conversion, an eligible successful FEED conversion first earns **one thirty-eighth of its gross WBNB output**, rounded down. Direct conversion and an ineligible caller earn no Feeder reward.

The WBNB **remaining after any earned Feeder reward** is allocated as follows:

| Destination | Share of that remaining net revenue | Receiver |
|:---|---:|:---|
| **Reward treasury** | **85%** | The Belly |
| **Project development, operations and marketing** | **15%** | Project operations wallet |

The team share is rounded down to the smallest unit and every remainder goes to the treasury. The operations split occurs only once. Later advancement or purchase failures do not cancel a successful conversion's Feeder reward. Eligibility and claiming are explained in [FEED & Decentralized Maintenance]({% link guides/community-keeper.md %}).

### Worked example: 10,000 units of trade value

Using one common unit of account, the 4% tax is **400**. This example assumes no conversion costs and no price movement:

| Destination | No Feeder reward earned | Eligible FEED earns a Feeder reward |
|:---|---:|---:|
| Flap platform | 20 | 20 |
| FEED caller | 0 | 10 |
| Project development, operations and marketing | 57 | 55.5 |
| Reward treasury | 323 | 314.5 |
| **Total** | **400** | **400** |

Both columns sum to the same 400 collected tax units. The 85/15 split applies after any earned Feeder reward. These are illustrative trade-value equivalents under the stated assumptions, not guaranteed token payouts.

{: .note }
Ordinary wallet-to-wallet `$FATCAT` transfers are untaxed in the tested token implementation. Tax applies to eligible trades, not to a user's staking deposit merely because it is an ERC-20 transfer.

---

## 2. Liquidation Mechanics & Vault Routing

1. **Bonding curve**: Under Flap's Prebond Tax mechanism, the selected quote asset is **QQQB**. The curve collects the configured `$FATCAT` trading tax in QQQB alongside its separate venue fee. Platform fees are deducted upstream.
2. **After graduation**: Eligible pool trades accrue `$FATCAT` tax tokens. Once the liquidation conditions are met, including an eligible sell and the processor’s configured liquidation threshold, the upstream processor converts them into QQQB.
3. **QQQB conversion**: The protocol's revenue vault receives QQQB. QQQB revenue is converted to WBNB through a dual-route design, with price checks to reduce the risk of unfavorable execution. Only conversion through FEED can earn the Feeder reward described above. Amount, capacity, TWAP, slippage, deadline and pause checks are enforced on-chain. Callers supply gas, not QQQB, and cannot select the output recipient.
4. **Revenue allocation**: In the same transaction, the remaining WBNB is allocated: 85% to the Belly reward treasury and 15% to the project operations wallet for project development, operations and marketing, using the exact fixed contract shares.

{: .tip }
A delay may occur before upstream liquidation or while QQQB awaits a permitted conversion. Check each balance and transaction before diagnosing missing Belly inflow. If conversion fails, that transaction rolls back; accumulated QQQB is not counted as WBNB already available to Belly.

---

## 3. Venue Trading Fees (Isolated from Token Tax)

In addition to token trading taxes, underlying decentralized trading venues charge standard swap fees:
- **Flap Bonding Curve (Pre-Graduation Only)**: 1.0% venue fee charged by the platform while trading on the bonding curve. Once `$FATCAT` graduates to PancakeSwap V2, the bonding curve permanently closes and this 1.0% venue fee ceases to exist.
- **PancakeSwap V2 Pool (Post-Graduation)**: Standard 0.25% decentralized swap fee. According to PancakeSwap's official fee schedule, **0.17%** is captured by decentralized liquidity providers (LP), while the remaining **0.08%** is routed to the PancakeSwap Protocol Treasury (0.03%) and CAKE buyback-and-burn (0.05%), rather than being entirely captured by LPs.

These venue fees go to the curve platform, liquidity providers and PancakeSwap as described above, and are separate from TheFatCat's tax routing.

---

## 4. 100-Year Tax Duration & Anti-Farmer Window

Under the adopted Flap trading-tax configuration:
- **100-Year Post-Graduation Expiration**: The trading tax expires **100 years after graduation**, a setting that cannot be changed. After that, `$FATCAT` is permanently tax-free.
- **1-Year Anti-Farmer Window**: For the first 365 days after graduation, the tax applies to trades through any DEX pool, so trading through a secondary pool does not avoid it. From then on, the tax applies only to trades through the primary pool.
