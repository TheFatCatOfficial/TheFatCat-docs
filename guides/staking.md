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

To open a staking position in TheFatCat:

- **Minimum Principal & Whole Token Requirement**: **100,000 FATCAT** (representing exactly 0.01% of the 1,000,000,000 total supply). **Note**: The contract strictly enforces whole-token principal; fractional token amounts will cause the transaction to fail.
- **Approved FATCAT**: You must approve the staking contract to spend your FATCAT tokens.
- **Gas**: A small amount of native BNB for transaction fees on BNB Chain.

{: .note }
The ordinary 100,000 FATCAT entry threshold is fixed at deployment and limits small positions. It does not impose a fixed gas cost for every operation.

---

## 2. How to Open a Position

1. Connect your Web3 wallet (MetaMask, Binance Web3 Wallet, OKX Wallet, Trust Wallet, or WalletConnect) at [thefatcat.fun](https://thefatcat.fun).
2. Enter the amount of FATCAT you wish to stake (must be a whole token amount $\ge 100{,}000$).
3. Select your desired initial **Diet** (Default is BNB).
4. Click **Approve** and confirm the token allowance in your wallet.
5. Click **Stake** and confirm the transaction.

*(If the website is unavailable and you need to withdraw principal or settled rewards, follow the [Emergency Exit Guide]({% link guides/emergency-exit.md %}).)*

---

## 3. Position Activation & The 7-Day Warmup Window

Staking does not grant retroactive rewards for meals already opened or in progress:

<div class="tfc-diagram-frame">
  <div class="tfc-diagram-bar">
    <span class="tfc-diagram-tag">TIMELINE</span>
    <span class="tfc-diagram-title">Position Activation & Cadence Timeline</span>
  </div>
  <pre class="tfc-diagram-content"><code>Deposit ─────────────► Next Meal Roll (8h Boundary) ─────► Normal Operation
[ Deposit Tokens ]            [ Position Activates ]              [ Notch Climbs Each Meal ]
(Weight in meal m is 0)       (Starts at Notch 1, Weight = p × 1) (Advances to Notch 2 next meal)</code></pre>
</div>

1. **Deposit & Activation**: When you deposit tokens, your capital is held in custody immediately. In the meal currently underway, your position's calculation weight is 0. When the next meal begins, at least eight hours after the previous advance, your position activates at **Notch 1 (1.0× weight)**.
2. **Climbing the Ladder**: After activating, your seniority notch increases by $+1$ for every completed 8-hour meal, up to the maximum cap of Notch 22 (requiring 21 completed active meals, or approximately 7 days on the standard cadence).

{: .important }
**The 7-Day Reward Warmup**:
- **When can you stake**: Staking will open immediately after token graduation. Deposits become available once staking is open; the seven-day reward accumulation period starts when staking opens.
- **How seniority accrues**: New ordinary positions have zero weight in their opening meal. After activation, seniority increases when someone successfully advances the clock, at intervals of at least eight hours.
- **When do rewards start**: The first seven days allocate no new rewards. Revenue may accumulate when upstream conversion succeeds. After warmup, successful meal advances may allocate rewards, with at least eight hours between advances.

The warmup is a single protocol-wide period; opening a new position does not restart it.

---

## 4. Multi-Position Management & Claiming

Each stake creates an independently numbered position with its own tenure and diet selection:

- **Adding More Principal**: To stake additional FATCAT, simply open a new position from the interface. A single wallet can manage multiple independent positions simultaneously.
- **Independent Asset Diets**: Different positions can target different reward assets (e.g., Position #1 earning BNB, Position #2 earning tokenized bStocks).
- **Per-Position Claiming**: Rewards are claimed separately per position. A long reward history may need several smaller claims; the dashboard currently uses the latest completed batch and does not split long histories automatically.
- **Standard Principal Redemption**: Exiting a position returns 100% of your staked principal to your wallet.
- **Seniority Reset on Re-Staking**: Exiting and opening a fresh ordinary position resets its multiplier to Notch 1 (1.0×); it must climb the ladder from scratch.
