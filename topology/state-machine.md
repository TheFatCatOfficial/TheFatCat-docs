---
layout: default
title: State Machine & Intervals
parent: System Topology
nav_order: 2
---

# Temporal State Machine & Meal Cadence

TheFatCat advances through deterministic discrete intervals called **Meals** via the [`IntervalController`]({% link contracts.md %}):

<div class="tfc-diagram-frame">
  <div class="tfc-diagram-bar">
    <span class="tfc-diagram-tag">STATE MACHINE</span>
    <span class="tfc-diagram-title">Discrete Interval Transitions & Cadence</span>
  </div>
  <pre class="tfc-diagram-content"><code>Interval m-1              Interval m              Interval m+1
[  Active Meal  ] ───► [  Active Meal  ] ───► [  Active Meal  ]
                      ▲                      ▲
                  advance()              advance()
                (Cadence: ≥ 8h)        (Cadence: ≥ 8h)</code></pre>
</div>

---

## 1. Cadence & Permissionless Advancement
- An interval may be closed once at least **8 hours** have elapsed since the previous closing ($\Delta t \ge 8\text{h}$).
- **Permissionless Advance & Official Fallback**: Anyone may invoke `advance()` without administrative keys as soon as it is due; the official fallback keeper mechanism also steps in automatically when needed to ensure the interval clock moves forward without delay.
- **Perpetual Progression & Zero-Maintenance Participation**: Based on the dual guarantee of **lazy decentralization** and the **official fallback keeper mechanism**, the protocol advances perpetually in theory. Therefore, users who only wish to stake FATCAT and harvest their Diet yields **do not need to participate in protocol maintenance at all**—intervals and reward allocations update seamlessly, and only community keepers seeking maintenance bounties need to trigger keeper calls (see [Decentralized Maintenance]({% link guides/community-keeper.md %})).

---

## 2. Boundary Weight Snapshotting
At the exact atomic instant when interval $m$ advances:
- Active staker weights for each diet asset ($W_{\text{open}}(a, m)$) are permanently locked.
- No retrospective weight adjustments are possible.

---

## 3. 22-Slot Circular Graduation Ring
- The 22-slot circular buffer rotates forward by one notch.
- Maturing cohorts graduate from the climbing registry into settled cohorts in $O(1)$ constant time, without iterating through staker addresses.

---

## 4. Damped Quota Release
- The Belly calculates its release quota ($1/21$ of net unreserved balance for a standard 8-hour meal).
- Quote funds are transferred directly to the `ExecutionRouter` for batch market fulfillment.
