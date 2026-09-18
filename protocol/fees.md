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
| **Operations Share** | **~0.5%** | $5/36$ of Vault Receipt | Operations Treasury | Hosting, art, keeper bounties, security audits, and infrastructure |
| **Flap Platform Fee** | **~0.4%** | $10\%$ of 4% Tax | Flap Factory | Launchpad platform fee (withheld at source) |
| **Total Token Tax** | **4.0%** | **100% of Tax** | — | **Total tax deducted during trade** |

{: .note }
**Wallet-to-Wallet Transfers Are Untaxed**: Moving FATCAT tokens between personal wallets is not a trade and incurs **0% tax**. Only transactions routed through designated AMM pair contracts trigger the tax processor.

---

## 2. Liquidation Mechanics & Initial Delay

On BNB Chain, the Flap tax processor operates asynchronously:
1. **Tax Withholding**: During swaps, the processor withholds the 4% tax in raw FATCAT tokens.
2. **Batch Liquidation**: When accrued tokens cross the liquidation threshold (currently ~400,000 FATCAT) and an eligible sell swap occurs, the processor liquidates the tokens into canonical WBNB.
3. **Atomic Forwarding**: The resulting WBNB is pushed to TheFatCat's custom Forwarding Vault, which atomically dispatches $5/36$ to protocol operations and $31/36$ to The Belly.

{: .tip }
During early protocol hours, The Belly may display zero new inflows until the first liquidation threshold is reached upstream. This is expected behavior and not a contract fault.

---

## 3. Venue Trading Fees (Isolated from Token Tax)

In addition to the 4% token tax, automated market maker venues charge standard swap fees:
- **Flap Bonding Curve (Pre-Graduation Only)**: 1.0% venue fee charged by the platform while trading on the bonding curve. Once FATCAT graduates to PancakeSwap V2, the bonding curve permanently closes and this 1.0% venue fee ceases to exist.
- **PancakeSwap V2 Pool (Post-Graduation)**: 0.25% LP swap fee captured directly by decentralized liquidity providers.

These fees are captured directly by AMM liquidity providers and curve platforms, and are strictly isolated from TheFatCat's internal tax routing.

---

## 4. 100-Year Tax Duration & Anti-Farmer Protection

According to the verified bytecode on BNB Chain:
- **100-Year Post-Graduation Expiration**: The trading tax is configured with an immutable expiration of **100 years post-graduation**. Upon expiration, the token automatically becomes permanently **0% tax-free**.
- **1-Year Anti-Farmer Window**: For the first 365 days post-graduation, secondary liquidity pools are restricted from bypassing taxes. After 1 year, taxes apply exclusively to the primary liquidity pool pair.
