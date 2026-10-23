# TheFatCat User Documentation

[English](README.md) | [简体中文](README.zh.md)

Official user documentation for [TheFatCat](https://thefatcat.fun), a trading-tax routing and staking protocol on BNB Chain.

[![Documentation](https://img.shields.io/badge/Docs-Live%20Website-success.svg?style=for-the-badge&logo=gitbook&logoColor=white)](https://thefatcatofficial.github.io/TheFatCat-docs/)
[![Main Website](https://img.shields.io/badge/Web-thefatcat.fun-0e3b32.svg?style=for-the-badge)](https://thefatcat.fun)
[![Network: BNB Chain](https://img.shields.io/badge/Network-BNB%20Chain-F0B90B.svg?style=for-the-badge&logo=binance&logoColor=white)](https://bscscan.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> 📖 **Live Documentation Portal**: Access the official online documentation at **[https://thefatcatofficial.github.io/TheFatCat-docs/](https://thefatcatofficial.github.io/TheFatCat-docs/)**.

This public documentation repository does not retain Git history; each release force-overwrites `main` with a fresh snapshot.

---

## Online Documentation Directory

Browse the protocol and user guides:

| Category | Description | Live Links |
|:---|:---|:---|
| **Overview & Philosophy** | Background, reflection token pitfalls, and system topology | [Background](https://thefatcatofficial.github.io/TheFatCat-docs/background.html) • [System Topology](https://thefatcatofficial.github.io/TheFatCat-docs/topology.html) |
| **User Guides** | Staking, diet selection, certificates and emergency exits | [Staking & Positions](https://thefatcatofficial.github.io/TheFatCat-docs/guides/staking.html) • [Diets & Claiming](https://thefatcatofficial.github.io/TheFatCat-docs/guides/diets-and-claiming.html) • [Time-Seniority Certificates](https://thefatcatofficial.github.io/TheFatCat-docs/guides/seniority-certificates.html) • [Emergency Exit Guide](https://thefatcatofficial.github.io/TheFatCat-docs/guides/emergency-exit.html) |
| **Core Mechanics** | Reservoir allocation, seniority, ordered settlement and tax routing | [Belly Reserve & Release](https://thefatcatofficial.github.io/TheFatCat-docs/protocol/belly.html) • [Meals & Seniority](https://thefatcatofficial.github.io/TheFatCat-docs/protocol/meals-and-seniority.html) • [Procurement & Settlement](https://thefatcatofficial.github.io/TheFatCat-docs/protocol/execution.html) • [Tax Routing & Fees](https://thefatcatofficial.github.io/TheFatCat-docs/protocol/fees.html) |
| **Security & Governance** | Custody boundaries, rounding limits, monitoring measures and risks | [Custody & Accounting Boundaries](https://thefatcatofficial.github.io/TheFatCat-docs/safety/custody.html) • [Monitoring & Incident Response](https://thefatcatofficial.github.io/TheFatCat-docs/safety/monitoring.html) • [Risks & Operating Conditions](https://thefatcatofficial.github.io/TheFatCat-docs/safety/risks-and-status.html) • [Core Contracts](https://thefatcatofficial.github.io/TheFatCat-docs/deployment.html) |
| **Reference** | FAQ and official links | [FAQ](https://thefatcatofficial.github.io/TheFatCat-docs/faq.html) • [Official Links](https://thefatcatofficial.github.io/TheFatCat-docs/links.html) |

Confirm the network, deployed addresses and verified source against the [Core Contracts](https://thefatcatofficial.github.io/TheFatCat-docs/deployment.html) page before interacting.

---

## Protocol Mechanics

- **The Belly**: Reserves reward funds and caps outflow at $16/168$ of the window-opening balance per eight-hour window. It has no administrative withdrawal or sweep function.
- **Position Seniority**: Each position grows from Notch 1 to Notch 22 through completed active meals; its weight is principal × seniority multiplier × the diet asset's incentive multiplier.
- **Reward Diets**: Positions choose from the enabled on-chain menu. Entitlement accounting is separate from reward purchases; globally ordered settlement can delay newer meals.
- **Time-Seniority Certificates**: Planned for release when the protocol has matured. Users with staking positions will be able to burn `$FATCAT` to mint them; further details will be announced later.
- **Custody Boundaries**: Core contracts have no administrative sweep functions, and principal redemption bypasses pause. Upstream revenue contracts have distinct upgrade and emergency recovery powers; see [Custody Boundaries](https://thefatcatofficial.github.io/TheFatCat-docs/safety/custody.html).

---

## Security & Responsible Disclosure

Submit vulnerability details privately through GitHub Security Advisories:

- **Security Reporting**: [Report a Vulnerability](https://github.com/TheFatCatOfficial/TheFatCat-docs/security/advisories/new)

---

## License

All documentation content and diagrams in this repository are licensed under the [MIT License](LICENSE).
