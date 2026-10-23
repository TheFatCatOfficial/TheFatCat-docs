---
layout: default
title: Operational Monitoring & Incident Response
parent: Security & Governance
nav_order: 3
---

# Operational Monitoring & Incident Response

TheFatCat has operational monitoring and incident response mechanisms to detect anomalies and take action when needed.

## Monitoring Measures

Monitoring checks protocol status and key on-chain activity. Detected anomalies are reviewed and may trigger a response. Monitoring depends on chain data and external services; it cannot guarantee detection of every issue or an immediate response.

## Why Might Operations Be Paused?

Emergency pauses can address suspected contract vulnerabilities or attacks, abnormal prices or liquidity, and anomalies in upstream revenue routes or configuration. Detected risks are reviewed, and affected operations may be paused within the available permissions to allow investigation and response while limiting further exposure.

## Pause Scope and Fund Safety

An official emergency pause restricts only the affected protocol operations. Each pause switch operates independently, with the following scope:

| Paused Component | Operations Stopped |
|---|---|
| Upstream QQQB conversion | Conversion of pending QQQB into WBNB; new reward revenue may be delayed. |
| Belly reward-reserve outflows | Reward purchases and WBNB fallback settlement that require funds from Belly. |
| New staking positions | Opening new staking positions. |

These switches do not automatically stop meal accounting advancement or pause token trading. Rewards awaiting purchase or settlement may remain pending and are not yet claimable.

**A pause itself does not empty protocol treasury reserves, reset users' recorded time seniority and weight, or deduct staking principal.** Principal, reward reserves and settled rewards are held separately, and historical reward entitlements are not erased merely because operations are paused.

**During a pause, users can still redeem ordinary staking principal and claim settled rewards directly through the on-chain contracts, without waiting for an unpause or obtaining a maintainer's approval.** The core staking and reward contracts have no administrative entry points for directly withdrawing users' principal or settled rewards, and a pause does not transfer these assets to the team. Upstream tax proceeds have separate permission boundaries; see [Custody & Accounting Boundaries]({% link safety/custody.md %}).

Transactions still require chain availability, valid position checks and successful token transfers. Ordinary redemption forfeits the currently open meal's share while preserving historical reward entitlements. A pause does not reverse completed transactions.

## Response and Recovery

The team will investigate anomalies, address affected operations and verify recovery conditions. **Once the incident has been addressed, safety checks are complete and recovery conditions are met, the team will promptly use the authorized governance process to lift the relevant pauses and restore those operations.** Progress and recovery status will be shared through [official channels]({% link links.md %}).

Recovery timing depends on resolving the issue and on-chain execution conditions. After operations resume, pending rewards still follow the protocol's purchase or fallback settlement rules; the entire backlog does not necessarily become claimable immediately.

## What Users Can Do

Follow status notices through [official channels]({% link links.md %}). Reward settlement may be delayed during an incident. To exit a position or claim settled rewards, consult the [Emergency Exit Guide]({% link guides/emergency-exit.md %}); transactions still depend on chain availability and contract execution conditions.

Report security issues privately through [GitHub Security Advisories](https://github.com/TheFatCatOfficial/TheFatCat-docs/security/advisories/new), and avoid disclosing sensitive details publicly.
