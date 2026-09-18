---
layout: default
title: Staking & Positions
parent: User Guides
nav_order: 1
---

# Staking & Position Management

A comprehensive guide to opening positions, managing isolated stakes, and climbing the seniority ladder in TheFatCat.

---

## 1. Prerequisites & The Entry Threshold

To open a position in TheFatCat's [`StakingVault`]({% link contracts.md %}):

- **Minimum Principal**: **100,000 FATCAT** (representing exactly 0.01% of the 1,000,000,000 total supply).
- **Approved FATCAT**: You must approve the `StakingVault` contract to spend your FATCAT tokens.
- **Gas**: A small amount of native BNB for transaction fees on BNB Chain.

{: .note }
The 100,000 FATCAT entry threshold is an immutable parameter passed to the contract's constructor. It acts as an anti-spam barrier, ensuring the state tree remains gas-efficient for all participants.

---

## 2. How to Open a Position

1. Connect your Web3 wallet (MetaMask, Binance Web3 Wallet, OKX Wallet, Trust Wallet, or WalletConnect) at [thefatcat.fun](https://thefatcat.fun).
2. Enter the amount of FATCAT you wish to stake ($\ge 100{,}000$).
3. Select your desired initial **Diet** (Default is BNB).
4. *(Optional)* If you hold an unencumbered [Seniority Certificate]({% link guides/seniority-certificates.md %}), you may link it to start with an elevated notch.
5. Click **Approve** and confirm the token allowance in your wallet.
6. Click **Stake** and confirm the transaction.

*(Note: Advanced users wishing to call the contract directly on BscScan without using the front-end can follow the direct interface in the [Emergency Exit Guide]({% link guides/emergency-exit.md %})).*

---

## 3. Position Activation Lifecycle

Staking does not grant retroactive rewards for the meal currently in progress:

```
T_now ─────────────────────► Meal Closes (advanceInterval) ──► Next Meal Closes
[ User Calls stake() ]       [ Position Active (j_i = m+1) ]    [ First Rewards Earned ]
(Interval m: Weight = 0)     (Notch = 1, Weight = p_i × 1)      (Notch climbs to 2)
```

1. **Pending Interval ($m$)**: When you stake during interval $m$, your deposit is recorded in the vault immediately, but your effective weight in the currently active meal is 0.
2. **Active From ($j_i = m + 1$)**: When the keeper or any caller triggers `advanceInterval()`, your position activates at **Notch 1**.
3. **Climbing the Ladder**: For every subsequent 8-hour meal completed, your seniority notch automatically increases by $+1$ until reaching the maximum of 22 (after 21 completed active meals).

{: .important }
**The 7-Day Pre-Launch Ramp**: When the protocol is first launched, rewards are deliberately disabled for the first 21 intervals (approx. 7 days). This allows all early stakers to climb from Notch 1 to Notch 22 in a level playing field, ensuring fair reward distribution before trading taxes begin releasing.

---

## 4. Multi-Position Independence (No Merging / No Incremental Deposits)

In TheFatCat, **each stake is an isolated, independent position ID with its own lifecycle, seniority clock, and diet**:

{: .note }
**Why Positions Cannot Be Merged or Added To**: The protocol deliberately omits an `addPrincipal` or position-merging function. Allowing an existing mature position (e.g., at Notch 22) to absorb fresh capital would create a fatal **Seniority Laundering** exploit—a whale could open a minimal 100,000 FATCAT position, wait 7 days to reach maximum seniority, and then dump 100,000,000 fresh tokens into that position to instantly receive $22\times$ weighting without enduring the ramp period.

- **Staking More Tokens**: If you wish to deposit additional FATCAT, simply open a **new position**. A single wallet can hold and manage multiple independent positions concurrently.
- **Independent Asset Diets**: Different positions under the same wallet can select different Diets (e.g., Position #1 earning BNB, Position #2 earning tokenized equities).
- **Efficient Claims**: Although positions age independently, you can claim earned rewards across all your positions in a single transaction via `claimMany()`, avoiding redundant gas fees.
