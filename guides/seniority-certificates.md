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
The Seniority Certificate module is **not enabled during initial protocol launch**. At launch, all position exits perform standard principal redemptions (100% of principal returned, zero burn fee). The certificate system is reserved for an upcoming protocol phase.

---

## 1. Concept & Vision

In traditional staking protocols, exiting a pool permanently wipes a participant's historical commitment and accumulated tenure. TheFatCat is designed to acknowledge long-term alignment.

The planned [`SeniorityCertificate`]({% link contracts.md %}) system introduces an on-chain **ERC-721 credential** designed to capture and honor a staker's dedication:

- **100% On-Chain SVG**: Artwork and dynamic visual attributes (such as achieved notch tier, seat number, and activation milestones) are computed and rendered entirely on-chain without IPFS or external hosting dependencies.
- **Proof of Tenure**: Certificates permanently record the seniority notch ($c_i \in [1, 22]$) attained by a position prior to redemption.
- **Deflationary Burn Mechanism**: Minting a certificate upon position exit will require burning FATCAT tokens directly to the blackhole dead address (`0x000000000000000000000000000000000000dEaD`), tying credential creation directly to protocol-level token deflation.

---

## 2. Activation Roadmap

Specific deployment schedules, token burn parameters, and complete utility specifications for Seniority Certificates will be announced via official protocol channels following initial launch stabilization and liquidity maturation.
