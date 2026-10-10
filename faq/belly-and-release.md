---
layout: default
title: The Belly & Emission FAQ
parent: FAQ & Limitations
nav_order: 3
---

# The Belly & Dynamic Emission FAQ

---

## 1. Why doesn't The Belly payout match the exact trading fees from the last 8 hours? Why is the allocation 1/21 (~4.76%)?
The Belly allocates from its accumulated unreserved balance:
- **Why 1/21:** At the standard eight-hour cadence, the allocation fraction is $8/168 = 1/21 \approx 4.76\%$. A seven-day inflow buffer is an ideal steady-state model, subject to constant inflows and regular allocation and execution.
- **Smoothing:** Existing reserves can fund later meals when trading slows. The reservoir cannot create income or guarantee continuing payments.
- **Bounded Time-Proration**: A successful advance allocates from unreserved funds in proportion to eligible elapsed time, counting at most 16 hours and using 168 hours as the denominator. It advances one meal and restarts its timer at the current timestamp; longer delays do not backfill all missed meals or all elapsed hours.

---

## 2. Why is The Belly balance reading zero early on?
After graduation, Flap accumulates FATCAT tax tokens and liquidates them into QQQB when the deployed threshold and sell conditions are met. QQQB then awaits a protected conversion through USDT/WBNB; a successful conversion funds Belly through the fixed BNB receiver in the same transaction. A zero Belly inflow can therefore reflect upstream batching or unmet conversion conditions. Waiting QQQB is not WBNB already held by Belly.

---

## 3. Why is there an eight-hour outflow cap?
To limit concentrated releases of funds accumulated during settlement delays, The Belly caps actual outflows within each eight-hour window. Initially, the cap is $16/168 \approx 9.5238\%$ of the total WBNB balance at window opening, rounded down.

This is a standing safety ceiling that applies to all actual Belly outflows, not a fixed payout percentage every eight hours. Normal meals settle their allocated budgets. When exceptional conditions delay settlement of allocated rewards, pending funds can accumulate, and concentrated outflows after settlement resumes may reach the cap. Settlements exceeding the window's remaining allowance must wait for a later window and still meet settlement conditions. New deposits do not raise the current allowance, and claims of settled rewards do not consume it. See [Belly's outflow cap]({% link protocol/belly.md %}).
