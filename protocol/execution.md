---
title: Allocation and execution
parent: Protocol
nav_order: 3
---

# Allocation and execution

Accounting and market execution are separate.

1. A meal determines how much quote asset each diet receives.
2. That amount waits in a per-asset execution pot.
3. A purchase occurs only when its minimum size and safety checks pass.
4. The purchased asset is allocated back to the meals that funded it.

This separation keeps entitlement fixed even when market conditions delay a
purchase. A delayed execution cannot rewrite who was eligible when the quote
asset was allocated.

Routes use bounded order sizes, fresh price data and minimum-output checks. If a
route remains unusable beyond its allowed window, the planned fallback is the
pool quote asset rather than an unannounced substitute.

The initial reward menu is not final. FATCAT is the default diet; any additional
asset remains unavailable until its complete route has been tested on the live
network.
