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

- **BNB**: The default diet and fallback asset, accounted as canonical WBNB. It requires no reward-asset swap and can be claimed as native BNB. Network, contract and BNB price risks remain.
- **bStocks**: Third-party tokens tracking equity or index prices. Check each issuer's terms for ownership rights, redemption, eligible users and availability. Non-exempt assets have a 5% per-meal allocation cap during their seven-day probation. Initial menu assets are exempt on first enable; later re-enabling starts ordinary probation. See [asset risks]({% link safety/risks-and-status.md %}).
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
1. **Seniority Preserved**: Changing your diet does not reset or reduce your seniority notch.
2. **Next-Interval Activation**: The new diet choice takes effect at the **next meal boundary** ($m + 1$). The currently open meal continues allocating to your previous asset.
3. **Past Rewards Preserved**: Settled rewards under the previous diet remain claimable; changing diets does not erase them.

---

## 3. Claiming Earned Rewards

Rewards in TheFatCat do not expire. They continuously accumulate across settled meals and wait securely in the protocol's non-custodial distributor until you withdraw them.

### How to Claim on the Dashboard:

1. Open the **Dashboard** or **Belly / Positions** section on [thefatcat.fun](https://thefatcat.fun).
2. Review your accrued reward balances across your active positions (e.g. BNB, bStocks).
3. **Per-Position Claiming**: Click **Claim** on a position card. The interface sets the cutoff to the latest completed batch; it does not automatically split long histories into multiple gas-budgeted transactions.
4. Confirm the transaction in your connected wallet.

### Automatic Native BNB Unwrapping
When your diet is set to BNB (accounted on-chain as canonical WBNB), claiming automatically unwraps it into **native BNB**. You receive spendable BNB directly in your wallet without any extra unwrapping steps or manual transactions.

{: .tip }
**Long Backlogs**: A long reward history may need to be claimed in smaller ranges across several transactions. The dashboard currently uses the latest completed batch and does not split the history automatically. If a claim exceeds the current gas limit, follow the smaller-range claiming steps in the [Emergency Exit Guide]({% link guides/emergency-exit.md %}).

*(For advanced users wishing to claim directly from the contract on BscScan without using the web UI, refer to the [Emergency Exit Guide]({% link guides/emergency-exit.md %})).*
