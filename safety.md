---
title: Security & Governance
nav_order: 6
has_children: true
---

# Security & Governance Architecture

An exhaustive overview of TheFatCat's non-custodial custody invariants, dual multi-sig role separation, on-chain solvency proofs, and active operational monitoring.

---

## Security Index

- **[Dual Safe Architecture]({% link safety/dual-safe.md %})**: Physical separation between the 2-of-3 Governor Safe (protocol management) and 2-of-3 Ops Safe (pure financial receipt with zero admin privileges).
- **[Custody & Solvency Proofs]({% link safety/custody.md %})**: Unprivileged vaults, zero sweep/rescue functions, and the non-negative dust theorem ($\sum r_i \le R$).
- **[Operational Monitoring]({% link safety/monitoring.md %})**: Upstream tax processor tracking via `watch-processor.sh` and pause/unpause drills.
- **[Risks & Launch Status]({% link safety/risks-and-status.md %})**: Material protocol dependencies, oracle trust models, and launch milestones.
