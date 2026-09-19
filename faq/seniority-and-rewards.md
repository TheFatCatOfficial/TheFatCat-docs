---
layout: default
title: Seniority & Diets FAQ
parent: FAQ & Limitations
nav_order: 2
---

# Seniority & Diets FAQ

---

## 1. Why are there zero reward emissions during the first 7 days?
During the initial 21 intervals (approx. 7 days at 8-hour cadence), the protocol runs a fair-launch **Seniority Ramp Period**. Trading volume accumulates in The Belly, but reward emissions are paused so that all early stakers climb simultaneously from Notch 1 to Notch 22. This eliminates unfair early-block skimming and ensures long-term stakers establish full weight before the first meal is distributed.

---

## 2. If I change my Diet, does my seniority notch reset?
**No.** Your seniority notch is tied to your position's tenure in the pool, not your choice of asset. Changing your diet takes effect at the next meal boundary and preserves 100% of your accumulated seniority notch ($c_i$).

---

## 3. How do I claim rewards, and how does native BNB work?
You can call `claim()` at any time to claim any realized diet tokens. For stakers who selected BNB as their Diet, calling `claimNative()` automatically unwraps WBNB into native BNB in a single atomic transaction without extra manual wrapping steps.

---

## 4. What is a Seniority Certificate, and when will it launch?
A [Seniority Certificate]({% link guides/seniority-certificates.md %}) is an upcoming on-chain ERC-721 credential planned for activation in a subsequent protocol release following launch stabilization. In upcoming updates, exiting stakers will have the option to burn FATCAT to mint a permanent on-chain SVG certificate capturing their achieved seniority notch (1–22). Further mechanics and parameters will be announced prior to rollout.
