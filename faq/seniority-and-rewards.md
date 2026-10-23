---
layout: default
title: Seniority & Diets FAQ
parent: FAQ & Limitations
nav_order: 2
---

# Seniority & Diets FAQ

---

## 1. Why are no rewards allocated during the first 7 days after staking opens?
The seven-day accumulation period begins when staking opens:

1. **Seniority progression**: Successful advances still update seniority, but the accumulation period allocates no new rewards. Earlier activation can accumulate seniority sooner.
2. **Separate authorization clock**: Belly reward outflow authorization has its own seven-day delay, independent of the accumulation period.
3. **Revenue accumulation**: Successful upstream tax liquidation and QQQB conversion can fund Belly; inflow is not guaranteed to be continuous or reach a fixed amount.

---

## 2. If I change my Diet, does my seniority notch reset?
**No.** Your seniority notch is tied to your position's tenure in the pool, not your choice of asset. Changing your diet takes effect at the next meal boundary and preserves 100% of your accumulated seniority notch ($c_i$).

---

## 3. How do I claim rewards, and how does native BNB work?
You can claim rewards at any time through the dashboard. For stakers who selected BNB as their Diet, the protocol provides a native BNB withdrawal option that unwraps WBNB into native BNB in the same transaction, with no separate unwrapping step.

---

## 4. What is a Time-Seniority Certificate?

A [Time-Seniority Certificate]({% link guides/seniority-certificates.md %}) is planned for release when the protocol has matured. Details will be announced later.
