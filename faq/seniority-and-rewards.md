---
layout: default
title: Seniority & Diets FAQ
parent: FAQ & Limitations
nav_order: 2
---

# Seniority & Diets FAQ

---

## 1. Why are there zero reward emissions during the first 7 days following staking open?
The first 7 days following staking open serve as the system's **Warmup Window**:
1. **Fair Start & Seniority Accumulation**: When staking opens (calling `openStaking()` under the hood to start the clock), the protocol establishes a 7-day warmup period. During this time, intervals and seniority notches advance normally (from Notch 1 upward), but dividends are not yet emitted, ensuring early stakers build up seniority on equal footing;
2. **Treasury Outflow Timelock**: The Belly reservoir enforces an independent 7-day governance delay before authorizing the procurement execution module to withdraw capital (the two gates operate on independent clocks and are not inherently synchronized);
3. **Accumulating Initial Dividend Backing**: During this initial week, trading taxes flow continuously into The Belly without outflows, establishing a deep buffer reserve before distributions begin.

---

## 2. If I change my Diet, does my seniority notch reset?
**No.** Your seniority notch is tied to your position's tenure in the pool, not your choice of asset. Changing your diet takes effect at the next meal boundary and preserves 100% of your accumulated seniority notch ($c_i$).

---

## 3. How do I claim rewards, and how does native BNB work?
You can claim rewards at any time through the dashboard. For stakers who selected BNB as their Diet, the protocol provides a native withdrawal method (calling `claimNative()` under the hood) that automatically unwraps WBNB into native BNB in a single transaction without extra manual wrapping steps.

---

## 4. What is a Seniority Certificate? Is it currently live?
A [Seniority Certificate]({% link guides/seniority-certificates.md %}) is an on-chain ERC-721 credential system designed to record stakers' accumulated tenure and honor. While its contracts have been deployed on-chain alongside the genesis protocol, the feature is scheduled for release in a future phase once the protocol matures. The official launch timeline, mechanics, and exact parameters will be announced at a later date.
