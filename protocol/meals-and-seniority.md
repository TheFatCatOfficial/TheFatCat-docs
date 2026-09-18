---
layout: default
title: Meals & Seniority Ladder
parent: Core Mechanics
nav_order: 2
---

# Meals & Seniority Ladder

How TheFatCat tracks millions of stakers across discrete 8-hour meals in $O(1)$ constant time using circular graduation ring buffers and RAY-scaled dual prefix accumulators.

---

## 1. The 22-Slot Graduation Ring Buffer

Iterating across $N$ stakers in an EVM transaction to increment seniority would hit the block gas limit almost immediately. TheFatCat eliminates looping entirely by decomposing stakers into cohorts using a **22-Slot Circular Graduation Ring**:

![22-Slot Graduation Ring Buffer Architecture]({{ '/assets/images/fig3-graduation-ring.svg' | relative_url }})

### Mathematical Partitioning
At any discrete interval $m$, stakers are algebraically partitioned into:
1. **Climbing Cohort** ($m - j_i < 21$): Positions that have not yet reached Notch 22.
2. **Settled Cohort** ($m - j_i \ge 21$): Positions that have completed 21 meals and capped at Notch 22.

The global active seniority weight $W(m)$ is computed via scalar variables in **$O(1)$ constant gas**:

$$W(m) = (1 + m) P_{\text{climb}} - J_{\text{climb}} + 22 P_{\text{settled}} + W_{\text{exiting}}$$

Where:
- $P_{\text{climb}} = \sum_{i \in \text{Climb}} p_i$ (Aggregate principal of climbing positions)
- $J_{\text{climb}} = \sum_{i \in \text{Climb}} (p_i \cdot j_i)$ (Weighted activation interval sum)
- $P_{\text{settled}} = \sum_{i \in \text{Settled}} p_i$ (Aggregate principal of settled positions)
- $W_{\text{exiting}}$: Residual weight from stakers who redeemed mid-meal.

When `advanceInterval()` executes, the slot buffer `graduatingPrincipal[m % 22]` is transferred from $P_{\text{climb}}$ to $P_{\text{settled}}$ in a single constant-gas operation.

---

## 2. Seniority Multipliers & Settled Premium Curves

Seniority adds weight monotonically; it never compounds. The graph below displays the linear ramp ladder alongside the steady-state premium curve:

![Seniority Multiplier & Settled Premium Curve]({{ '/assets/images/fig4-seniority-premium.svg' | relative_url }})

### Notches and Multipliers
- **Notch 1 ($1\times$)**: Newly active position ($j_i = m_{\text{stake}} + 1$).
- **Notches 2 through 21 ($2\times \dots 21\times$)**: Increments additively by $+1$ upon each completed active meal.
- **Notch 22 ($22\times$)**: Maximum cap reached after 21 completed active meals (7 days at minimum cadence).

### The Realized Relative Advantage ($22 / \bar{c}$)
A common misconception is that Notch 22 guarantees a perpetual $22\times$ earnings boost. In reality:

$$\text{Settled Relative Advantage} = \frac{22}{\bar{c}}, \quad \text{where } \bar{c} = \frac{\sum p_i c_i}{\sum p_i}$$

- **Lower Bound ($1\times$)**: In a mature pool where all stakers have reached Notch 22 ($\bar{c} = 22$), all participants earn strictly proportional to their capital.
- **Uniform Distribution Case**: If unfinished positions are uniformly distributed across notches ($\bar{c} = 11.5$), the settled premium is $22 / 11.5 \approx \mathbf{1.913\times}$.
- **Upper Bound ($22\times$)**: Measured only in the extreme edge case against a brand-new entry at Notch 1.

---

## 3. RAY-Scaled Dual Prefix Accumulators

To distribute rewards across varying seniority curves in $O(1)$ complexity, `SeniorityLedger` maintains two prefix accumulators scaled by $\text{RAY} = 10^{27}$:

$$A_{a, m} = A_{a, m-1} + (1 + m) \cdot \omega_{a, m}$$

$$B_{a, m} = B_{a, m-1} + \omega_{a, m}$$

Where $\omega_{a, m} = \lfloor \text{Share}_{a, m} \cdot \text{RAY} / W_{\text{open}}(a, m) \rfloor$.

For any climbing position $i$ that was active across intervals $[j_i, k]$, its cumulative quote entitlement is evaluated in $O(1)$ scalar arithmetic:

$$\text{Entitlement}_i = p_i \cdot \left[ (A_{a, k} - A_{a, j_i - 1}) - j_i \cdot (B_{a, k} - B_{a, j_i - 1}) \right] / \text{RAY}$$

Settled positions simply multiply principal by the prefix difference $\Delta B$ and the scalar 22.
