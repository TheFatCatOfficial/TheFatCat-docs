---
layout: default
title: State Machine & Intervals
parent: System Topology
nav_order: 2
---

# Temporal State Machine & Meal Cadence

TheFatCat advances through deterministic discrete intervals called **Meals** via the [`IntervalController`]({% link contracts.md %}):

```
Interval m-1              Interval m              Interval m+1
[  Active Meal  ] ───► [  Active Meal  ] ───► [  Active Meal  ]
                      ▲                      ▲
                  advance()              advance()
                (Cadence: ≥ 8h)        (Cadence: ≥ 8h)
```

---

## 1. Cadence & Permissionless Advancement
- An interval may be closed once at least **8 hours** have elapsed since the previous closing ($\Delta t \ge 8\text{h}$).
- Anyone—automated keeper bots, community members, or stakers—may invoke `advance()` without administrative keys. You can run these steps yourself; see [Help Keep the Protocol Running]({% link guides/community-keeper.md %}).

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
