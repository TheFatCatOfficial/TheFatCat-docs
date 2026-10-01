---
layout: default
title: Operational Monitoring
parent: Security & Governance
nav_order: 3
---

# Operational Monitoring & Incident Response

Deployment baselines, distinct upgrade and pause roles, and recovery checks for the QQQB revenue lane.

---

## 1. QQQB Revenue Dependencies and Approved Baselines

Production monitoring is configured against the actual deployment and an explicitly reviewed baseline; local test results do not establish that a production service is running.

- **Flap processor routing**: Check the deployed processor owner, creator-revenue target (`FatCatQqqbVault`), payout quote (QQQB), fee recipient and fee configuration against the approved launch record. The P2 observation was `feeRate = 500`, a 5% share of tax, not a permanent platform guarantee.
- **Vault Beacon baseline**: The QQQB watcher checks the Vault proxy, Beacon, current implementation and code hashes, their Factory binding, canonical Flap Guardian and upgrade-lock state. Before locking, the Beacon owner must be the Factory; after locking it must be the zero address. The owner and the ultimate upgrade authority are different roles.
- **Issuer policy**: QQQB issuer authority is trusted under the current integration decision. Issuer-role or token-implementation changes are not automatic hold conditions for the official conversion service. Transfers, actual balance changes, liquidity and protected execution must still work.

A mismatch or unavailable approved baseline holds the official maintenance service's QQQB conversion calls and requires review. It does **not** send an on-chain pause transaction or automatically stop public calls. Approving a new baseline after review can release the off-chain hold; it does not reverse an upgrade or completed transaction.

### Upgrade and Pause Roles

| Action | Authorized role | Scope |
|---|---|---|
| Factory `upgradeVaultImplementation(address)` | Flap Guardian only | Upstream QQQB Vault implementations under this Factory |
| Factory `lockVaultUpgrades()` | Flap Guardian only | Permanently disables those upgrades; irreversible |
| QQQB Vault `pause()` | Project governor, project guardian, or Flap Guardian | Stops conversion under the current implementation |
| QQQB Vault `unpause()` | Project governor or Flap Guardian | Resumes conversion if all execution checks pass |

The project guardian can pause but cannot unpause or upgrade this Vault. The Factory upgrade path does not change the fixed BNB receiver, Belly or staking contracts. A valid on-chain pause blocks conversion for official and public callers alike; waiting QQQB stays upstream.

---

## 2. Emergency Pause & Recovery

The protocol incorporates robust incident response mechanisms:

- **Emergency Pause Controls**: Both protocol governance and the dedicated `Guardian` address hold the power to immediately pause The Belly's outflow.
- **Scope of Pause**: Pausing halts releases and market swaps, preventing fund drainage. It **deliberately does not** pause principal redemption in `StakingVault.sol`.
- **Unpause Recovery**: Unpausing requires multi-signature governance authorization. The protocol maintains rehearsed recovery procedures and automated verification test suites to ensure rapid recovery during live incidents.

---

## 3. Responsible Disclosure & Security Channel

TheFatCat welcomes independent security researchers and white-hat hackers:

- **Security Reporting**: Vulnerabilities should be submitted privately via [GitHub Security Advisories](https://github.com/TheFatCatOfficial/TheFatCat-docs/security/advisories/new).
- **Review & Feedback**: The security response team regularly reviews submitted security reports and aims to provide prompt evaluation and feedback.
- **Discretionary Grants**: Valid Critical and High severity findings verified by the community are eligible for discretionary security bounties from the community treasury.
