# TheFatCat User Documentation

[English](README.md) | [简体中文](https://thefatcatofficial.github.io/TheFatCat-docs/zh/)

Official user documentation for [TheFatCat](https://thefatcat.fun), a trading-tax routing and staking protocol on BNB Chain.

[![Documentation](https://img.shields.io/badge/Docs-Live%20Website-success.svg?style=for-the-badge&logo=gitbook&logoColor=white)](https://thefatcatofficial.github.io/TheFatCat-docs/)
[![Main Website](https://img.shields.io/badge/Web-thefatcat.fun-0e3b32.svg?style=for-the-badge)](https://thefatcat.fun)
[![Network: BNB Chain](https://img.shields.io/badge/Network-BNB%20Chain-F0B90B.svg?style=for-the-badge&logo=binance&logoColor=white)](https://bscscan.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> 📖 **Live Documentation Portal**: Access the official online documentation at **[https://thefatcatofficial.github.io/TheFatCat-docs/](https://thefatcatofficial.github.io/TheFatCat-docs/)**.

---

## Online Documentation Directory

Browse the protocol and user guides:

| Category | Description | Live Links |
|:---|:---|:---|
| **Overview & Philosophy** | Background, reflection token pitfalls, and system topology | [Background](https://thefatcatofficial.github.io/TheFatCat-docs/background.html) • [System Topology](https://thefatcatofficial.github.io/TheFatCat-docs/topology.html) |
| **User Guides** | Staking, diet selection, certificates and emergency exits | [Staking Guide](https://thefatcatofficial.github.io/TheFatCat-docs/guides/staking.html) • [Diets & Claiming](https://thefatcatofficial.github.io/TheFatCat-docs/guides/diets-and-claiming.html) • [Time-Seniority Certificates](https://thefatcatofficial.github.io/TheFatCat-docs/guides/seniority-certificates.html) • [Emergency Exit](https://thefatcatofficial.github.io/TheFatCat-docs/guides/emergency-exit.html) |
| **Core Mechanics** | Reservoir allocation, seniority, ordered settlement and tax routing | [The Belly](https://thefatcatofficial.github.io/TheFatCat-docs/protocol/belly.html) • [Meals & Seniority](https://thefatcatofficial.github.io/TheFatCat-docs/protocol/meals-and-seniority.html) • [Batch Execution](https://thefatcatofficial.github.io/TheFatCat-docs/protocol/execution.html) • [Tax Routing](https://thefatcatofficial.github.io/TheFatCat-docs/protocol/fees.html) |
| **Security & Governance** | Custody boundaries, rounding limits, monitoring measures and risks | [Custody & Accounting Boundaries](https://thefatcatofficial.github.io/TheFatCat-docs/safety/custody.html) • [Monitoring](https://thefatcatofficial.github.io/TheFatCat-docs/safety/monitoring.html) • [Risks & Operating Conditions](https://thefatcatofficial.github.io/TheFatCat-docs/safety/risks-and-status.html) |
| **Reference** | FAQ, whitepapers and official links | [FAQ](https://thefatcatofficial.github.io/TheFatCat-docs/faq.html) • [Whitepaper](https://thefatcatofficial.github.io/TheFatCat-docs/whitepaper.html) • [Official Links](https://thefatcatofficial.github.io/TheFatCat-docs/links.html) |

Confirm the network, deployed addresses and verified source against the official deployment record before interacting.

---

## Protocol Mechanics

- **The Belly**: Reserves reward funds and caps outflow at $16/168$ of the window-opening balance per eight-hour window. It has no administrative withdrawal or sweep function.
- **Position Seniority**: Each position grows from Notch 1 to Notch 22 through completed active meals; its principal and seniority determine allocation weight.
- **Reward Diets**: Positions choose from the enabled on-chain menu. Entitlement accounting is separate from reward purchases; globally ordered settlement can delay newer meals.
- **Time-Seniority Certificates**: Planned for release when the protocol has matured. Users with staking positions will be able to burn FATCAT to mint them; further details will be announced later.
- **Custody Boundaries**: Core contracts have no administrative sweep functions, and principal redemption bypasses pause. Upstream revenue contracts have distinct upgrade and emergency recovery powers; see [Custody Boundaries](https://thefatcatofficial.github.io/TheFatCat-docs/safety/custody.html).

---

## Security & Responsible Disclosure

Submit vulnerability details privately through GitHub Security Advisories:

- **Security Reporting**: [Report a Vulnerability](https://github.com/TheFatCatOfficial/TheFatCat-docs/security/advisories/new)

---

## License

All documentation content and diagrams in this repository are licensed under the [MIT License](LICENSE).


## Synchronize AI bundles

After editing Markdown pages, run `python3 scripts/build-llms.py`, then `python3 scripts/build-llms.py --check`. The publishing build checks that both AI bundles match their source pages.

After editing `tfc-ai.js` or `tfc-pjax.js`, run `python3 scripts/check-public-build.py --update-revision`. The build gate checks that the cache revision matches their content and rejects source maps, local paths and credential markers in website artifacts.

## Build and preview locally

Install Ruby 3.3, Bundler, Python 3 and Node.js 22 or newer, then run:

```sh
bundle install
python3 scripts/build-llms.py --check
python3 scripts/test_public_build.py
JEKYLL_ENV=production bundle exec jekyll build
python3 scripts/check-public-build.py _site
bundle exec jekyll serve
```

Open `http://localhost:4000/TheFatCat-docs/`. To run the browser regression checks against the built site:

```sh
npm ci
npx playwright install chromium
npm run test:ui -- _site
```
