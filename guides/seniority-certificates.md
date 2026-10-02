---
layout: default
title: Time-Seniority Certificates (ERC-721)
parent: User Guides
nav_order: 3
---

# Time-Seniority Certificates (ERC-721)

File names below are internal implementation/test references, not public source links. Published source verification is referenced on the [Contracts]({% link contracts.md %}) page.

An architectural and operational guide to TheFatCat's on-chain duration credential tokens, governing contract-level time assetization, supply deflation, and secondary royalty treasury routing.

{: .note }
This page describes the current candidate implementation. Genesis staking deploys with the certificate hook unset (`address(0)`) and no pending proposal. Certificates become available only after separate deployment, timelocked binding and one-time Governor opening of issuance; final release parameters and availability follow the dedicated announcement.

---

## 1. Specification & Contract Architecture

In TheFatCat's economic topology, duration is the primary non-capital variable. Time-Seniority Certificates (`SeniorityCertificate.sol`) provide an immutable on-chain credential standard:

- **Standard Compliance**: ERC-721 with on-chain SVG metadata ([ERC-4906](https://eips.ethereum.org/EIPS/eip-4906)), native royalty signaling ([ERC-2981](https://eips.ethereum.org/EIPS/eip-2981)), and user-role signaling ([ERC-4907](https://eips.ethereum.org/EIPS/eip-4907)). Interface support does not itself enable a rental product; availability follows the separate certificate announcement.
- **Supply Hard Cap**: Fixed ceiling of exactly **9,999** certificates (`MAX_SUPPLY = 9_999`), permanently enforced at contract level.
- **Royalty Routing**: ERC-2981 signals a 500 bps (5%) royalty and `CertificateRevenueVault.sol` as receiver. Payment depends on marketplace compliance and actual transfer. The Vault accepts BNB/WBNB, and a `flush()` transaction forwards funds to Belly; it does not convert arbitrary ERC-20 proceeds.
- **On-Chain Vector Badges**: Rendered via `SeniorityCertificateRenderer.sol` generating fully decentralized, dynamic SVG graphics directly from EVM bytecode without external IPFS or HTTP dependencies.

---

## 2. Core Economic Pillars

### 1. Burn-to-Mint Duration Assetization
When a staker closes a position via `redeemAndIssueCertificate`, exactly 100,000 FATCAT (`MINT_BURN`) is deducted from the staked principal and permanently burned to the dead address, refunding the remainder (`refund = principal - 100,000`) while assetizing the realized duration into an on-chain certificate. Ordinary `redeem()` returns 100% of principal without certificate minting.

### 2. Dual Flywheel: Deflation & Treasury Inflows
1. **Supply-Side Deflation**: Tokens burned during certificate minting are permanently removed from circulating supply, creating a non-reversible deflationary sink for FATCAT.
2. **Treasury Accretion (The Belly Flywheel)**: Royalties that a marketplace actually pays in BNB/WBNB can enter Belly through `CertificateRevenueVault.flush()`. ERC-2981 does not enforce payment on every transfer.

---

## 3. Protocol Binding & Timelock Governance

The certificate subsystem is separate from core staking deployment. Its binding and product activation are independent steps; product details and availability follow the dedicated announcement.

To prevent administrative front-running or malicious NFT contract injection, `StakingVault.sol` enforces a two-step timelocked binding pipeline:

```solidity
// StakingVault.sol: 2-step binding pipeline
function proposeCertificate(address candidate) external;  // Governor only
function activateCertificate() external;                  // After CERTIFICATE_BINDING_DELAY
```

1. **Candidate Compatibility and Review**: Proposal and activation check the ERC-721 interface, vault and Governor bindings, a nonzero `MAX_SUPPLY`, and closed issuance and rental state. Activation rechecks the recorded runtime code hash. These compatibility checks do not prove implementation safety or non-upgradeability; governance must review the deployed candidate code.
2. **Mandatory Timelock**: Once proposed, the candidate must wait for the full `CERTIFICATE_BINDING_DELAY` before activation.
3. **Write-Once Binding**: After activation, the certificate address recorded by `StakingVault` cannot be replaced or reset.

---

## 4. Technical Specifications Matrix

| Parameter | Value | Contract Identifier | Invariant Constraint |
| :--- | :--- | :--- | :--- |
| **Asset Standard** | ERC-721 / ERC-2981 / ERC-4907 / ERC-4906 | `SeniorityCertificate.sol` | Fully on-chain SVG renderer |
| **Maximum Supply** | `9,999` units | `MAX_SUPPLY` | Strictly immutable constant |
| **Secondary Royalty** | `500` bps (5.0%) | `ROYALTY_BPS` | Routed to `CertificateRevenueVault` |
| **Treasury Target** | The Belly Reservoir | `royaltyReceiver` | Accretes staker yield inventory |
| **Binding Policy** | 2-step timelock | `CERTIFICATE_BINDING_DELAY` | Zero to one collection once ever |
