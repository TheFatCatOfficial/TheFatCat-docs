---
title: Introduction
layout: default
nav_order: 1
---

# TheFatCat Documentation

TheFatCat is a new experimental DeFi protocol that combines meme culture with a decentralized trading-tax routing mechanism.

## How it works

- **Revenue and allocation:** FATCAT's 4% trading tax is received as QQQB. Following fees, conversion and any earned FEED bounty, net WBNB is split 85% to the Belly and 15% to project development, operations and marketing. An on-time 8-hour meal allocates up to 1/21 of unreserved quote funds; allocation does not itself transfer funds.
- **Staking weight:** The minimum position is 100,000 FATCAT. An ordinary position becomes eligible from the next meal at 1× weight, increasing by 1× per active meal to 22×. Principal and time multiply linearly; a larger deposit still receives a larger share at equal seniority.
- **Settlement and claims:** Procurement follows global meal order and uses price and liquidity checks. Eligible failures can settle in WBNB under the fallback rules. Finalized rewards remain claimable; pending procurement can be delayed.
- **Exit:** Ordinary redemption returns principal without an exit fee and does not check the protocol pause flag. Exiting stops future weight and forfeits the unfinalized active-meal entitlement; previously finalized rewards are retained.

## Start here

| Topic | Pages |
|:---|:---|
| Using the protocol | [Staking]({% link guides/staking.md %}), [diets and claims]({% link guides/diets-and-claiming.md %}), [emergency exit]({% link guides/emergency-exit.md %}) |
| Maintenance | [FEED & decentralized maintenance]({% link guides/community-keeper.md %}) |
| Mechanisms | [How the Machine Runs]({% link protocol/how-the-machine-runs.md %}), [Belly allocation]({% link protocol/belly.md %}), [seniority]({% link protocol/meals-and-seniority.md %}), [execution]({% link protocol/execution.md %}), [fees]({% link protocol/fees.md %}) |
| Architecture | [Topology]({% link topology.md %}), [definitions]({% link definitions.md %}), [design background]({% link background.md %}) |
| Risk and verification | [Security]({% link safety.md %}), [risk boundaries]({% link safety/risks-and-status.md %}) |
| Reference | [FAQ]({% link faq.md %}), [whitepaper]({% link whitepaper.md %}), [notices]({% link notices.md %}), [official links]({% link links.md %}) |

## Limits and selected future roadmap items

Rewards depend on actual revenue, maintenance and market execution. The protocol promises no fixed return; TWAP checks limit execution conditions but do not eliminate MEV or token, issuer and liquidity risk. Chain availability and token behavior also affect withdrawals and claims.

[Time-Seniority Certificates]({% link guides/seniority-certificates.md %}) will be introduced when the protocol is mature enough.
