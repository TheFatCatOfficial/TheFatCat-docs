---
layout: default
title: Core Principles & Non-Goals
parent: Background & Philosophy
nav_order: 5
---

# Core Design Principles & Explicit Non-Goals

To uphold radical transparency and protect the interests of long-term participants, TheFatCat establishes three foundational design principles at the protocol level, alongside four explicit Non-Goals:

---

## Three Core Design Principles

### Principle 1: Physical Damping Reservoir Philosophy (The Belly)
Abandoning the fragile pass-through "stream-and-dump" pipes of traditional reflection tokens, TheFatCat introduces a first-order exponentially smoothed reserve pool (**The Belly**) governed by physical damping dynamics. It converts unpredictable on-chain trading surges into a smooth, controlled reservoir, decoupling discrete payouts (exactly $1/21$ released every on-time 8-hour meal) from the instantaneous tax volume of the preceding 8 hours, smoothing cross-cycle volatility without token inflation or false promises.

### Principle 2: Sovereign Capital & Diet Autonomy
Every participant retains absolute, inviolable custody over their staked principal. In the smart contract architecture, the redemption routine (`redeem()`) deliberately bypasses the emergency pause mechanism, guaranteeing that staker funds can never be held hostage by governance or protocol halts. Furthermore, breaking the single-asset monopoly of traditional reflection systems, each staking position may independently select its preferred settlement asset from the official diet menu (such as native BNB, tokenized US equities like bStocks, or post-graduation FATCAT).

### Principle 3: The Power of Staked Time — Introducing Duration as the Core Innovation Variable
In conventional DeFi, capital scale is almost the sole determinant: large capital enters and exits at will, instantly diluting existing stakers by sheer volume; while traditional vote-escrow (ve) models introduce duration, they do so by stripping users of principal liquidity for months or years.

TheFatCat innovatively establishes **"Staked Time"** as the protocol's core innovation variable:
- **Time as the sole non-capital weighting input**: A position starts with a baseline multiplier of $1.0\times$ and increases additively by $+1.0\times$ for each completed active meal, gracefully climbing across 21 meals (exactly 7 days under standard cadence) to the maximum $22.0\times$ ceiling;
- **Reconciling liquidity sovereignty with time defense**: Principal is 100% accessible at any time without lockup, but exiting immediately resets the accrued time multiplier to zero. Opportunistic short-term capital cannot instantly override seated stakers solely through capital volume—time serves as the loyal staker's most resilient yield moat;
- **Assetization of duration**: Upon exiting, mature positions can burn FATCAT to permanently crystallize their accumulated duration into an ERC-721 **Time-Seniority Certificate**, providing supply deflation for FATCAT and 5% secondary royalty accretion for The Belly.

---

## Explicit Protocol Non-Goals

---

## 1. Not a Fixed-Income Product
The protocol does not publish, promise, or model any APY, APR, or guaranteed rate of return. Yield derives strictly from secondary DEX trading taxes and verified on-chain reserve balances. In zero-volume market regimes, payouts faithfully reflect true economic reality.

---

## 2. Not a Capital Lockup (Unpausable Redeem)
Every staker maintains sovereign custody of their capital. At any arbitrary block, any staker may freely call `redeem()` to withdraw their entire principal. The redemption function deliberately bypasses the contract emergency pause flag, guaranteeing that stakers are never held hostage by governance or protocol halts. Leaving an active meal forfeits only that single unfinalized interval.

---

## 3. Rejection of Superlinear Scaling (Strict Capital Linearity)
The protocol respects the natural weight of capital scale while strictly preserving linear capital scaling, providing zero quadratic scaling or superlinear leverage:
- **Strict Capital Linearity**: Under identical time multipliers, $10\times$ principal receives exactly $10\times$ effective weight. Large capital receives its rightful proportional share, but gains no artificial scale-based multiplication;
- **Time Cannot Be Fabricated**: The protocol provides zero administrative backdoors to bypass duration requirements. New positions started from scratch must climb the 21-interval linear ramp; even when bootstrapping via a secondary-market **Time-Seniority Certificate (ERC-721)**, that certificate originated strictly from an earlier staker who spent genuine duration and burned tokens upon exit, and the resulting position remains strictly bound by linear capital weighting.

---

## 4. Rejection of the Perpetual Motion Myth
The Belly is a first-order exponential damping buffer, not an infinite printing press. It smooths volatility across intervals; it does not fabricate value out of thin air. In prolonged zero-volume environments, releases asymptotically decay toward zero.
