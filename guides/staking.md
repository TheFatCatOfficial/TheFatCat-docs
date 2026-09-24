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
4. Click **Approve** and confirm the token allowance in your wallet.
5. Click **Stake** and confirm the transaction.

*(Note: Advanced users wishing to call the contract directly on BscScan without using the front-end can follow the direct interface in the [Emergency Exit Guide]({% link guides/emergency-exit.md %})).*

---

## 3. Position Activation & The 7-Day Warmup Window

Staking does not grant retroactive rewards for meals already opened or in progress:

<div class="tfc-diagram-frame">
  <div class="tfc-diagram-bar">
    <span class="tfc-diagram-tag">TIMELINE</span>
    <span class="tfc-diagram-title">Position Activation & Cadence Timeline</span>
  </div>
  <pre class="tfc-diagram-content"><code>Deposit (T_now) ─────────────► Next Meal Roll (8h Boundary) ─────► Normal Operation
[ Deposit Tokens ]            [ Position Activates ]              [ Notch Climbs Each Meal ]
(Weight in meal m is 0)       (Starts at Notch 1, Weight = p × 1) (Advances to Notch 2 next meal)</code></pre>
</div>

1. **Deposit & Activation**: When you deposit tokens, your capital is held in custody immediately. In the meal currently underway, your position's calculation weight is 0. Once the next 8-hour boundary advances (`advance`), your position activates at **Notch 1 (1x weight)**.
2. **Climbing the Ladder**: After activating, your seniority notch increases by $+1$ for every completed 8-hour meal, up to the maximum cap of Notch 22 (requiring 21 completed active meals, or approximately 7 days on the standard cadence).

{: .important }
**The 7-Day Warmup Window (Zero Early Dilution)**:
- **When can you stake**: As soon as staking opens (governance may open staking prior to graduation; otherwise it opens automatically upon graduation).
- **How seniority accrues**: Positions deposited during this period begin climbing the seniority ladder immediately, advancing notch by notch every 8 hours.
- **When do rewards start**: During the first 7 days, trading taxes accumulate inside the treasury with zero reward distributions. This ensures early stakers establish their seniority on a fair, equal footing without first-mover dilution. Once the 7-day warmup concludes, 8-hour reward distributions begin.  
*(Underlying mechanism: Opening staking via `openStaking()` starts the 7-day reward countdown clock `startRewardClock()`.)*

---

## 4. Multi-Position Management & Claiming

Each stake creates an independently numbered position with its own tenure and diet selection:

- **Adding More Principal**: To stake additional FATCAT, simply open a new position from the interface. A single wallet can manage multiple independent positions simultaneously.
- **Independent Asset Diets**: Different positions can target different reward assets (e.g., Position #1 earning BNB, Position #2 earning tokenized bStocks).
- **Per-Position Claiming**: Rewards are settled and withdrawn per position. To prevent transaction failure from gas exhaustion over long backlogs, users settle rewards per position in bounded batch ranges (via `claimThrough` / `claimNativeThrough`).
- **Exiting & Time-Seniority Certificate Minting**: When exiting a position, 100% of staked principal is returned to your wallet; stakers may also choose to mint an on-chain [Time-Seniority Certificate]({% link guides/seniority-certificates.md %}) by burning FATCAT. The certificate delivers token deflation and 5% secondary royalty accretion for The Belly.
- **Seniority Reset on Re-Staking**: If you exit and open a fresh position without an active certificate, your multiplier resets to Notch 1 (1.0×) and must climb the ladder from scratch.
