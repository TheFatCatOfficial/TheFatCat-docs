# TheFatCat Protocol Documentation

[English](README.md) | [简体中文](README.zh.md)

Official developer and protocol documentation repository for [TheFatCat](https://thefatcat.fun) — a decentralized trading-tax routing protocol engineered with autonomous hydrodynamic damping and $O(1)$ closed-form seniority weighting on BNB Chain.

[![Documentation](https://img.shields.io/badge/Docs-Live%20Website-success.svg?style=for-the-badge&logo=gitbook&logoColor=white)](https://thefatcatofficial.github.io/TheFatCat-docs/)
[![Main Website](https://img.shields.io/badge/Web-thefatcat.fun-0e3b32.svg?style=for-the-badge)](https://thefatcat.fun)
[![Network: BNB Chain](https://img.shields.io/badge/Network-BNB%20Chain-F0B90B.svg?style=for-the-badge&logo=binance&logoColor=white)](https://bscscan.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> 📖 **Live Documentation Portal**: Access the official online documentation at **[https://thefatcatofficial.github.io/TheFatCat-docs/](https://thefatcatofficial.github.io/TheFatCat-docs/)**.

---

## Online Documentation Directory

Browse the live documentation directly across our core architectural pillars:

| Category | Description | Live Links |
|:---|:---|:---|
| **Overview & Philosophy** | Background, reflection token pitfalls, and system topology | [Background](https://thefatcatofficial.github.io/TheFatCat-docs/background.html) • [System Topology](https://thefatcatofficial.github.io/TheFatCat-docs/topology.html) |
| **User Guides** | Staking rules, 100k FATCAT floor, diet selection, Seniority Certificates, and emergency exits | [Staking Guide](https://thefatcatofficial.github.io/TheFatCat-docs/guides/staking.html) • [Diets & Claiming](https://thefatcatofficial.github.io/TheFatCat-docs/guides/diets-and-claiming.html) • [Seniority Certificates](https://thefatcatofficial.github.io/TheFatCat-docs/guides/seniority-certificates.html) • [Emergency Exit](https://thefatcatofficial.github.io/TheFatCat-docs/guides/emergency-exit.html) |
| **Core Mechanics** | Hydrodynamic damping release formulas, 22-slot graduation ring, batch execution, and 4% tax distribution | [The Belly](https://thefatcatofficial.github.io/TheFatCat-docs/protocol/belly.html) • [Meals & Seniority](https://thefatcatofficial.github.io/TheFatCat-docs/protocol/meals-and-seniority.html) • [Batch Execution](https://thefatcatofficial.github.io/TheFatCat-docs/protocol/execution.html) • [Tax Routing](https://thefatcatofficial.github.io/TheFatCat-docs/protocol/fees.html) |
| **Security & Governance** | Custody proofs, integer floor solvency ($\sum r_i \le R$), monitoring scripts, and launch status | [Custody & Solvency](https://thefatcatofficial.github.io/TheFatCat-docs/safety/custody.html) • [Monitoring](https://thefatcatofficial.github.io/TheFatCat-docs/safety/monitoring.html) • [Risks & Status](https://thefatcatofficial.github.io/TheFatCat-docs/safety/risks-and-status.html) |
| **Contracts & Reference** | Canonical production contracts schedule, FAQ, whitepaper downloads, and official links | [Verified Contracts](https://thefatcatofficial.github.io/TheFatCat-docs/contracts.html) • [FAQ](https://thefatcatofficial.github.io/TheFatCat-docs/faq.html) • [Whitepaper](https://thefatcatofficial.github.io/TheFatCat-docs/whitepaper.html) • [Official Links](https://thefatcatofficial.github.io/TheFatCat-docs/links.html) |

---

## Architectural Highlights

- **The Belly**: First-order exponential damping reservoir with window-capped outflows ($\le 16/168$ per window) and zero administrative withdrawal or sweep paths.
- **$O(1)$ Seniority Ledger**: Evaluates seniority weights across cohorts in constant gas using a 22-slot circular graduation ring buffer.
- **Sovereign Multi-Asset Diets**: Stakers independently select their reward asset (BNB, tokenized equities/bStocks, post-graduation FATCAT) with decoupled accounting and execution.
- **Seniority Certificates (ERC-721)**: Genesis-deployed credential token allowing exiting mature stakers to permanently imprint achieved seniority notches (1–22) into on-chain SVG certificates by burning 100,000 FATCAT (`MAX_SUPPLY = 10,000`, 21-day cold-start lock before minting opens).
- **Strict Non-Custodial Architecture**: Zero administrative balance sweep functions, timelocked router activation, and unconditionally unpausable staker principal redemptions (`redeem()` deliberately bypasses pause).

---

## Security & Responsible Disclosure

We prioritize smart contract security and protocol integrity. If you discover a vulnerability or security issue, please submit it privately through our GitHub Security Advisories channel:

- **Security Reporting**: [Report a Vulnerability](https://github.com/TheFatCatOfficial/TheFatCat-docs/security/advisories/new)

---

## License

All documentation content and diagrams in this repository are licensed under the [MIT License](LICENSE).
