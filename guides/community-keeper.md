---
layout: default
title: Decentralized Maintenance
parent: User Guides
nav_order: 4
---

# Decentralized Protocol Maintenance

Anyone can advance eligible protocol work through the maintenance panel on the [Belly page](https://thefatcat.fun/belly) or by calling the public contracts directly. No operator approval or caller whitelist is required. Official maintenance may step in when needed; it is not a prerequisite for public calls. These features become usable after the relevant contracts are deployed and connected at launch.

{: .note }
**Note for Stakers**: Under the protocol's lazy decentralization design and the official fallback keeper mechanism, system state and meal intervals advance perpetually in theory. Users who only wish to stake FATCAT and harvest their Diet yields **do not need to perform any maintenance actions**. The maintenance panel and bounties are intended for community keepers seeking to help advance protocol work.

## What a maintenance call does

**One-tx maintenance** calls `ProtocolExecutor.maintain(...)`. In one wallet transaction it attempts, in order, a QQQB tax conversion, one due meal advance, and purchases for up to three eligible reward assets. Each leg is checked against current on-chain state. A failed or ineligible leg can be skipped without undoing earlier successful legs; a confirmed transaction does not mean every leg succeeded. Check the transaction's leg results and refreshed balances. The individual conversion, advance and purchase contracts remain publicly callable when their own conditions are met.

There is no extra five-minute public waiting period. A due meal can be advanced as soon as the contract reports it ready; purchases still require pending allocation, available Belly funds, a permitted asset and valid execution conditions. A stale price may require a separate oracle update transaction. Advancing a meal records the shared allocation; it does not by itself deliver a reward token to a staker's wallet.

## QQQB revenue and the maintenance bounty

The launch quote and normal tax-revenue asset is **QQQB**. A successful conversion uses the Vault's fixed QQQB → USDT → WBNB route, and the proceeds are automatically allocated to Ops and The Belly within the same transaction. The caller supplies gas, not personal QQQB, and cannot redirect the revenue.

At the moment of a successful conversion, the original caller qualifies for a bounty if that wallet either holds at least **10,000 FATCAT** or supplies proof of an active staking position it owns with nonzero principal. The website checks for a position proof when preparing the call. A qualifying caller accrues **0.1% of that conversion's gross WBNB output** (integer-rounded down) in the Vault's maintenance-rewards contract. The bounty is taken before the remainder is split: **3/19 to Ops, 16/19 to The Belly**. Thus the nominal 0.6% Ops / 3.2% Belly figures based on trading volume are estimates before market execution and this bounty, not guaranteed receipts.

The bounty appears as **claimable WBNB**, not an immediate wallet payment. The eligible caller later calls `claim()` (or `claimTo(recipient)` directly on the rewards contract) and pays gas for that separate transaction. Eligibility is checked when conversion occurs, not when claiming. An unsuccessful conversion, a conversion by an ineligible caller, or a call that only advances a meal or buys reward assets accrues no maintenance bounty. This bounty is separate from a staker's ordinary meal rewards.

## Before submitting

The Vault enforces conversion amount and refill limits, price/TWAP and slippage bounds, deadline and pause checks on-chain. The website simulates and checks readiness, but another caller can change state before your transaction is mined. You may still pay gas for a reverted transaction or a confirmed one with no completed leg. Check an uncertain receipt before retrying; do not loosen price protection just to make a conversion succeed.

Unconverted QQQB remains in the QQQB Vault until a protected conversion can succeed. Already-funded Belly balances and settled staker rewards are separate. Maintenance cannot spend staked principal. For the tax accounting, see [Tax Routing]({% link protocol/fees.md %}); for direct interaction and principal redemption without the website, see [Emergency Exit]({% link guides/emergency-exit.md %}).
