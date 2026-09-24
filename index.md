---
title: Introduction
layout: default
nav_order: 1
---

# TheFatCat Documentation

Welcome to the official developer and protocol documentation for **TheFatCat** — a decentralized trading-tax routing and yield distribution protocol on BNB Chain, implementing discrete first-order exponential smoothing and duration-seniority weighting. In addition to hydrodynamic fee smoothing, the protocol's output assets include tokenized stocks (bStocks) tracking the value of core real-world equities, enabling stakers to route their protocol yield directly into stock tokens without traditional brokerage accounts.

{: .warning }
TheFatCat is currently in pre-launch status. Contract addresses, deployment hashes, and transaction links will be populated upon mainnet genesis and on-chain verification.

---

## Architectural Pillars

TheFatCat not only fundamentally restructures the simple pass-through plumbing of traditional reflection tokens, but is also a protocol that combines an innovative time-weighting mechanism with high decentralization, establishing an unprivileged reservoir governed by physical conservation laws:

1. **The Belly (Inventory Reserve)**: Trading taxes accumulate in an unprivileged multi-token reservoir functioning as a discrete first-order exponential smoothing filter. Capital releases are rate-limited to a deterministic fraction $\alpha = 1/21 \approx 4.76\%$ per 8-hour meal cadence, converting transient order-flow spikes into persistent reward inventory.
2. **Sovereign Multi-Asset Diets**: Each staker independently designates an output settlement asset (native BNB, tokenized stocks (**bStocks**), or post-graduation FATCAT). Allocation accounting is decoupled from swap execution: reward claims are algebraically locked at discrete interval boundaries, confining sandwich and front-running exposure strictly to the time-weighted aggregate batch execution window.
3. **Entry Floor & Time-Seniority Ladder**: Opening a staking position requires a minimum deposit of 100,000 FATCAT (an immutable smart-contract threshold preventing dust spam). Staking weight scales strictly linearly with capital without whale leverage; duration multipliers climb additively ($+1.0\times$ per active 8-hour interval) across 21 meals up to a $22.0\times$ ceiling. Early unstaking immediately exits the seniority ladder, forfeiting unfinalized reward allocations for the active interval to remaining stakers.
4. **Time-Seniority Certificates (ERC-721)**: An on-chain credential standard assetizing realized duration upon position exit via FATCAT burns, designed to couple position closure with supply deflation and secondary royalty treasury routing (governed by the Protocol Roadmap).

---

## Documentation Navigation

Explore the documentation sections below:

### [1. Definitions & Notation]({% link definitions.md %})
Formal algebraic notation, variable index, dual-track terminology mapping, and core invariants:
- **[Formal Notation Table]({% link definitions/notation.md %})**: Canonical mathematical symbols, state variables, and dimension scopes.
- **[Dual-Track Terminology Mapping]({% link definitions/terminology.md %})**: Cultural metaphors mapped to smart contract components.
- **[Core Architectural Invariants]({% link definitions/invariants.md %})**: Formal proofs for principal isolation, rate-limited outflow, and solvency.

### [2. Background & Philosophy]({% link background.md %})
Understand the structural flaws of traditional reflection tokens and why TheFatCat was designed as a physical reservoir:
- [Paradigm Shift]({% link background/paradigm-shift.md %}): Escaping the high-FDV, low-float dilution trap.
- [Prior Art & Comparative Matrix]({% link background/prior-art.md %}): Comprehensive mechanism comparison against Curve, Pendle, and Synthetix.
- [The Belly Reservoir Model]({% link background/reservoir-model.md %}): Transforming transient fee flow into damped inventory.
- [Time-Weighting Model]({% link background/time-weighting.md %}): Staked time as the sole non-capital weighting variable.
- [Core Principles & Non-Goals]({% link background/principles.md %}): Architectural boundaries and sovereign invariants.

### [3. System Topology]({% link topology.md %})
Full capital flow diagram, state transitions, and execution pipelines:
- [Dual-Track Asset Flows]({% link topology/asset-flows.md %}): Trading tax capture, fixed conversion, and vault isolation.
- [State Machine & Intervals]({% link topology/state-machine.md %}): 8-hour meal clock cadences and state transitions.
- [Procurement & Claims Pipeline]({% link topology/claim-pipeline.md %}): TWAP-guarded batch execution and reward claims.

### [4. User Guides]({% link guides.md %})
Step-by-step operational guides for stakers and participants:
- [Staking & Positions]({% link guides/staking.md %}): Opening positions, principal thresholds, and isolated position rules.
- [Diets & Claiming Rewards]({% link guides/diets-and-claiming.md %}): Selecting reward assets, multi-batch claiming, and native BNB auto-unwrapping.
- [Time-Seniority Certificates]({% link guides/seniority-certificates.md %}): On-chain credential tokens assetizing duration via burning.
- [Decentralized Maintenance]({% link guides/community-keeper.md %}): Anyone can advance eligible maintenance, one-tx execution, and 0.1% WBNB conversion bounty.
- [Emergency Exit (Without Front-End)]({% link guides/emergency-exit.md %}): How to safely redeem principal directly on BscScan if the front-end is down.

### [5. Core Mechanics]({% link protocol.md %})
Deep technical dives into the protocol's mathematical engines:
- [The Belly Hydrodynamics]({% link protocol/belly.md %}): Discrete release formulas, half-life decay, and 7-window rate limits.
- [Meals & Seniority Ladder]({% link protocol/meals-and-seniority.md %}): 22-slot circular graduation ring, $O(1)$ closed-form weight aggregation, and settled premium curves.
- [Batch Procurement & Execution]({% link protocol/execution.md %}): Decoupled accounting, TWAP slippage guards, and permissionless quote fallback.
- [Tax Routing & Model]({% link protocol/fees.md %}): The 4% dynamic trading tax, Flap platform fee, operations split, and 100-year tax span.

### [6. Security & Governance]({% link safety.md %})
Trust assumptions, role separation, invariant verifications, and post-mortems:
- [Custody & Solvency Proofs]({% link safety/custody.md %}): Integer floor truncation bounds, non-negative dust theorem ($\sum r_i \le R$), and zero admin sweeps.
- [Audits & Hardening Post-Mortems]({% link safety/audits-and-hardening.md %}): Vulnerability post-mortems and formal defenses from PocAudit regression suites.
- [Operational Monitoring]({% link safety/monitoring.md %}): Upstream processor state metric tracking and emergency response.
- [Risks & Launch Status]({% link safety/risks-and-status.md %}): Unfinished scopes, dependencies, and material disclosures.

### [7. Reference & FAQ]({% link contracts.md %})
- [Verified Contracts Matrix]({% link contracts.md %}): Canonical deployment addresses, bytecode verification, and immutable pointers.
- [FAQ & Known Limitations]({% link faq.md %}): Answers to high-frequency community and staker questions.
- [Whitepaper & Specifications]({% link whitepaper.md %}): Academic publication-grade PDF and DOCX downloads.
- [Notices & Disclaimers]({% link notices.md %}): Non-financial advice and legal boundaries.
- [Official Links & Directory]({% link links.md %}): Official portals, staking dApp, X (Twitter), Telegram, and ecosystem links.

---

## Protocol Roadmap & Governance Disclosures

Features currently in active research, formal specification, or pending governance ratification are strictly segregated from the production core:
- **Secondary Market Certificate Royalties**: Contract hooks for capturing secondary marketplace trading fees on Time-Seniority ERC-721 certificates and routing proceeds back to The Belly inventory. Specification and parameter schedules will be ratified post-genesis.
