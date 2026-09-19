---
layout: default
title: Operational Monitoring
parent: Security & Governance
nav_order: 3
---

# Operational Monitoring & Incident Response

How TheFatCat continuously monitors upstream tax processor storage slots on-chain, conducts pause/unpause drills, and enforces security SLAs.

---

## 1. Upstream Flap Dependency & The Watcher

On BNB Chain, the transaction tax processor is deployed and owned by the Flap factory system. While the FATCAT token clone's implementation pointer is immutable, the external tax processor retains mutable fee-routing authority.

To safeguard stakers, TheFatCat operates an automated monitoring watcher:

### Continuous On-Chain State Metrics
The protocol continuously monitors eight canonical on-chain view functions on the upstream processor to ensure fee routing parameters remain completely unmutated:
1. **`owner()`**: Confirms ownership remains with the canonical Flap Portal.
2. **`getWalletConfig()`**: Ensures creator revenue proceeds continue routing to TheFatCat's tax vault (`FatCatStakingVault`).
3. **`feeReceiver()`**: Tracks the platform fee recipient address.
4. **`feeConfig()`**: Verifies the platform fee fraction (`marketBps`, 1000 bps) remains unchanged.
5. **`dividendAddress()`**: Monitors dividend distribution routing.
6. **`forwardAddress()`**: Confirms unauthorized forwarding targets are not armed.
7. **`autoForward()`**: Verifies the automated forwarding toggle state.
8. **`quoteToken()`**: Verifies the payout currency token pointer.

If any deviation or unauthorized route mutation is detected against the baseline snapshot, automated alarms alert core security contributors immediately.

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
