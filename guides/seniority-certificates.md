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

## 2. How to Mint Upon Exit (`redeemAndIssue`)

To mint a Seniority Certificate, you must exit your position via the specialized redemption method:

```solidity
function redeemAndIssue(uint256 positionId) external returns (uint256 certificateTokenId);
```

### Minting Prerequisites & Mechanics:
1. **Full Principal Return**: 100% of your staked FATCAT principal is returned to your wallet.
2. **Deflationary Burn of 100,000 FATCAT**: The contract burns **100,000 FATCAT** from the caller's wallet directly to the blackhole address:
   
   $$\text{Burn Destination} = \text{0x000000000000000000000000000000000000dEaD}$$
   
   *(Ensure you have approved the vault to spend this burn fee before calling).*
3. **Notch Imprinting**: The minted certificate permanently records the exact notch ($c_i \in [1, 22]$) your position achieved at the time of redemption.

{: .note }
Ordinary exits calling standard `redeem(positionId)` do not incur any burn fee, return 100% of principal, and do not mint a certificate.

---

## 3. Using a Certificate for Future Staking

When opening a new position, you can supply your certificate's token ID:

```solidity
StakingVault.stake(amount, dietAsset, certificateTokenId);
```

### What Happens:
- **Vault Custody**: The certificate is transferred to the `StakingVault` for safekeeping while your position remains active.
- **Immediate Notch Boost**: Instead of starting at Notch 1 ($1\times$), your new position activates directly at the certificate's imprinted notch (e.g. Notch 22 for a mature certificate, granting an instant $22\times$ weight multiplier).
- **Return on Exit**: When you eventually redeem your position, the certificate is safely returned to your wallet.

---

## 4. The Anti-Chaining Rule (No Certificate Cascading)

To protect the economic integrity of the protocol and prevent infinite certificate reproduction:

{: .warning }
**The Anti-Chaining Invariant**: A position that was initiated using a Seniority Certificate **cannot** invoke `redeemAndIssue()` to mint another certificate upon exit. It must exit via standard `redeem()`.

This strict architectural constraint ensures:
- Certificates cannot be endlessly recycled or chained to inflate supply.
- Every single Seniority Certificate in existence represents an authentic, uninterrupted organic climb from Notch 1, backed by a permanent 100,000 FATCAT token burn.
