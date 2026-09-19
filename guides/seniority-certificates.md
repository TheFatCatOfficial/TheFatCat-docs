---
layout: default
title: Seniority Certificates (ERC-721)
parent: User Guides
nav_order: 3
---

# Seniority Certificates (ERC-721)

An in-depth specification of TheFatCat's on-chain seniority credential system, deployed at genesis as an immutable companion to the staking engine.

---

{: .note }
**Genesis Deployment Status: Deployed with Staking Stack**  
The Seniority Certificate module is deployed alongside `StakingVault` at genesis. Stakers exiting an active position can choose between standard redemption (`redeem()`, returning 100% principal without burning) or issuing a permanent credential (`redeemAndIssueCertificate()`).

---

## 1. Concept & Mechanics

In traditional staking protocols, exiting a pool permanently wipes a participant's historical commitment and accumulated tenure. TheFatCat acknowledges long-term alignment through [`SeniorityCertificate.sol`]({% link contracts.md %}):

- **100% On-Chain SVG**: Artwork, layout, and dynamic attributes (achieved notch tier, seat number, activation milestones) are rendered entirely on-chain by `SeniorityCertificateRenderer.sol` using bytecode font tables in `CertificateData.sol`, free from IPFS or web server dependencies.
- **Proof of Tenure**: Certificates permanently record the seniority multiplier ($c_i \in [1, 22]$) attained by the position upon redemption.
- **Deflationary Token Burn**: Minting a certificate burns exactly **100,000 FATCAT** (`MINT_BURN`) directly to the dead address (`0x000000000000000000000000000000000000dEaD`), permanently shrinking circulating supply. The remaining principal is refunded directly to the user.
- **Reusable Staking Multiplier**: An unencumbered certificate can be lent to a fresh deposit via `stakeWithCertificate(principal, diet, certificateId)`. The position immediately starts with the certificate's permanent notch multiplier, bypassing the notch climb. While the position remains open, the certificate is locked (`inUse(certificateId) == true`).

---

## 2. Hardcoded Contract Constants

The module parameters are pinned as immutable on-chain constants:

| Parameter | Value | Architectural Guarantee |
|:---|:---|:---|
| **`MINT_BURN`** | `100,000 FATCAT` | Flat token burn required per certificate issued, routed irreversibly to dead address |
| **`MAX_SUPPLY`** | `10,000 Certificates` | Permanent finite ceiling on total credentials that can ever be minted |
| **`MINT_DELAY`** | `21 Days` (504 Hours) | Cold-start lock; minting opens only after the network completes 21 days from deployment |
