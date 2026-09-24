---
layout: default
title: Staking & Positions FAQ
parent: FAQ & Limitations
nav_order: 1
---

# Staking & Positions FAQ

---

## 1. Why is there no published APY or APR?
Because TheFatCat is an authentic decentralized trading tax routing protocol, not an inflationary ponzi or lending protocol. Rewards depend entirely on actual trading volume, the current Belly balance, active staker weights, and individual diet choices. Any fixed yield number would be an artificial marketing fabrication.

---

## 2. What happens if I redeem my principal?
You may call `redeem()` at any block to withdraw 100% of your principal. There is zero exit fee or lockup penalty. The only trade-off is that redeeming forfeits the single currently open interval and ends that position's seniority. Any rewards settled in previous intervals remain permanently yours to claim in the distributor.

---

## 3. Why can't positions be merged or added to?
Every stake creates an isolated position with its own independent seniority clock. Allowing capital to be appended to an existing mature position would enable **Seniority Laundering**—a whale could open a tiny position, wait 7 days to reach Notch 22, and then dump massive capital into it to instantly receive $22\times$ privilege without waiting through the ramp period. To stake additional tokens, simply open a new position. A single wallet can hold and manage multiple positions with zero friction.

---

## 4. What is the minimum staking threshold?
The protocol enforces a 100,000 FATCAT floor per position. This prevents dust spamming and protects the gas efficiency of on-chain state accounting.
