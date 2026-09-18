---
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
Located in [`contracts/ops/watch-processor.sh`](https://github.com/TheFatCatOfficial/TheFatCat/blob/main/contracts/ops/watch-processor.sh), this script polls four vital on-chain storage slots:
1. **Target Vault Address**: Ensures routing proceeds continue pointing to TheFatCat's Forwarding Vault.
2. **Fee Rate Configuration**: Verifies the tax percentage remains fixed.
3. **Liquidation Threshold**: Monitors the FATCAT accumulation trigger before AMM sell liquidations.
4. **Primary Liquidity Pair**: Validates the taxed trading pair address.

If any deviation or unauthorized route mutation is detected, automated alerts notify the core security contributors within seconds.

---

## 2. Emergency Pause & Recovery Drills

The protocol incorporates robust incident response mechanisms:

- **Dual Emergency Pause**: Both the `Governor Safe` and the dedicated `Guardian` address hold the power to immediately pause The Belly's outflow.
- **Scope of Pause**: Pausing halts releases and market swaps, preventing fund drainage. It **deliberately does not** pause principal redemption in `StakingVault.sol`.
- **Rehearsed Unpause Drills**: Unpausing requires a 2-of-3 threshold signature from the `Governor Safe`. The repository maintains complete offline pause/unpause drill scripts (`run-pause-drill.zsh`) and web verification interfaces to ensure rapid recovery during live incidents.

---

## 3. Responsible Disclosure & Security Channel

TheFatCat welcomes independent security researchers and white-hat hackers:

- **Security Contact**: `security@thefatcat.fun`
- **SLA Commitments**:
  - **24-Hour Acknowledgment**: Initial receipt confirmation within 24 hours.
  - **48-Hour Triage**: Preliminary vulnerability severity classification within 48 hours.
- **Discretionary Grants**: Critical and High severity findings are eligible for decentralized grants disbursed directly from the community treasury.
