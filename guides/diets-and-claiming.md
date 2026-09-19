---
layout: default
title: Diets & Claiming Rewards
parent: User Guides
nav_order: 2
---

# Diets & Claiming Rewards

How to choose your preferred reward assets (Diets), manage allocations across market regimes, and claim earned tokens with automated native unwrapping.

---

## 1. What is a Diet?

In TheFatCat, you are not forced into a single, uniform reward token. Instead, each position independently designates a **Diet Asset** from the protocol's approved [MENU]({% link protocol/execution.md %}):

- **BNB (Canonical Network Asset)**: The default diet and protocol fallback asset (internally accounted via canonical WBNB). It requires zero market execution and carries zero counterparty or issuer risk. Stakers can receive native BNB directly with no manual unwrapping.
- **bStocks (Tokenized Equities)**: Real-world asset backed tokens (e.g. tokenized Nvidia, SpaceX, Nasdaq-100, or S&P 500 ETFs) under a 5% per-meal probation cap.
- **FATCAT (Protocol Native)**: Eligible for addition after AMM graduation, liquidity stabilization, and TWAP oracle warmup.
- **Future Candidate Tokens (Ecosystem Expansion)**: Potential high-liquidity crypto assets, blue-chip ecosystem tokens, or stablecoins that may be approved and listed on the MENU via timelocked governance queues and on-chain TWAP verification.

{: .tip }
Because each stake is an independent position ID, a single wallet can manage multiple positions with completely different diets (e.g. Position #1 earning BNB, Position #2 earning tokenized equities).

---

## 2. Changing Your Diet

You can change your position's diet at any time through the front-end dashboard:

1. Connect your wallet and navigate to the **Positions** dashboard at [thefatcat.fun](https://thefatcat.fun).
2. Locate the position card you wish to update and click the **Diet** dropdown.
3. Select your new reward asset from the approved MENU (e.g. BNB, bStocks, etc.).
4. Click **Switch Diet** and confirm the transaction in your wallet.

### Critical Diet Rules:
1. **Zero Seniority Penalty**: Changing your diet **never resets or reduces your seniority notch**. Your accumulated ladder level ($c_i$) is 100% preserved.
2. **Next-Interval Activation**: The new diet choice takes effect at the **next meal boundary** ($m + 1$). The currently open meal continues allocating to your previous asset.
3. **No Loss of Past Rewards**: Unclaimed tokens earned under your previous diet remain permanently claimable in your dashboard. They are never wiped or overwritten.

---

## 3. Claiming Earned Rewards

Rewards in TheFatCat do not expire. They continuously accumulate across settled meals and wait securely in the protocol's non-custodial distributor until you withdraw them.

### How to Claim on the Dashboard:

1. Open the **Dashboard** or **Rewards** section on [thefatcat.fun](https://thefatcat.fun).
2. Review your accrued reward balances displayed across your designated diet assets (e.g. BNB, bStocks).
3. **Individual Position Claim**: Click **Claim** on any specific position card to withdraw rewards for that stake.
4. **One-Click Batch Claim**: If you manage multiple active positions, click **Claim All** to settle rewards across all your positions in a single transaction, minimizing gas fees.
5. Confirm the transaction in your connected wallet.

### Automatic Native BNB Unwrapping
When your diet is set to BNB (accounted on-chain as canonical WBNB), the claim transaction automatically unwraps it into **native BNB**. You receive spendable BNB directly in your wallet without any extra unwrapping steps or manual transactions.

{: .tip }
**Long Absences & Batched Processing**: If you leave a position untouched for months, hundreds of meal settlements may accumulate. The interface will automatically optimize your claim batches so your transaction stays well within standard network gas limits.

*(For advanced users wishing to claim directly from the contract on BscScan without using the web UI, refer to the [Emergency Exit Guide]({% link guides/emergency-exit.md %})).*
