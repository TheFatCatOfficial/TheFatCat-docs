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
4. *(Future Roadmap)* In upcoming updates, linking a [Seniority Certificate]({% link guides/seniority-certificates.md %}) will allow starting with an elevated notch.
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

## 4. Managing Multiple Positions

In TheFatCat, each stake creates an isolated position with its own lifecycle, seniority clock, and diet:

- **Adding More Principal**: To stake additional FATCAT, simply open a new position from the staking interface. A single wallet can create and manage multiple independent positions simultaneously.
- **Independent Asset Diets**: Different positions under the same wallet can select different reward assets (e.g., Position #1 earning BNB, Position #2 earning tokenized equities).
- **One-Click Batch Claiming**: While each position matures on its own timeline, the dashboard allows you to claim rewards across all your active positions in a single transaction to minimize gas fees.
- **Seniority Certificates (Roadmap)**: In a subsequent protocol phase, stakers will have the option to mint an on-chain [Seniority Certificate]({% link guides/seniority-certificates.md %}) upon exit to carry their achieved seniority to future positions.
