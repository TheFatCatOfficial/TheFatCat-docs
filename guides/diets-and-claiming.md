---
layout: default
title: Diets & Claiming
parent: User Guides
nav_order: 2
---

# Diets & Claiming

How to choose your preferred reward assets (Diets), manage allocations across market regimes, and claim earned tokens with automated native unwrapping.

---

## 1. What is a Diet?

In TheFatCat, you are not forced into a single, uniform reward token. Instead, each position independently designates a **Diet Asset** from the protocol's enabled [MENU]({% link protocol/execution.md %}):

- **BNB**: The default diet and fallback asset, accounted as canonical WBNB. It requires no reward-asset swap and can be claimed as native BNB. Network, contract and BNB price risks remain.
- **bStocks**: Third-party tokens tracking equity or index prices. Check each issuer's terms for ownership rights, redemption, eligible users and availability. Non-exempt assets have a 5% per-meal allocation cap during their seven-day probation. Initial menu assets are exempt on first enable; later re-enabling starts ordinary probation. See [asset risks]({% link safety/risks-and-status.md %}).
- **`$FATCAT` (Protocol Native)**: Eligible for addition after AMM graduation, liquidity stabilization, and TWAP oracle warmup.
- **Future Candidate Tokens (Ecosystem Expansion)**: Potential high-liquidity crypto assets, blue-chip ecosystem tokens, or stablecoins that may be approved and listed on the MENU via timelocked governance queues and on-chain TWAP verification.

### Menu Expansion, Incentive Multipliers and Asset Listings

The menu is planned to gradually include more bStocks and Meme assets. Each asset option has an incentive multiplier that scales the weight of positions choosing it (principal × seniority multiplier × incentive multiplier), initially managed by the project team within 1.0×–2.0×. The initial plan is to announce each asset's incentive multiplier for the week every Monday; once a change is announced and submitted, it takes effect from the next meal after a three-day governance delay.

The team will open an asset listing application channel in the future. Proposed assets must undergo team evaluation. After approval, applicants will need to permanently burn a specified amount of `$FATCAT` under the agreed listing terms as the cost of adding the asset to the menu. The application requirements, burn amounts and process will be announced when the channel opens.

---

## 2. Changing Your Diet

You can change your position's diet at any time through the front-end dashboard:

1. Connect your wallet and navigate to the **Positions** dashboard at [thefatcat.fun](https://thefatcat.fun).
2. Locate the position card you wish to update and click the **Diet** dropdown.
3. Select your new reward asset from the enabled MENU (e.g. BNB, bStocks, etc.).
4. Click **Switch Diet** and confirm the transaction in your wallet.

### Diet Rules:
1. **Seniority Preserved**: Changing your diet does not reset or reduce your seniority notch.
2. **Next-Meal Activation**: The new diet choice takes effect at the **next meal boundary** ($m + 1$). The currently open meal continues allocating to your previous asset.
3. **Past Rewards Preserved**: Settled rewards under the previous diet remain claimable; changing diets does not erase them.

---

## 3. Claiming Earned Rewards

Rewards in TheFatCat have no protocol expiry. They accumulate across settled meals and wait in the protocol's reward distributor until you claim them.

### How to Claim on the Dashboard:

1. Open the [Belly page](https://thefatcat.fun/belly).
2. Review your accrued reward balances across your active positions (e.g. BNB, bStocks).
3. **Per-Position Claiming**: Click **Claim** on a position card.
4. Confirm the transaction in your connected wallet.

### Automatic Native BNB Unwrapping
When your diet is set to BNB (accounted on-chain as canonical WBNB), claiming automatically unwraps it into **native BNB**. You receive spendable BNB directly in your wallet without any extra unwrapping steps or manual transactions.

{: .tip }
**Long Backlogs**: A long reward history may need to be claimed in smaller ranges across several transactions. The dashboard currently uses the latest completed batch and does not split the history automatically. If a claim exceeds the current gas limit, or the website is unavailable, follow the claiming steps in the [Emergency Exit Guide]({% link guides/emergency-exit.md %}).
