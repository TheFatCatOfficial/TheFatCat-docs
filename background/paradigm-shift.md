---
layout: default
title: Paradigm Shift & Dilemmas
parent: Background & Philosophy
nav_order: 1
---

# The Triple Dilemma of Pass-Through Dividend Tokens

In the decentralized exchange (DEX) ecosystem, thousands of "tax-reflection" or "dividend" tokens have attempted to route trading volume back to holders. The overwhelming majority rely on a simplistic pass-through pipe:
1. Deduct tax on DEX swaps;
2. Immediately liquidate accrued tokens for a configured reward token;
3. Push or stream rewards directly to holders proportionally to token balance.

This naive architecture suffers from three fatal structural vulnerabilities:

---

## Dilemma 1: The Upstream Single-Asset Monopoly

Traditional dividend contracts dictate a single, static reward token for the entire community (e.g. USDT or BNB). When market regimes rotate, users who want real-world assets (such as tokenized US stocks) or protocol tokens are forced to receive the single asset, incurring additional manual swap friction, slippage, and gas overhead.

---

## Dilemma 2: High-Frequency Volatility Dump & Zero Damping

Volume on decentralized bonding curves is inherently spiky: immense trading frenzy during rallies, followed by sudden dry spells. A pass-through pipe transmits this raw volatility directly into staker payouts:
- During peak hours, payouts surge unsustainably.
- When trading halts, rewards collapse to absolute zero within hours.
- There is zero capital retention or cross-interval smoothing, leading to panic selling and liquidity death spirals.

---

## Dilemma 3: The Flash-Loan Whale Hegemony

When rewards are distributed strictly proportional to capital ($w_i \propto p_i$), a predatory whale or flash-loan arbitrageur can inject massive liquidity right before a scheduled distribution, siphon the entire reward pot, and exit in the subsequent block. Long-term loyal holders suffer catastrophic dilution from participants who incurred zero duration risk.
