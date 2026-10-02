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
- **Permissionless Advance**: Anyone may call `advance()` when due. Public callers or official maintenance must submit a successful transaction; automation cannot guarantee timing or availability.
- **Participation and Delays**: Stakers usually need not maintain the protocol themselves when other callers are doing so. Each successful advance closes one meal, opens the next at the current timestamp, and prorates allocation using at most 16 elapsed hours. A 48-hour delay does not create six meals or allocate 48 hours of budget. See [Decentralized Maintenance]({% link guides/community-keeper.md %}).

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
- `advance()` calls `Belly.sync()` and computes allocation from net unreserved balance: `base × min(elapsed, 16 hours) / 168 hours`, or 1/21 at the standard eight-hour cadence.
- The Controller records pending/outstanding quotas while funds stay in Belly. Only subsequent Router execution or fallback calls `Belly.release()` to move quote funds.
