---
layout: default
title: Seniority Certificates (ERC-721)
parent: User Guides
nav_order: 3
---

# Seniority Certificates (ERC-721)

A conceptual overview of TheFatCat's upcoming on-chain seniority credential system, planned for rollout in a subsequent protocol release.

---

{: .note }
**Launch Status: Post-Launch Roadmap Feature**  
The Seniority Certificate module is **not enabled during initial protocol launch**. At launch, all position exits perform standard principal redemptions (100% of principal returned, zero burn fee). Certificate minting and starting notch inheritance will be activated in an upcoming protocol phase.

---

## 1. Concept & Vision

In traditional staking protocols, exiting a pool permanently wipes a participant's historical commitment and accumulated tenure. TheFatCat is architected to respect long-term alignment.

The planned [`SeniorityCertificate`]({% link contracts.md %}) system is an on-chain **ERC-721 credential** designed to capture and preserve a staker's dedication:

- **100% On-Chain SVG**: The artwork and dynamic traits (seat number, achieved notch level, color tier, activation meal) are computed and rendered entirely on-chain without IPFS or external hosting dependencies.
- **Proof of Loyalty**: Certificates permanently record the seniority notch ($c_i \in [1, 22]$) a position attained prior to redemption.
- **Starting Notch Inheritance**: In future releases, linking a certificate when opening a new stake will allow bypassing the initial ramp period and activating directly at the credential's seniority level.

---

## 2. Planned Mechanics Overview

When activated in future protocol updates, the system will operate under the following parameters:

- **Optional Burn Upon Exit**: Stakers who exit mature positions may optionally burn **100,000 FATCAT** directly to the blackhole address (`0x000000000000000000000000000000000000dEaD`) to mint their certificate. Exits without certificate minting remain 100% fee-free.
- **Non-Chaining Invariant**: To protect protocol equilibrium and prevent credential dilution, positions initiated using a certificate cannot mint another certificate upon exit. Every certificate must originate from an authentic, organic climb from Notch 1.
- **Custody During Staking**: While a certificate is actively boosting a position, it will be held securely in vault escrow and returned to the staker upon position closure.

---

## 3. Activation Roadmap

Specific deployment schedules, web interface integrations, and activation details for Seniority Certificates will be announced via official protocol channels following initial launch stabilization and liquidity maturation.
