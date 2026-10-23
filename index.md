---
title: Introduction
layout: default
nav_order: 1
---

# TheFatCat Documentation

TheFatCat is a new experimental DeFi revenue protocol that combines meme culture with a trading-tax routing mechanism.

Stake `$FATCAT` and earn BNB, bStocks or selected MEME tokens with a time-based seniority multiplier.

[Token Launch & Feature Opening]({% link guides/launch-stages.md %}): The three opening stages and the shared seven-day accumulation period.

## User guides

- [Staking guide]({% link guides/staking.md %})
- [Choose reward assets]({% link guides/diets-and-claiming.md %}#2-changing-your-diet)
- [Claim rewards]({% link guides/diets-and-claiming.md %}#3-claiming-earned-rewards)
- [Emergency exit guide]({% link guides/emergency-exit.md %})
{: .tfc-start-links }

## How it works

- **Revenue and allocation:** `$FATCAT`'s 4% trading tax is received as QQQB. Following fees, conversion and any earned Feeder reward, net WBNB is split 85% to the Belly and 15% to project development, operations and marketing.
- **Meal timing and budget:** Once rewards are open, meals normally advance every 8 hours. Each on-time meal allocates up to **1/21 (about 4.76%) of the Belly's unreserved funds** as its reward budget. Advancement requires a successful on-chain transaction, and allocation conditions must be met; allocation does not itself make rewards claimable.
- **Staking weight:** The minimum position is 100,000 `$FATCAT`. An ordinary position becomes eligible from the next meal with a 1× seniority multiplier, increasing by 1× per active meal to a maximum of 22×. Position weight = principal × seniority multiplier × incentive multiplier of the current asset.
- **Settlement and claims:** Procurement follows global meal order and uses price and liquidity checks. Eligible failures can settle in WBNB under the fallback rules. Finalized rewards remain claimable; pending procurement can be delayed.
- **Exit:** Ordinary redemption returns principal without an exit fee and does not check the protocol pause flag. Exiting stops future weight and forfeits the unfinalized active-meal entitlement; previously finalized rewards are retained.

## Learn more

- **Maintenance:** [FEED & decentralized maintenance]({% link guides/community-keeper.md %})

- **Mechanisms:** [How the Machine Runs]({% link protocol/how-the-machine-runs.md %}), [Belly allocation]({% link protocol/belly.md %}), [seniority]({% link protocol/meals-and-seniority.md %}), [execution]({% link protocol/execution.md %}), [fees]({% link protocol/fees.md %})

- **Architecture:** [Topology]({% link topology.md %}), [definitions]({% link definitions.md %}), [design background]({% link background.md %})

- **Risk and verification:** [Security]({% link safety.md %}), [risk boundaries]({% link safety/risks-and-status.md %})

- **Reference:** [FAQ]({% link faq.md %}), [notices]({% link notices.md %}), [official links]({% link links.md %})

## Limits and selected future roadmap items

Rewards depend on actual revenue, maintenance and market execution. The protocol promises no fixed return; TWAP checks limit execution conditions but do not eliminate MEV or token, issuer and liquidity risk. Chain availability and token behavior also affect withdrawals and claims.

[Time-Seniority Certificates]({% link guides/seniority-certificates.md %}) will be introduced when the protocol is mature enough.
