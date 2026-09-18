# TheFatCat Protocol Documentation

[English](README.md) | [简体中文](README.zh.md)

Official developer and protocol documentation repository for [TheFatCat](https://thefatcat.fun) — a decentralized trading-tax routing protocol engineered with autonomous hydrodynamic damping and $O(1)$ closed-form seniority weighting on BNB Chain.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Documentation](https://img.shields.io/badge/Docs-Live-success.svg)](https://thefatcatofficial.github.io/TheFatCat-docs/)
[![Network: BNB Chain](https://img.shields.io/badge/Network-BNB%20Chain-F0B90B.svg)](https://bscscan.com)

---

## Overview

TheFatCat restructures traditional meme token tax reflections into an unprivileged, physics-inspired reservoir system. Instead of directly dumping swap taxes onto stakers, funds are gathered in **The Belly** and released smoothly via discrete exponential damping ($\alpha \approx 4.76\%$ per 8-hour meal), converting transient market volatility into persistent staker inventory.

### Key Architectural Features:
- **The Belly**: First-order exponential damping reservoir with window-capped outflows and zero administrative withdrawal or sweep paths.
- **$O(1)$ Seniority Ledger**: Evaluates seniority weights across cohorts in constant gas using a 22-slot circular graduation ring buffer.
- **Sovereign Multi-Asset Diets**: Stakers independently select their reward asset (BNB, tokenized equities/bStocks, post-graduation FATCAT, or future governance-approved tokens) with decoupled accounting and execution.
- **Seniority Certificates (ERC-721 Roadmap)**: Upcoming credential feature allowing exiting stakers to permanently imprint achieved seniority notches (1–22) into on-chain SVG certificates by burning 100,000 FATCAT to `0x...dEaD`.
- **Strict Non-Custodial Architecture**: Zero administrative withdrawal or balance sweep functions, timelocked router activation, and unconditionally unpausable staker principal redemptions.

---

## Documentation Structure

The documentation is organized into five primary sections:

1. **Overview & Philosophy**: Architectural background, the triple dilemma of pass-through reflections, and protocol topology.
2. **User Guides**: Step-by-step guides for staking, position management, diet selection, seniority certificate roadmap overview, and emergency exits via BscScan.
3. **Core Mechanics**: Deep dives into the Belly's hydrodynamic release formulas, the 22-slot graduation ring, batch procurement, and the 4% tax distribution model.
4. **Security & Governance**: Non-custodial custody invariants, emergency pause scope, integer floor solvency proofs ($\sum r_i \le R$), and on-chain monitoring.
5. **Reference & FAQ**: Verified smart contracts schedule, frequently asked questions, whitepaper downloads, and legal disclaimers.

---

## Local Development

Follow these instructions to run and preview the documentation site locally:

### Prerequisites
- Ruby 3.1+
- Bundler (`gem install bundler`)

### Running Locally
```bash
# Clone the repository
git clone https://github.com/TheFatCatOfficial/TheFatCat-docs.git
cd TheFatCat-docs

# Install dependencies
bundle install

# Run the local development server
bundle exec jekyll serve
```

The documentation will be available locally at `http://localhost:4000/TheFatCat-docs/`.

---

## Security & Responsible Disclosure

We prioritize smart contract security and protocol integrity. If you discover a vulnerability or security issue, please submit it privately through our GitHub Security Advisories channel:

- **Security Reporting**: [Report a Vulnerability](https://github.com/TheFatCatOfficial/TheFatCat-docs/security/advisories/new)

---

## License

All documentation content and diagrams in this repository are licensed under the [MIT License](LICENSE).
