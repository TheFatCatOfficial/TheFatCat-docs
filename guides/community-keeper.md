---
layout: default
title: FEED & Decentralized Maintenance
parent: User Guides
nav_order: 4
---

# FEED & Decentralized Maintenance

Anyone can try to help advance the protocol through the [Belly page](https://thefatcat.fun/belly). There is no participant whitelist. When public advancement is delayed, an official fallback Keeper bot advances the protocol automatically during its early stages. Stakers do not have to run their own Keeper, but meals and procurement still require someone to complete advancement operations successfully; the official fallback does not guarantee perpetual or immediate progress.

## One FEED, one assigned batch

FEED attempts to convert pending QQQB revenue, advance one due meal, then purchase rewards for an assigned batch of diets. The protocol selects the assets to check; participants cannot choose their own subset. Successive checks rotate across the menu. Nine listed assets with four checks per transaction are scanned as 4/4/1.

Each FEED checks **4 assets** by default, with a limit of **8**. See [menu lifecycle]({% link protocol/execution.md %}#5-menu-lifecycle) for menu capacity and how governance changes these settings.

Scanning is not a promise to purchase every checked asset. Pending budgets, Belly outflow limits, minimum amounts and market conditions still apply. Later advancement or purchase failures do not cancel a successful conversion or its eligible Feeder reward; unfinished work can be retried when conditions allow. A failed whole transaction still consumes gas and does not establish that any step completed.

A due meal can advance when execution conditions permit; advancement determines reward allocations and does not itself deliver rewards to a staker's wallet.

## Conversion and the Feeder reward

FEED converts QQQB revenue held by the protocol. Participants pay gas, supply no personal QQQB and cannot redirect the proceeds. The website prepares one conversion using the available balance and per-transaction limits; the initial range is 0.1–50 QQQB. Completion still depends on prices, liquidity and the protocol's operating state.

A successful conversion **inside FEED** can create a Feeder reward independently of later advancement and purchases. At conversion time the participating wallet must hold at least **10,000 `$FATCAT`**, or own a staking position with remaining principal. The reward is **1/38 of the gross WBNB output, rounded down**, about 2.63158% of actual output. Under the standard 4% `$FATCAT` trading tax, its nominal target is 0.1% of the trade value represented by the conversion. Prices, conversion costs and rounding affect that equivalent. After the reward deduction, the remaining funds continue to the next stage for allocation. Standalone conversion, advancement, purchases and scans without conversion do not earn this reward.

Feeder rewards from FEED are recorded as claimable WBNB separately from staking rewards. Claiming requires gas. Review the page's processing results and actual new reward; a successful transaction alone does not prove that conversion, every purchase or a Feeder reward occurred. Refer to the actual on-chain results.

## Before submitting

Refresh the page and review the pending work, estimated gas and reward eligibility before confirming in your wallet. Another participant's FEED or a menu change may make earlier information outdated; refresh before retrying a failed attempt. Resolve an uncertain transaction status before resubmitting.

Historical settled rewards remain claimable after an asset leaves the active menu. Principal redemption does not require maintenance first. See [menu lifecycle]({% link protocol/execution.md %}) and [Emergency Exit Guide]({% link guides/emergency-exit.md %}).
