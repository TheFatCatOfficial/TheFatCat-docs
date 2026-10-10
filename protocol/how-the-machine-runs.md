---
layout: default
title: How the Machine Runs
parent: Core Mechanics
nav_order: 0
---

# How the Machine Runs

Adapted from founder Silas's article of the same name, this chapter connects trading-tax revenue, Belly reserves, staking seniority, diet selection and FEED maintenance. It follows revenue through to position rewards and explains the conditions at each stage.

## 1. From trading tax to position rewards

TheFatCat accumulates revenue in the Belly, then allocates it by meal and position weight. Staking principal, reward reserves and claimable rewards have separate accounting and custody.

| Stage | What happens | What it means for you |
|:---|:---|:---|
| Tax receipt | FATCAT trading tax is received as QQQB through the upstream route, then converted to WBNB | A taxable trade does not mean revenue has reached the Belly; liquidation and conversion must succeed |
| Revenue split | After upstream fees and any earned FEED bounty, 85% of net revenue plus split-rounding dust goes to the Belly; 15% funds development, operations and marketing | The 85% / 15% split applies to revenue after fees and bounties |
| Meal allocation | A successful meal advance records a budget and position entitlements from unreserved funds | Allocation is accounting; it does not send rewards to your wallet |
| Asset settlement | The Executor procures selected assets in meal order, or settles in WBNB under the fallback rules | Rewards may wait for price, liquidity, maintenance or treasury-allowance conditions |
| User claim | Settled rewards enter the Distributor, from which you claim them by transaction | Claiming rewards and redeeming staking principal are separate operations |

Ordinary staking principal stays in a separate Vault. Claiming delivers settled reward assets without selling the FATCAT held as your principal. See [Tax Routing & Fees]({% link protocol/fees.md %}) for the full fee calculation.

## 2. Why the Belly behaves like a reservoir

Fees can arrive in bursts of trading activity. The Belly spreads allocation of that revenue across later meals. It changes the timing of allocations but creates no additional revenue.

For an on-time, fully rewarded eight-hour meal that meets allocation conditions, the budget is capped at **1/21 of unreserved quote funds, approximately 4.76%**. Funds already reserved for pending meals are excluded to prevent allocating them again.

- Meals require at least eight hours between advances, and someone must submit a successful transaction to advance them.
- Each advance closes one meal and starts the next at the current call time. Missed historical meals are not backfilled.
- A delayed advance counts at most sixteen hours of rewarded time.
- The initial accumulation period, insufficient eligible weight, asset caps and integer rounding can reduce actual allocations below the budget limit.

Assuming no new revenue, one valid meal closed every eight hours, full and prompt execution, and no integer dust, the model's unreserved balance declines as follows:

| Time elapsed | Remaining unreserved balance in the model |
|:---|:---|
| 1 day | About 86% |
| 3 days | About 64% |
| 7 days | About 36% |
| 14 days | About 13% |
| 30 days | About 1.24% |

This ideal model has a half-life of about 4.74 days. The table describes an allocation model; pending reservations may still sit in the Belly, so it is not a direct measure of physical treasury balance or your payout schedule. Without new revenue, the amount available per meal also declines.

Actual outflows have a separate eight-hour window allowance. Allocation budgets and withdrawal allowances are distinct rules; see [The Belly Reserve and Release Mechanics]({% link protocol/belly.md %}).

## 3. How a position records principal and time

Each stake creates an independent position recording principal, seniority, diet and claim progress. A wallet can have multiple positions, which do not automatically merge. The minimum ordinary position is **100,000 FATCAT**, fixed at deployment; its market cost changes with the price of FATCAT.

The basic weight relationship is:

**Position weight = staked principal × seniority multiplier**

A new position does not participate in the meal already open. It becomes active in the next meal at **1×**. Each completed active meal adds 1 to the multiplier, reaching the **22×** cap after 21 completed active meals. The count follows actual advances; calendar time alone does not add seniority, and the multiplier does not compound principal.

For two positions each staking 100,000 FATCAT, one in its first active meal has a weight of 100,000, while a mature one has a weight of 2,200,000. Their weight per unit of principal differs by 22 times, while actual rewards also depend on total pool weight, diet allocations and execution. If all positions are mature, weight per unit of principal is equal and shares again follow principal proportionally.

At equal seniority, ten times the principal still means ten times the weight. Seniority does not cap capital size; new capital can dilute other positions' future shares from the next meal onward. See [Meals & Seniority]({% link protocol/meals-and-seniority.md %}) for formulas and boundaries.

### How the first seven days work

Staking will open immediately after token graduation. The initial seven-day accumulation period starts with the **successful transaction opening staking**, which starts the reward clock. Positions can accrue seniority through successful meal advances during this period, but no new reward budgets are allocated; successfully converted revenue stays in the Belly.

This is why “staking has been open for seven days” and “21 active meals have been completed” are different conditions. After accumulation ends, a successful advance must still satisfy rewarded-time, weight and allocation conditions to create a reward budget.

## 4. Diets determine the settlement asset

Each position chooses one DIET from the enabled menu. BNB is the default, accounted as WBNB internally. It needs no additional procurement swap and can be unwrapped to native BNB when claimed. Eligible menu assets can also include tokenized equities (bStocks) and other tokens. FATCAT itself can only be considered after graduation, route validation, TWAP warmup and other listing conditions.

- A diet change takes effect in the next meal, preserves seniority and has no protocol switching fee; transaction gas still applies.
- Previously recorded rewards remain in their historical assets. A diet change does not convert them into the new choice.
- Procurement for non-WBNB assets follows global oldest-meal order and checks prices, liquidity and minimum output.
- Fallback-eligible allocations can settle in WBNB, subject to available funds and treasury allowance. One failed purchase does not mean immediate fallback settlement.

Allocation, settlement and claiming can happen at different times. See [Diets & Claiming Rewards]({% link guides/diets-and-claiming.md %}) for actions and [Procurement & Execution]({% link protocol/execution.md %}) for waiting and fallback rules.

## 5. Who keeps the machine running: FEED

Smart contracts need transactions to trigger work. Anyone can attempt public maintenance; each staker does not need to run a keeper. A FEED attempts these steps in order:

1. Convert the tax Vault's QQQB to WBNB and forward revenue.
2. Advance at most one due meal and record new allocations.
3. Check a contract-assigned batch of menu assets and attempt pending procurement.

The caller pays gas without supplying personal QQQB. Each step remains subject to balance, timing, price, liquidity and pause conditions.

### How the FEED bounty is earned

When conversion succeeds inside FEED, the original caller must either hold at least **10,000 FATCAT** or provide its own staking position with positive remaining principal. An eligible caller receives a credit of one thirty-eighth of the output, rounded down based on the actual gross WBNB output. An ineligible caller can still help maintain the protocol but earns no bounty.

The bounty is recorded as separately claimable WBNB and requires another transaction and gas to withdraw. Standalone advances, procurement and FEED scans without successful conversion earn no bounty. Only in the standard tax model, ignoring costs, price changes and rounding, does it represent approximately 0.1% of the corresponding trade value; actual amounts follow conversion and reward records.

Local failures in later advancement or procurement normally preserve a successful conversion and eligible bounty, but invalid input, whole-transaction gas exhaustion and other transaction-level failures can still revert everything. A success receipt does not prove that every step completed. Official automated maintenance attempts to supplement public calls; its success and timeliness still depend on execution conditions and its operating environment. See [FEED & Decentralized Maintenance]({% link guides/community-keeper.md %}).

## 6. What remains when you exit

Ordinary positions have no protocol lockup or exit fee. Redemption returns principal and ends future weight for that position. Exiting forfeits the currently open meal's entitlement while preserving previously recorded reward entitlements. A new ordinary position starts again at 1×.

| Where funds are held | Purpose and boundaries |
|:---|:---|
| Staking Vault | Holds principal; ordinary redemption does not check the protocol pause flag |
| Belly | Holds reward reserves; outflows follow a fixed route, pause controls and window allowances |
| Reward Distributor | Holds settled rewards; claiming does not require further Belly outflows at that time |

Pending procurement or a paused Belly therefore adds no meal-wait requirement to ordinary redemption. Redemption and claims still require a successful transaction, token delivery and the relevant contract checks. See the [Emergency Exit Guide]({% link guides/emergency-exit.md %}) for direct interaction when the front end is unavailable.

## 7. What else to keep in view

Rewards come from actual revenue and donations recognized by the contracts. They depend on trading volume, participating principal and seniority distribution, selected assets and execution. The reservoir and seniority rules promise no fixed return.

Upstream Flap permissions can change future tax routing; tokenized equities introduce issuer, custody and upgrade risks; TWAP checks do not eliminate manipulation, MEV or liquidity risk. See [Risk Boundaries]({% link safety/risks-and-status.md %}) for how these conditions affect your actions, and [Monitoring & Incident Response]({% link safety/monitoring.md %}) for an overview of response measures.

[Time-Seniority Certificates]({% link guides/seniority-certificates.md %}) are a future roadmap item, to be issued as NFTs when the protocol is mature enough. Users with staking positions will be able to burn FATCAT to mint them. Further details will be announced later.
