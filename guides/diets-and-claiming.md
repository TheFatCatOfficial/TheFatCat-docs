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
- **bStocks (Third-Party Tokenized Equity Certificates)**: Pass-through certificates issued by third-party providers (such as Backed, etc.) tracking traditional equity or index ETF price performance (does not confer direct corporate equity ownership or shareholder voting rights; e.g. tokenized Nvidia, SpaceX, Nasdaq-100, or S&P 500 tracking tokens). **Regulatory & Geographic Notice**: The regulatory status and availability of tokenized certificates strictly depend on specific issuer offering terms and prospectus filings, which typically impose explicit investor qualification standards and restricted jurisdiction exclusions (e.g. unavailable to residents of the US, UK, etc.). Participants are solely responsible for verifying legal compliance; these assets are subject to the 5% per-meal probation cap (exempt for genesis launch menu items).
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

1. Open the **Dashboard** or **Belly / Positions** section on [thefatcat.fun](https://thefatcat.fun).
2. Review your accrued reward balances across your active positions (e.g. BNB, bStocks).
3. **Per-Position Claiming**: Click **Claim** on any specific position card. To protect your transaction from gas exhaustion across long histories, the interface automatically submits the claim up to the latest completed batch.
4. Confirm the transaction in your connected wallet.

### Automatic Native BNB Unwrapping
When your diet is set to BNB (accounted on-chain as canonical WBNB), claiming automatically unwraps it into **native BNB**. You receive spendable BNB directly in your wallet without any extra unwrapping steps or manual transactions.

{: .tip }
**Gas Safety for Long Backlogs**: If you leave a position untouched for months, hundreds of meal settlements may accumulate. The protocol supports chunked claims across bounded batch ranges (`claimThrough` / `claimNativeThrough`), ensuring that every claim transaction completes reliably within standard block gas limits.

*(For advanced users wishing to claim directly from the contract on BscScan without using the web UI, refer to the [Emergency Exit Guide]({% link guides/emergency-exit.md %})).*
