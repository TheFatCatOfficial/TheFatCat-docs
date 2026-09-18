---
layout: default
title: Background & Philosophy
nav_order: 2
---

# Background & Philosophy

Why TheFatCat was designed this way, the mathematical flaws of traditional dividend tokens, and what the protocol deliberately refuses to promise.

---

## 1. The Triple Dilemma of Pass-Through Reflection Tokens

In the decentralized exchange ecosystem, thousands of "tax-reflection" or "dividend" tokens have attempted to route trading volume back to holders. The overwhelming majority rely on a simplistic pass-through pipe:
1. Deduct tax on DEX swaps;
2. Immediately liquidate accrued tokens for a configured reward token;
3. Push or stream rewards directly to holders proportionally to token balance.

This naive architecture suffers from three fatal structural vulnerabilities:

### Dilemma 1: The Upstream Single-Asset Monopoly
Traditional dividend contracts dictate a single, static reward token for the entire community (e.g. USDT or BNB). When market regimes rotate, users who want real-world assets (such as tokenized US stocks) or protocol tokens are forced to receive the single asset, incurring additional manual swap friction, slippage, and gas overhead.

### Dilemma 2: High-Frequency Volatility Dump & Zero Damping
Volume on decentralized bonding curves is inherently spiky: immense trading frenzy during rallies, followed by sudden dry spells. A pass-through pipe transmits this raw volatility directly into staker payouts. When trading halts, rewards collapse to absolute zero in hours. There is zero capital retention or cross-interval smoothing.

### Dilemma 3: The Flash-Loan Whale Hegemony
When rewards are distributed strictly proportional to capital ($w_i \propto p_i$), a predatory whale or flash-loan arbitrageur can inject massive liquidity right before a scheduled distribution, siphon the entire reward pot, and exit in the subsequent block. Long-term loyal holders suffer catastrophic dilution from participants who incurred zero duration risk.

---

## 2. The Reservoir Philosophy: Turning Flow into Stock

TheFatCat solves these dilemmas by replacing the pass-through pipe with a physics-inspired, unprivileged reservoir: **The Belly**.

![Protocol Topology & Capital Flow]({{ '/assets/images/fig1-topology.svg' | relative_url }})

### Principle 1: Exponential Damping
The Belly never pays out a fixed lump sum or promised APY. Instead, upon each permissionless clock advance ($\Delta t \ge 8\text{ hours}$), it releases a fraction:

$$\text{Release} = \text{Unreserved Balance} \times \frac{\min(\Delta t, 16\text{h})}{168\text{h}}$$

For an on-time 8-hour meal, this is exactly $\frac{8}{168} = \frac{1}{21} \approx 4.7619\%$. Volume surges raise the reservoir's water level, which is then released smoothly across subsequent weeks. If trading volume completely ceases, the balance decays gracefully:

| Days After Volume Ceases | Belly Balance Remaining |
|:---|---:|
| Day 1 | 86.4% |
| Day 3 | 64.1% |
| Day 7 (1 Week) | 36.2% |
| Day 14 (2 Weeks) | 13.1% |
| Day 30 (1 Month) | 1.2% |

Under ideal zero-inflow assumptions, the half-life is approximately **4.735 days**. It acts as a physical shock absorber: a quiet week is absorbed without starvation, while stakers are never lured with unsustainable promises.

### Principle 2: Sovereign Multi-Asset Diets
Each staker chooses their preferred menu asset (WBNB, tokenized equities/bStocks, or post-graduation FATCAT). The protocol locks quote budgets at meal boundaries and executes batch swaps separately via an execution router. Front-running, MEV sandwiching, and execution delays are mathematically decoupled from entitlement accounting.

### Principle 3: Time-Weighted Seniority
Staking weight is the product of capital and a discrete seniority notch:

$$\text{Weight} = p_i \times c_i(m), \quad c_i(m) \in [1, 22]$$

A position enters at notch 1 and climbs additively by $+1$ after each completed active meal. It takes 21 completed meals (exactly 7 days at minimum cadence) to achieve the maximum notch 22 ($22\times$ weight multiplier). Capital scales linearly above the 100,000 FATCAT floor, completely preventing flash-capital predatory dilution.

---

## 3. What TheFatCat Refuses to Promise (Non-Goals)

To ensure radical transparency, the protocol explicitly documents its non-goals:

- **Not a Fixed-Income Product**: No APY, APR, or guaranteed rate is published anywhere. Rewards derive solely from trading taxes and recognized balances.
- **Not a Capital Lockup**: Every staker may redeem their entire principal at any block. Redemptions deliberately bypass contract pause flags. Leaving forfeits only the single open meal.
- **Zero Superlinear Bias**: Large capital receives no quadratic or superlinear bonus. 10x capital receives exactly 10x weight at equal seniority.
- **Not a Perpetual Pension**: The Belly is a damping system, not a perpetuity. In prolonged zero-volume environments, releases asymptotically approach zero.
