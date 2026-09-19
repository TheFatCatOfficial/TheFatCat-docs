---
title: Introduction
layout: default
nav_order: 1
---

# TheFatCat Documentation

Welcome to the official developer and protocol documentation for **TheFatCat** — a decentralized trading-tax routing protocol engineered with autonomous hydrodynamic damping and $O(1)$ closed-form seniority weighting on BNB Chain.

{: .warning }
TheFatCat is currently in pre-launch status. Contract addresses, deployment hashes, and transaction links will be populated upon mainnet genesis and on-chain verification.

---

## Architectural Pillars

TheFatCat restructures traditional pass-through meme token tax plumbing into an unprivileged, physics-inspired reservoir:

1. **The Belly (Hydrodynamic Damping)**: Trading taxes accumulate in an unprivileged vault that acts as a first-order exponential damping reservoir. Instead of dumping fees instantly on stakers, funds are released smoothly at $\alpha = 8/168 \approx 4.7619\%$ per 8-hour meal cadence, converting transient market volatility into persistent inventory.
2. **Sovereign Multi-Asset Diets**: Each staker chooses their preferred payout asset (BNB, tokenized equities/bStocks, post-graduation FATCAT, or future governance-approved tokens). Allocation is decoupled from execution: rewards are algebraically locked at interval boundaries, eliminating sandwich attacks and front-running.
3. **Linear Capital with Seniority Weighting**: Staking weight scales strictly linearly with capital above the 100,000 FATCAT threshold ($p_i \times c_i$). Seniority notches climb additively ($+1$ per active 8-hour meal) up to a hard cap of 22 ($22\times$ weight), mathematically favoring time commitment over flash-capital predatory farming.
4. **Seniority Certificates (ERC-721)**: Deployed at genesis, exiting mature stakers may burn 100,000 FATCAT to imprint their achieved seniority notch (1–22) into an immutable on-chain SVG certificate (hard-capped at 10,000 tokens, 21-day cold-start lock before minting opens).

---

## Documentation Navigation

Explore the documentation across five key pillars:

### [1. Overview]({% link background.md %})
Understand the structural flaws of traditional reflection tokens and why TheFatCat was designed as a physical reservoir:
- [Background & Philosophy]({% link background.md %}): From pass-through pipes to hydrodynamic damping.
- [System Topology]({% link topology.md %}): Full capital flow diagram and protocol state transitions.

### [2. User Guides]({% link guides.md %})
Step-by-step operational guides for stakers and participants:
- [Staking & Positions]({% link guides/staking.md %}): Opening positions, principal thresholds, and isolated position rules.
- [Diets & Claiming Rewards]({% link guides/diets-and-claiming.md %}): Selecting reward assets, multi-batch claiming, and native BNB auto-unwrapping.
- [Seniority Certificates (ERC-721)]({% link guides/seniority-certificates.md %}): On-chain credential tokens, deflationary burn mechanics, and multiplier inheritance.
- [Emergency Exit (Without Front-End)]({% link guides/emergency-exit.md %}): How to safely redeem principal directly on BscScan if the front-end is down.

### [3. Core Mechanics]({% link protocol.md %})
Deep technical dives into the protocol's mathematical engines:
- [The Belly Hydrodynamics]({% link protocol/belly.md %}): Discrete release formulas, half-life decay, and 7-window rate limits.
- [Meals & Seniority Ladder]({% link protocol/meals-and-seniority.md %}): 22-slot circular graduation ring, $O(1)$ closed-form weight aggregation, and settled premium curves.
- [Batch Procurement & Execution]({% link protocol/execution.md %}): Decoupled accounting, TWAP slippage guards, and permissionless quote fallback.
- [Tax Routing & Model]({% link protocol/fees.md %}): The 4% dynamic trading tax, Flap platform fee, operations split, and 100-year tax span.

### [4. Security & Governance]({% link safety.md %})
Trust assumptions, role separation, and invariant verifications:
- [Custody & Solvency Proofs]({% link safety/custody.md %}): Integer floor truncation bounds, non-negative dust theorem ($\sum r_i \le R$), and zero admin sweeps.
- [Operational Monitoring]({% link safety/monitoring.md %}): Upstream processor state metric tracking and emergency response.
- [Risks & Launch Status]({% link safety/risks-and-status.md %}): Unfinished scopes, dependencies, and material disclosures.

### [5. Reference & FAQ]({% link contracts.md %})
- [Verified Contracts Matrix]({% link contracts.md %}): Canonical deployment addresses, bytecode verification, and immutable pointers.
- [FAQ & Known Limitations]({% link faq.md %}): Answers to high-frequency community and staker questions.
- [Whitepaper & Specifications]({% link whitepaper.md %}): Academic publication-grade PDF and DOCX downloads.
- [Notices & Disclaimers]({% link notices.md %}): Non-financial advice and legal boundaries.
- [Official Links & Directory]({% link links.md %}): Official portals, staking dApp, X (Twitter), Telegram, and ecosystem links.
