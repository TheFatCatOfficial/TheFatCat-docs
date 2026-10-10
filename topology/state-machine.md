---
layout: default
title: State Machine & Intervals
parent: System Topology
nav_order: 2
---

# Meal Advancement and Position States

TheFatCat moves forward through meal-by-meal accounting. Each time window is a **Meal**:

<div class="tfc-diagram-frame">
  <div class="tfc-diagram-bar">
    <span class="tfc-diagram-tag">MEALS</span>
    <span class="tfc-diagram-title">Meal Advancement and Position Activation</span>
  </div>
  <pre class="tfc-diagram-content"><code>Previous meal closes ──► Current meal runs ──► Next meal begins
                         At least eight hours  Successful advance transaction
New position deposits ─► No current-meal share ► Joins at Notch 1</code></pre>
</div>

---

## 1. Cadence and Participation

- A meal meets the time requirement after at least **8 hours**.
- **Anyone can help maintain it**: Public participants or official maintenance must still submit a successful transaction. Automation does not guarantee immediate or continuous availability.
- **How delays are handled**: Each successful advance closes one meal and starts the next at the current time. Allocation counts at most 16 hours. A 48-hour stop does not create six meals at once or allocate 48 hours of budget. See [FEED]({% link guides/community-keeper.md %}).

---

## 2. What Is Recorded at a Meal's Close?

The completed meal's shares use its eligible position weights. New positions and later diet changes do not retroactively change participation in that meal.

---

## 3. How Does Seniority Increase?

An ordinary new position activates at Notch 1 when the next meal begins. Each completed active meal then adds one notch, up to 22. Continued participation at the cap does not raise it further. See [Meals & Seniority]({% link protocol/meals-and-seniority.md %}).

---

## 4. Allocation and Receipt Are Different

Advancing a meal only determines the reward budget; funds remain in Belly. Purchases or fallback settlement must then complete before rewards become claimable. Settled rewards can be claimed separately, and principal redemption does not wait for these steps.
