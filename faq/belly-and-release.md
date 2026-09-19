---
layout: default
title: The Belly & Emission FAQ
parent: FAQ & Limitations
nav_order: 3
---

# The Belly & Dynamic Emission FAQ

---

## 1. Why doesn't The Belly payout match the exact trading fees from the last 8 hours?
The Belly operates as an **exponential damping reservoir**, not a direct pass-through pipe. Each meal releases a proportional slice of its net unreserved balance ($\approx 4.76\%$), not the raw fees of that specific interval. Spikes in volume are absorbed and smoothed across weeks, ensuring payments continue even when trading enters quiet periods.

---

## 2. Why is The Belly balance reading zero early on?
On BNB Chain, Flap's upstream tax processor accumulates FATCAT tax tokens and liquidates them for WBNB only when the liquidation threshold (~400,000 FATCAT) is crossed and an eligible sell trade occurs. Before the first threshold liquidation, the on-chain vault reads zero while fees accrue upstream. This is an expected batch-processing characteristic, not an anomaly.

---

## 3. What is the 7-Window outflow defense?
Even if the authorized `ExecutionRouter` were compromised by an unforeseen vulnerability, The Belly’s hardcoded outflow allowance throttles any potential draining:
- Max per-window draw: $\le 16/168 \approx 9.5238\%$.
- Draining 50% of the reservoir requires at least **7 full window intervals** (48 to 56 hours), ensuring ample reaction time for protocol governance or the Guardian to pause anomalies.
