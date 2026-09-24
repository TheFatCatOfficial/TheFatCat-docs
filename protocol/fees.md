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

FATCAT launches paired with QQQB. The protocol allocates **actual net conversion proceeds**, not a guaranteed percentage of trading volume:

| Fee Component | Allocation Basis | Exact Routing Rule | Recipient |
|:---|:---|:---|:---|
| **Maintenance bounty** | Gross WBNB from a successful QQQB conversion | 0.1% when the original caller qualifies; otherwise zero | Per-Vault rewards contract, claimable in WBNB |
| **The Belly Allocation** | WBNB remaining after any earned bounty | Remainder after Ops, $16/19$ | `Belly.sol` |
| **Protocol Operations Revenue** | The same remaining WBNB amount | $3/19$, rounded down | Ops Safe |
| **Flap Platform Fee** | Collected FATCAT tax | Actual Flap fee configuration | Flap fee recipient |
| **Total Token Tax** | Eligible trade value | **4.0%** | Split through the above stages |

The P2 fork rehearsal on 2026-09-23 observed a 5% platform share of tax (`feeRate = 500`). For illustration, a 4% trading tax then implies 0.2% platform and 3.8% before conversion: nominally 0.6% Ops ($3.8\% \times 3/19$) and 3.2% Belly ($3.8\% \times 16/19$) **before conversion fees, price movement, any earned maintenance bounty and rounding**. Read the final launch configuration again before deployment; these trade-value percentages are not guaranteed receipts. Integer dust stays with Belly, and the conversion layer does not take another operations share. The bounty is explained under [Decentralized Maintenance]({% link guides/community-keeper.md %}).

{: .note }
Ordinary wallet-to-wallet FATCAT transfers are untaxed in the tested token implementation. Tax applies to eligible trades, not to a user's staking deposit merely because it is an ERC-20 transfer.

---

## 2. Liquidation Mechanics & Vault Routing

1. **Bonding curve**: Under Flap's Prebond Tax mechanism, the selected quote asset is **QQQB**. The curve collects the configured FATCAT trading tax in QQQB alongside its separate venue fee. Platform fees are deducted upstream.
2. **After graduation**: Eligible pool trades accrue FATCAT tax tokens. Once the liquidation conditions are met (including an eligible sell and the tested threshold of approximately 400,000 FATCAT), the upstream processor liquidates them into the launch quote, QQQB. The final deployed token and processor must be checked at launch.
3. **QQQB conversion**: `FatCatQqqbVault` receives the protocol's QQQB. Its permissionless conversion follows fixed QQQB → USDT → WBNB pools. If the original caller qualifies, 0.1% of gross WBNB is credited as a claimable bounty. Amount, capacity, TWAP, slippage, deadline and pause checks are enforced on-chain. Callers supply gas, not QQQB, and cannot select the output recipient.
4. **Revenue allocation**: In the same transaction, the remaining WBNB is allocated: 3/19 to Ops and 16/19 to The Belly.

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
