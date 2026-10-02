---
layout: default
title: Decentralized Maintenance
parent: User Guides
nav_order: 4
---

# Decentralized Protocol Maintenance

Anyone can attempt eligible maintenance through the [Belly page](https://thefatcat.fun/belly) or public contracts. There is no caller whitelist. Stakers do not have to operate a keeper, but meals and procurement require successful transactions by someone; official fallback maintenance does not guarantee perpetual or immediate progress.

## One FEED, one assigned batch

FEED calls `ProtocolExecutor.maintain(...)`, or the Flap Vault's `feed(request)` facade for the original wallet. It checks QQQB conversion (with its internal receiver flush), at most one due meal, then the contract-assigned batch of reward assets. The current batch comes from `previewAssets()`; callers cannot choose a cheaper subset. Successive completed checks rotate across the menu, with a shorter tail when necessary. Nine listed assets with batch size four are scanned as 4/4/1. Pass the exact preview order, with an equally sized `minOuts` array containing only zeros; procurement uses the protocol floor.

Menu capacity and FEED batch size are separate on-chain parameters. The Registry defaults to **16 menu slots and 4 asset checks per FEED**, with hard limits **32 and 8**. The Governor multisig queues changes, waits three days, then executes them; Governor or Guardian may cancel before execution. A disabled asset occupies its slot until safe archival. The website, Flap component and keeper read the effective Registry values rather than maintaining separate settings. Increasing capacity does not list or approve any asset.

Scanning is not a promise to purchase every scanned asset. Pending budgets, Belly outflow limits, minimum amounts and market checks still apply. After conversion, FEED attempts advancement and purchases in the same transaction. A failed advancement, read or purchase does not cancel a successful conversion or its eligible bounty; ordinary leg failures are recorded and the remaining assets are checked. Failed purchases retain their pending budgets for retry. If the entire isolated follow-up fails, including from exhausted follow-up gas or a menu change, only its work rolls back and the cursor stays unchanged. A zero-input call may just move the scan cursor. Invalid batch input, a positive conversion request with no completed leg, or whole-transaction out-of-gas still causes a full revert. Individual maintenance and fallback entry points remain available without a FEED bounty.

There is no extra five-minute waiting period for public maintenance. A due meal can be advanced when the contract allows it; advancing records allocations and does not itself deliver reward tokens to a staker's wallet.

## Conversion and the Feeder reward

The Vault converts its own QQQB through the fixed QQQB → USDT → WBNB route. The caller pays gas, supplies no personal QQQB and cannot redirect the proceeds. The website chooses one conversion within the on-chain balance, minimum and per-swap maximum; the initial conversion range is 0.1–50 QQQB per transaction, with no cumulative hourly conversion quota. Price/TWAP, deadline and pause conditions still apply.

A successful conversion **inside FEED** can create a Feeder reward independently of the later advancement and purchases. At conversion time the original caller must hold at least **10,000 FATCAT**, or provide its own staking position with positive remaining principal. The reward is `floor(gross WBNB output / 38)` (about 2.63158% of actual output), targeting 0.1% of the trade value represented by this conversion under the standard 4% tax and 5% platform-share assumptions. Prices, conversion costs and rounding affect the trade-value equivalent. After this deduction, the remaining proceeds split **85% to the Belly reward treasury and 15% to Ops Safe for project development, operations and marketing**. Direct conversion, advance, procurement and a scan without conversion do not earn this reward.

The reward is recorded as claimable WBNB, separate from staking rewards. Claiming requires a separate transaction and gas, but does not recheck eligibility. Flap reads its Vault `FeedResult` by transaction hash and beneficiary; the website reads Executor leg results. Exact new credit is established by the Rewards `Accrued` event in that transaction, not global counter or balance changes that may include other users.

## Before submitting

Refresh the assigned batch and simulate. Another FEED or menu change can invalidate the preview before inclusion; refresh and retry after a failed simulation or confirmed revert. An included transaction consumes gas even when it reverts. Resolve an uncertain receipt before resubmitting. A success receipt alone does not prove that conversion, every purchase or a bounty occurred.

Archival removes an asset from active menu/settlement work while retaining historical reward records and unclaimed settled debt. Historical rewards remain discoverable separately from the current menu; principal redemption does not require a maintenance call. See [menu lifecycle]({% link protocol/execution.md %}) and [Emergency Exit]({% link guides/emergency-exit.md %}).
