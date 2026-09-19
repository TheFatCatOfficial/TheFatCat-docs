---
layout: default
title: Seniority & Diets FAQ
parent: FAQ & Limitations
nav_order: 2
---

# Seniority & Diets FAQ

---

## 1. Why are there zero reward emissions during the first 7 days?
During the first 7 days following deployment, the protocol enforces an on-chain **Dual-Gate Warmup Window**:
1. **Reward Emission Delay**: Protocol clock mechanics pin emissions to zero during launch week. Intervals advance and stakers climb notches (from Notch 1 toward Notch 22) on equal footing without early dividend dilution;
2. **Treasury Outflow Delay**: The Belly reservoir enforces an immutable 7-day timelock delay before authorizing the execution router to withdraw any capital;
3. **Reservoir Cushion**: All trading taxes generated during launch week flush continuously into The Belly with zero outflows, establishing deep backing before distributions begin.

---

## 2. If I change my Diet, does my seniority notch reset?
**No.** Your seniority notch is tied to your position's tenure in the pool, not your choice of asset. Changing your diet takes effect at the next meal boundary and preserves 100% of your accumulated seniority notch ($c_i$).

---

## 3. How do I claim rewards, and how does native BNB work?
You can call `claim()` at any time to claim any realized diet tokens. For stakers who selected BNB as their Diet, calling `claimNative()` automatically unwraps WBNB into native BNB in a single atomic transaction without extra manual wrapping steps.

---

## 4. What is a Seniority Certificate, and how does it work?
A [Seniority Certificate]({% link guides/seniority-certificates.md %}) is an on-chain ERC-721 credential deployed at genesis. When exiting a mature position, stakers can burn 100,000 FATCAT to permanently imprint their achieved seniority notch (1–22) into an immutable on-chain SVG certificate (`MAX_SUPPLY = 10,000`, 21-day cold-start lock before minting opens). The certificate can subsequently be attached when opening a new position to inherit the achieved seniority multiplier from day one.
