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

### `watch-processor.sh`
Located in [`contracts/ops/watch-processor.sh`](https://github.com/TheFatCatOfficial/TheFatCat/blob/main/contracts/ops/watch-processor.sh), this script polls eight vital on-chain view functions on the Flap processor:
1. **`owner()`**: Confirms ownership remains with the canonical Flap Portal.
2. **`getWalletConfig()`**: Ensures creator revenue proceeds continue routing to TheFatCat's tax vault (`FatCatStakingVault`).
3. **`feeReceiver()`**: Tracks the platform fee recipient address.
4. **`feeConfig()`**: Verifies the platform fee fraction (`marketBps`, 1000 bps) remains unchanged.
5. **`dividendAddress()`**: Monitors dividend distribution routing.
6. **`forwardAddress()`**: Confirms unauthorized forwarding targets are not armed.
7. **`autoForward()`**: Verifies the automated forwarding toggle state.
8. **`quoteToken()`**: Verifies the payout currency token pointer.

If any deviation or unauthorized route mutation is detected against the baseline, automated alerts notify core security contributors immediately.

---

## 2. Emergency Pause & Recovery Drills

The protocol incorporates robust incident response mechanisms:

- **Emergency Pause Controls**: Both protocol governance and the dedicated `Guardian` address hold the power to immediately pause The Belly's outflow.
- **Scope of Pause**: Pausing halts releases and market swaps, preventing fund drainage. It **deliberately does not** pause principal redemption in `StakingVault.sol`.
- **Rehearsed Unpause Drills**: Unpausing requires multi-signature governance authorization. The repository maintains complete offline pause/unpause drill scripts (`run-pause-drill.zsh`) and verification interfaces to ensure rapid recovery during live incidents.

---

## 3. Responsible Disclosure & Security Channel

TheFatCat welcomes independent security researchers and white-hat hackers:

- **Security Reporting**: Vulnerabilities should be submitted privately via [GitHub Security Advisories](https://github.com/TheFatCatOfficial/TheFatCat-docs/security/advisories/new).
- **SLA Commitments**:
  - **24-Hour Acknowledgment**: Initial receipt confirmation within 24 hours.
  - **48-Hour Triage**: Preliminary vulnerability severity classification within 48 hours.
- **Discretionary Grants**: Critical and High severity findings are eligible for decentralized grants disbursed directly from the community treasury.
