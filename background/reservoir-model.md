---
layout: default
title: The Reservoir Model
parent: Background & Philosophy
nav_order: 3
---

# The Reservoir Philosophy: Turning Flow into Stock

TheFatCat solves traditional dividend vulnerabilities by replacing the pass-through pipe with a physics-inspired, unprivileged reservoir: **The Belly**.

![Protocol Topology & Capital Flow]({{ '/assets/images/fig1-topology.svg' | relative_url }}?v=20260923p6)

---

## 1. Exponential Damping & Discrete Release

The Belly never pays out a fixed lump sum or promised APY. Instead, upon each permissionless clock advance ($\Delta t \ge 8\text{ hours}$), it releases a fraction:

$$\text{Release} = \text{Unreserved Balance} \times \frac{\min(\Delta t, 16\text{h})}{168\text{h}}$$

For an on-time 8-hour meal, this is exactly $\frac{8}{168} = \frac{1}{21} \approx 4.7619\%$. Volume surges raise the reservoir's water level, which is then released smoothly across subsequent weeks.

### Theoretical Decay Trajectory

If trading volume completely ceases, the balance decays gracefully rather than dropping off a cliff:

| Days After Volume Ceases | Belly Balance Remaining |
|:---|---:|
| Day 1 | 86.4% |
| Day 3 | 64.5% |
| Day 7 (1 Week) | 35.9% |
| Day 14 (2 Weeks) | 12.9% |
| Day 30 (1 Month) | 1.24% |

Under ideal zero-inflow assumptions, the half-life is approximately **4.735 days**. It acts as a physical shock absorber: a quiet week is absorbed without starvation, while stakers are never lured with unsustainable promises.

---

## 2. Sovereign Multi-Asset Diets

Each staker chooses their preferred menu asset (BNB, tokenized equities/bStocks, post-graduation FATCAT, or future governance-approved tokens). The protocol locks quote budgets at meal boundaries and executes batch swaps separately via an execution router. Front-running, MEV sandwiching, and execution delays are mathematically decoupled from entitlement accounting.

---

## 3. Beyond the Reservoir: Introducing the Time Dimension

While The Belly solves volatility damping and Sovereign Diets ensure asset autonomy, TheFatCat goes one step further by establishing "Staked Time" as the core innovation variable governing reward distribution.

Explore the next chapter: **[The Power of Staked Time: Duration Weighting & The Time Variable]({% link background/time-weighting.md %})**.
