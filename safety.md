---
layout: default
title: Security & Governance
nav_order: 7
has_children: true
---

# Security & Governance Architecture

An exhaustive overview of TheFatCat's non-custodial custody invariants, on-chain solvency proofs, vulnerability post-mortems, and active operational monitoring.

---

## Security Index

- **[Custody & Solvency Proofs]({% link safety/custody.md %})**: Unprivileged vaults, zero sweep/rescue functions, and the non-negative dust theorem ($\sum r_i \le R$).
- **[Audits & Hardening Post-Mortems]({% link safety/audits-and-hardening.md %})**: Detailed post-mortems of three critical accounting faults and race conditions identified and hardened via PocAudit regression test suites.
- **[Operational Monitoring]({% link safety/monitoring.md %})**: Upstream tax processor metric tracking, Guardian roles, and emergency response procedures.
- **[Risks & Launch Status]({% link safety/risks-and-status.md %})**: Material protocol dependencies, oracle trust models, and launch milestones.
