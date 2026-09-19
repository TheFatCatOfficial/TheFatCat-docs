---
layout: default
title: Verified Contracts
nav_order: 7
has_children: true
---

# Verified Contracts Schedule

Official smart contract registry for TheFatCat protocol on BNB Chain. Addresses and BscScan links will be populated upon mainnet deployment.

---

## Architectural Breakdown

Explore detailed specifications for each contract subsystem:

- **[Core Vault Contracts]({% link contracts/core-vaults.md %})**: StakingVault (principal isolation & unpausable redemptions), The Belly (unprivileged damping reservoir), and ForwardingVault (atomic fee division).
- **[Routers & Oracles]({% link contracts/routers-and-oracles.md %})**: ExecutionRouter (MEV-guarded single-activation router), PancakeV2TwapOracle (endogenous price checks), and RewardAssetRegistry.
- **[Seniority Ledger & Math]({% link contracts/seniority-ledger.md %})**: SeniorityLedger ($O(1)$ scalar weight accounting), RewardDistributor (dual-liability solvency engine), and on-chain SeniorityCertificate renderers.

---

## Master Protocol Registry

{: .note }
**Mainnet Genesis Deployment Note**: Official on-chain contract addresses will be deterministically derived via `CREATE2` and published upon genesis broadcast on BNB Chain. Live BscScan explorer links will be populated immediately upon launch.

| Component | Source Contract | Architectural Scope & Role | Deployment Standard | Genesis Verification |
|:---|:---|:---|:---|:---|
| **FATCAT Token** | `FATCAT.sol` | 1,000,000,000 fixed supply, zero presale, immutable BEP-20 implementation | Flap Bonding Factory | Pending Launch |
| **PancakeSwap V2 Pair** | `PancakePair` | Liquidity pool pair (`FATCAT/WBNB`), cumulative TWAP price feed source | PancakeFactory | Upon Graduation |
| **Forwarding Vault** | `ForwardingVault.sol` | Receives liquidated WBNB; splits 5/36 to Operations & 31/36 to Belly | Deterministic CREATE2 | Scheduled Genesis |
| **The Belly** | `Belly.sol` | Exponential damping reservoir; window outflow cap $\le 16/168$, zero sweep | Deterministic CREATE2 | Scheduled Genesis |
| **StakingVault** | `StakingVault.sol` | Custodies staked principal; unpausable `redeem()`, 100k FATCAT floor | Deterministic CREATE2 | Scheduled Genesis |
| **SeniorityLedger** | `SeniorityLedger.sol` | $O(1)$ scalar weight accounting, 22-slot graduation ring, RAY prefix engine | Deterministic CREATE2 | Scheduled Genesis |
| **IntervalController** | `IntervalController.sol` | Permissionless clock engine ($\ge 8\text{h}$ cadence), locks open meal weights | Deterministic CREATE2 | Scheduled Genesis |
| **RewardAssetRegistry** | `RewardAssetRegistry.sol` | Authoritative MENU whitelist and 5% probation allocation controller | Deterministic CREATE2 | Scheduled Genesis |
| **ExecutionRouter** | `ExecutionRouter.sol` | Timelocked single-activation router, TWAP-guarded batch market swaps | Deterministic CREATE2 | Scheduled Genesis |
| **RewardDistributor** | `RewardDistributor.sol` | Dual-liability accounting, non-negative dust solvency custody | Deterministic CREATE2 | Scheduled Genesis |
| **SeniorityCertificate** | `SeniorityCertificate.sol` | Exit credential; burn FATCAT to mint, 100% on-chain SVG ERC-721 | Deterministic CREATE2 | Post-Launch Phase |
| **CertificateRenderer** | `SeniorityCertificateRenderer.sol` | Pure on-chain SVG generator rendering dynamic visual attributes | Deterministic CREATE2 | Post-Launch Phase |
| **PancakeV2TwapOracle** | `PancakeV2TwapOracle.sol` | Endogenous TWAP reader evaluating time-weighted average prices | Deterministic CREATE2 | Scheduled Genesis |
