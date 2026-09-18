---
layout: default
title: Seniority Certificates
parent: User Guides
nav_order: 3
---

# Seniority Certificates (ERC-721)

A detailed guide to minting on-chain Seniority Certificates upon position exit, burning 100,000 FATCAT, inheriting starting notches, and the anti-chaining rule.

---

## 1. What is a Seniority Certificate?

When a staker leaves the pool, traditional protocols wipe their historical commitment with zero trace. In TheFatCat, long-term dedication is verifiable and valuable.

[`SeniorityCertificate.sol`]({% link contracts.md %}) is a canonical **ERC-721 credential** that captures your achieved seniority notch (1–22). It features:
- **100% On-Chain SVG Rendering**: Rendered dynamically by `SeniorityCertificateRenderer.sol` without any IPFS or centralized server dependencies.
- **Visual Tier Imprinting**: The artwork dynamically reflects your seat number, achieved notch level, color tier, activation interval, and burn block.
- **Starting Multiplier Inheritance**: Depositing with a certificate allows a new position to skip the ramp period and start directly at that notch!

---

## 2. How to Mint Upon Exit

When you are ready to unstake and close an active position, you have the option to capture your achieved seniority notch into a permanent on-chain NFT certificate:

1. Connect your wallet and navigate to the **Positions** dashboard on [thefatcat.fun](https://thefatcat.fun).
2. Locate the active position you want to exit and click **Unstake / Redeem**.
3. In the exit modal, toggle the **"Mint Seniority Certificate"** option.
4. Confirm the transaction in your wallet.

### Minting Mechanics:
- **Full Principal Return**: 100% of your staked FATCAT principal is returned directly to your wallet.
- **Deflationary Burn of 100,000 FATCAT**: Exactly 100,000 FATCAT is permanently burned from your wallet directly to the blackhole dead address (`0x000000000000000000000000000000000000dEaD`).
- **Notch Imprinted on ERC-721**: The newly minted certificate permanently embeds the exact seniority notch ($c_i \in [1, 22]$) your position achieved, along with dynamic on-chain SVG artwork.

{: .note }
**Standard Unstaking**: If you perform a standard exit without choosing to mint a certificate, 100% of your principal is returned with zero burn fee, and no certificate is created.

---

## 3. Using a Certificate for Future Staking

Holding a Seniority Certificate allows you or any recipient to skip the initial ramp period on a future stake:

1. Go to the **Stake** page on [thefatcat.fun](https://thefatcat.fun).
2. Enter the amount of FATCAT you wish to stake ($\ge 100{,}000$).
3. In the **Seniority Certificate** selector, choose the certificate held in your wallet.
4. Approve token spending and click **Stake with Certificate**.

### What Happens:
- **Immediate Notch Boost**: Instead of starting at Notch 1 ($1\times$), your new position activates immediately at the certificate's imprinted notch (e.g. starting at Notch 22 provides an instant $22\times$ weight multiplier from the very next meal).
- **Vault Custody**: The certificate is safely held by the staking vault while your position remains active.
- **Returned on Exit**: When you eventually redeem this position, the certificate is returned directly to your wallet.

---

## 4. The Anti-Chaining Rule (No Certificate Cascading)

To protect the economic integrity of the protocol and prevent infinite certificate reproduction:

{: .warning }
**The Anti-Chaining Invariant**: A position that was initiated using a Seniority Certificate **cannot** mint another certificate upon exit; it exits via standard redemption.

This strict architectural constraint ensures:
- Certificates cannot be endlessly recycled or chained to artificially inflate NFT supply.
- Every single Seniority Certificate in existence represents an authentic, uninterrupted organic climb from Notch 1, backed by a permanent 100,000 FATCAT token burn.
