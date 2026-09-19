---
layout: default
title: Mathematical Architecture Abstract
parent: Whitepaper & Specs
nav_order: 2
---

# Mathematical & Theoretical Architecture Abstract

A concise theoretical summary of the mathematical breakthroughs in the TheFatCat whitepaper:

---

## 1. The Belly Exponential Damping Mechanics
Operates on a discrete permissionless clock cadence ($\Delta t \ge 8\text{h}$). Releases $\alpha = 8/168 = 1/21 \approx 4.7619\%$ of unreserved quote balance per interval, featuring an ideal zero-inflow model half-life of 4.735 days. Outflow rate is strictly bounded by a window allowance of $16/168 \approx 9.5238\%$, requiring 7 discrete window allowances (48–56 hours) to draw down 50%.

---

## 2. $O(1)$ Closed-Form Seniority Ledger
Linear algebra decomposition partitions stakers into Climbing ($m - j_i < 21$) and Settled ($m - j_i \ge 21$) cohorts, evaluating total active weight in $O(1)$ scalar arithmetic:

$$W(m) = (1 + m) P_{\text{climb}} - J_{\text{climb}} + 22 P_{\text{settled}} + W_{\text{exiting}}$$

Graduation is managed via a 22-slot circular ring buffer. Dual-prefix accumulators ($A_{a, m}, B_{a, m}$) scaled by $\text{RAY} = 10^{27}$ compute quote entitlements in $O(1)$ constant gas.

---

## 3. Sovereign Multi-Asset Diets Formula
Each position designates its preferred reward asset. Under ideal conditions, nominal quote budgets cancel out algebraically:

$$\text{Share}_{i, a} = Q_{\text{total}} \cdot \frac{w_i}{W_{\text{total}}}$$

---

## 4. Tested Solvency Invariants
Conservative integer floor division guarantees super-solvency:

$$\sum_{i=1}^N r_i \le R, \quad \Delta_{\text{dust}} = R - \sum_{i=1}^N r_i \ge 0$$

Dual liabilities (`liability[asset]` and `quoteLiability[asset]`) remain fully covered by physical contract balances.
