---
layout: default
title: The Belly & Emission FAQ
parent: FAQ & Limitations
nav_order: 3
---

# The Belly & Dynamic Emission FAQ

---

## 1. Why doesn't The Belly payout match the exact trading fees from the last 8 hours? Why is the allocation 1/21 (~4.76%)?
The Belly operates as an **exponential damping reservoir**, not a direct pass-through pipe:
- **Why 1/21:** The protocol benchmarks time against a natural week (7 days = 168 hours) with 3 meals/day (8 hours each), totaling exactly 21 meals per week. Each standard interval emits $8/168 = 1/21 \approx 4.76\%$ of net unreserved balance, ensuring the reservoir naturally maintains a steady-state buffer equal to one full week (21 meals) of fee inflows.
- **Volumetric Smoothing:** Spikes in trading volume are absorbed and smoothed across weeks, ensuring dividends continue even when trading enters quiet periods.
- **Permissionless Time Compensation:** The contract prorates emissions using exact elapsed seconds ($\text{base} \times \Delta t / 168\text{h}$). If an advance is delayed by keeper lag, stakers are credited for the full elapsed duration rather than penalized.

---

## 2. Why is The Belly balance reading zero early on?
On BNB Chain, Flap's upstream tax processor accumulates FATCAT tax tokens and liquidates them for WBNB only when the liquidation threshold (~400,000 FATCAT) is crossed and an eligible sell trade occurs. Before the first threshold liquidation, the on-chain vault reads zero while fees accrue upstream. This is an expected batch-processing characteristic, not an anomaly.

---

## 3. What is the 7-Window outflow defense?
Even if the authorized `ExecutionRouter` were compromised by an unforeseen vulnerability, The Belly’s hardcoded outflow allowance throttles any potential draining:
- Max per-window draw: $\le 16/168 \approx 9.5238\%$.
- Draining 50% of the reservoir requires at least **7 full window intervals** (48 to 56 hours), ensuring ample reaction time for protocol governance or the Guardian to pause anomalies.
