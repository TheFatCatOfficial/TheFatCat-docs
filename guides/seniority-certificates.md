---
layout: default
title: Time-Seniority Certificates (ERC-721)
parent: User Guides
nav_order: 3
---

# Time-Seniority Certificates (ERC-721)

An architectural and operational guide to TheFatCat's on-chain duration credential tokens, governing contract-level time assetization, supply deflation, and secondary royalty treasury routing.

---

## 1. Specification & Contract Architecture

In TheFatCat's economic topology, duration is the primary non-capital variable. Time-Seniority Certificates ([`SeniorityCertificate.sol`](file:///Users/levan/Desktop/TheFatCat/contracts/src/SeniorityCertificate.sol)) provide an immutable on-chain credential standard:

- **Standard Compliance**: ERC-721 with on-chain SVG metadata ([ERC-4906](https://eips.ethereum.org/EIPS/eip-4906)), native royalty signaling ([ERC-2981](https://eips.ethereum.org/EIPS/eip-2981)), and rentable user roles ([ERC-4907](https://eips.ethereum.org/EIPS/eip-4907)).
- **Supply Hard Cap**: Fixed ceiling of exactly **9,999** certificates (`MAX_SUPPLY = 9_999`), permanently enforced at contract level.
- **Royalty Routing**: Hardcoded 500 bps (5.0%) secondary royalty (`ROYALTY_BPS = 500`) routed directly to [`CertificateRevenueVault.sol`](file:///Users/levan/Desktop/TheFatCat/contracts/src/CertificateRevenueVault.sol), which flushes collected quote proceeds into The Belly reservoir.
- **On-Chain Vector Badges**: Rendered via [`SeniorityCertificateRenderer.sol`](file:///Users/levan/Desktop/TheFatCat/contracts/src/SeniorityCertificateRenderer.sol) generating fully decentralized, dynamic SVG graphics directly from EVM bytecode without external IPFS or HTTP dependencies.

---

## 2. Core Economic Pillars

### 1. Burn-to-Mint Duration Assetization
When a staker closes and redeems a long-standing position from `StakingVault`, the realized duration and seniority multiplier accumulated during the position's active lifetime can be minted into a permanent on-chain certificate by burning FATCAT tokens. This requirement couples credential creation with permanent supply deflation.

### 2. Dual Flywheel: Deflation & Treasury Inflows
1. **Supply-Side Deflation**: Tokens burned during certificate minting are permanently removed from circulating supply, creating a non-reversible deflationary sink for FATCAT.
2. **Treasury Accretion (The Belly Flywheel)**: Secondary marketplace sales respecting ERC-2981 royalties automatically send 5% of gross trade value to `CertificateRevenueVault`. The vault converts proceeds to quote assets and flushes them into The Belly, expanding the reward inventory released to active stakers via the exponential smoothing model.

---

## 3. Protocol Binding & Timelock Governance

To prevent administrative front-running or malicious NFT contract injection, `StakingVault.sol` enforces a two-step timelocked binding pipeline:

```solidity
// StakingVault.sol: 2-step binding pipeline
function proposeCertificate(address candidate) external;  // Governor only
function activateCertificate() external;                  // After CERTIFICATE_BINDING_DELAY
```

1. **Deterministic Verification**: Any candidate contract must pass interface checks (`supportsInterface(0x80ac58cd)`), verify its vault binding (`nft.vault() == address(this)`), and confirm the immutable supply cap.
2. **Mandatory Timelock**: Once proposed, the candidate must wait for the full `CERTIFICATE_BINDING_DELAY` before activation.
3. **Write-Once Permanence**: Once bound, the certificate collection cannot be replaced or upgraded.

---

## 4. Technical Specifications Matrix

| Parameter | Value | Contract Identifier | Invariant Constraint |
| :--- | :--- | :--- | :--- |
| **Asset Standard** | ERC-721 / ERC-2981 / ERC-4907 / ERC-4906 | `SeniorityCertificate.sol` | Fully on-chain SVG renderer |
| **Maximum Supply** | `9,999` units | `MAX_SUPPLY` | Strictly immutable constant |
| **Secondary Royalty** | `500` bps (5.0%) | `ROYALTY_BPS` | Routed to `CertificateRevenueVault` |
| **Treasury Target** | The Belly Reservoir | `royaltyReceiver` | Accretes staker yield inventory |
| **Binding Policy** | 2-step timelock | `CERTIFICATE_BINDING_DELAY` | Zero to one collection once ever |
