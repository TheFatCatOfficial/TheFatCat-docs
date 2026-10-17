---
layout: default
title: Staking & Positions
parent: User Guides
nav_order: 1
---

# Staking & Positions

A comprehensive guide to opening positions, managing isolated stakes, and climbing the seniority ladder in TheFatCat.

---

## 1. Prerequisites & The Entry Threshold

To open a staking position in TheFatCat:

- **Minimum Principal & Whole Token Requirement**: **100,000 `$FATCAT`** (representing exactly 0.01% of the 1,000,000,000 total supply). **Note**: The contract strictly enforces whole-token principal; fractional token amounts will cause the transaction to fail.
- **Approved `$FATCAT`**: You must approve the staking contract to spend your `$FATCAT`.
- **Gas**: A small amount of native BNB for transaction fees on BNB Chain.

{: .note }
The ordinary 100,000 `$FATCAT` entry threshold is fixed at deployment and limits small positions.

---

## 2. How to Open a Position

1. Connect your Web3 wallet (MetaMask, Binance Web3 Wallet, OKX Wallet, Trust Wallet, or WalletConnect) at [thefatcat.fun](https://thefatcat.fun).
2. Enter the amount of `$FATCAT` you wish to stake (must be a whole token amount $\ge 100{,}000$).
3. Select your desired initial **Diet** (Default is BNB).
4. Click **Approve** and confirm the token allowance in your wallet.
5. Click **Stake** and confirm the transaction.

*(If the website is unavailable and you need to withdraw principal or settled rewards, follow the [Emergency Exit Guide]({% link guides/emergency-exit.md %}).)*

---

## 3. Position Activation & The Seven-Day Accumulation Period

Staking does not grant retroactive rewards for meals already opened or in progress:

{% capture diagram_content %}Deposit ─────────────► Next Meal Roll (8h Boundary) ─────► Normal Operation
[ Deposit Tokens ]            [ Position Activates ]              [ Notch Climbs Each Meal ]
(Weight in meal m is 0)       (Starts at Notch 1, multiplier 1×)  (Advances to Notch 2 next meal){% endcapture %}
{% include components/diagram-frame.html tag="TIMELINE" title="Position Activation & Cadence Timeline" content=diagram_content %}

1. **Deposit & Activation**: When you deposit tokens, your capital is held in custody immediately. In the meal currently underway, your position's calculation weight is 0. When the next meal begins, at least eight hours after the previous advance, your position activates at **Notch 1 (1× seniority multiplier)**.
2. **Climbing the Ladder**: After activating, your seniority notch increases by $+1$ for every completed 8-hour meal, up to the maximum cap of Notch 22 (requiring 21 completed active meals, or approximately 7 days on the standard cadence).

{: .important }
**The seven-day accumulation period** is a single protocol-wide period that starts when staking actually opens. Seniority grows normally during it, but no new rewards are allocated, and opening a new position does not restart it. See [Token Launch & Feature Opening]({% link guides/launch-stages.md %}) for when staking opens and what each stage allows.

---

## 4. Multi-Position Management & Claiming

Each stake creates an independently numbered position with its own tenure and diet selection:

- **Adding More Principal**: To stake additional `$FATCAT`, simply open a new position from the interface. A single wallet can manage multiple independent positions simultaneously.
- **Independent Asset Diets**: Different positions can target different reward assets (e.g., Position #1 earning BNB, Position #2 earning tokenized bStocks).
- **Incentive Multiplier**: Each asset option has an incentive multiplier that scales the weight of positions choosing it (principal × seniority multiplier × incentive multiplier), initially managed by the project team within 1.0×–2.0×.
- **Per-Position Claiming**: Rewards are claimed separately per position. For long reward histories, see [Diets & Claiming]({% link guides/diets-and-claiming.md %}).
- **Standard Principal Redemption**: Exiting a position returns 100% of your staked principal to your wallet.
- **Seniority Reset on Re-Staking**: Exiting and opening a fresh ordinary position resets its multiplier to Notch 1 (1×); it must climb the ladder from scratch.
