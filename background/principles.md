---
layout: default
title: Core Principles & Non-Goals
parent: Background & Philosophy
nav_order: 3
---

# What TheFatCat Refuses to Promise (Non-Goals)

To ensure radical transparency and alignment with long-term participants, TheFatCat explicitly documents what the protocol deliberately refuses to promise:

---

## 1. Not a Fixed-Income Product
The protocol does not publish, promise, or model any APY, APR, or guaranteed rate of return. Yield derives strictly from secondary DEX market trading taxes and verified on-chain reserve balances. In zero-volume market regimes, payouts reflect true economic reality.

---

## 2. Not a Capital Lockup (Unpausable Redeem)
Every staker maintains sovereign custody of their capital. Any staker may redeem their entire principal ($p_i$) at any arbitrary block. The `redeem()` function deliberately bypasses the contract emergency pause flag, guaranteeing that stakers are never held hostage by governance or protocol halts. Leaving an active meal forfeits only that single unfinalized interval.

---

## 3. Zero Superlinear Capital Privilege
Large capital receives zero quadratic bonuses, governance kickbacks, or superlinear scaling. Under identical seniority:
- $10\times$ principal receives exactly $10\times$ weight.
- A whale cannot jump the line or dilute existing participants without enduring the exact same 21-meal linear ramp.

---

## 4. Rejection of the Perpetual Motion Myth
The Belly is a first-order exponential damping buffer, not an infinite printing press. It smooths volatility across intervals; it does not fabricate value out of thin air. In prolonged zero-volume environments, releases asymptotically decay toward zero.
