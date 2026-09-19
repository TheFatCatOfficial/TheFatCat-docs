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

- **[Core Vault Contracts]({% link contracts/core-vaults.md %})**: StakingVault (principal isolation & unpausable redemptions), The Belly (unprivileged damping reservoir), and FatCatStakingVault (Flap V3 tax routing and fee division).
- **[Routers & Oracles]({% link contracts/routers-and-oracles.md %})**: ExecutionRouter (MEV-guarded permanent-spender router), PancakeV3TwoHopTwapOracle / PancakeV2TwapOracle (endogenous price checks), and InitialRewardAssetRegistry.
- **[Seniority Ledger & Math]({% link contracts/seniority-ledger.md %})**: SeniorityLedger ($O(1)$ scalar weight accounting), RewardDistributor (dual-liability solvency engine), and on-chain SeniorityCertificate renderers.

---

## Master Protocol Registry

{: .note }
**Mainnet Genesis Deployment Note**: Official on-chain contract addresses will be published upon genesis broadcast on BNB Chain. Live BscScan explorer links will be populated immediately upon launch.

| Component | Source Contract | Architectural Scope & Role | Deployment Standard | Genesis Verification |
|:---|:---|:---|:---|:---|
| **FATCAT Token** | `FATCAT.sol` | 1,000,000,000 fixed supply, zero presale, immutable BEP-20 implementation | Flap Bonding Factory | Pending Launch |
| **PancakeSwap V2 Pair** | `PancakePair` | Liquidity pool pair (`FATCAT/WBNB`), cumulative TWAP price feed source | PancakeFactory | Upon Graduation |
| **FatCatStakingVault** | `FatCatStakingVault.sol` | Flap V3 tax router; delta recognition, wraps to WBNB, splits 5/36 to Ops & 31/36 to Belly | Flap BeaconProxy | Scheduled Genesis |
| **FatCatStakingVaultFactory** | `FatCatStakingVaultFactory.sol` | Factory deploying beacon instances for Flap VaultPortal integration | Flap FactoryBaseV2 | Scheduled Genesis |
| **The Belly** | `Belly.sol` | Exponential damping reservoir; window outflow cap $\le 16/168$, write-once spender | Deterministic Deployment | Scheduled Genesis |
| **StakingVault** | `StakingVault.sol` | Custodies staked principal; unpausable `redeem()`, 100k FATCAT floor, certificate link | Deterministic Deployment | Scheduled Genesis |
| **SeniorityLedger** | `SeniorityLedger.sol` | $O(1)$ scalar weight accounting, 22-slot graduation ring, RAY prefix engine | Deterministic Deployment | Scheduled Genesis |
| **LaunchIntervalController** | `LaunchIntervalController.sol` | Production clock engine ($\ge 8\text{h}$ cadence), 7-day wall-clock accumulation period | Deterministic Deployment | Scheduled Genesis |
| **InitialRewardAssetRegistry** | `InitialRewardAssetRegistry.sol` | Production MENU whitelist with signed constructor menu exempt from probation | Deterministic Deployment | Scheduled Genesis |
| **ExecutionRouter** | `ExecutionRouter.sol` | Permanent write-once router, TWAP-guarded batch market swaps & fallback | Deterministic Deployment | Scheduled Genesis |
| **RewardDistributor** | `RewardDistributor.sol` | Dual-liability accounting, non-negative dust solvency custody | Deterministic Deployment | Scheduled Genesis |
| **SeniorityCertificate** | `SeniorityCertificate.sol` | Exit credential; burn 100k FATCAT to mint, 10k cap, 21d delay, 100% on-chain SVG | Deterministic Deployment | Scheduled Genesis |
| **CertificateRenderer** | `SeniorityCertificateRenderer.sol` | Pure on-chain SVG generator rendering dynamic visual attributes | Deterministic Deployment | Scheduled Genesis |
| **CertificateData** | `CertificateData.sol` | Bytecode container storing compressed fonts and vector artwork data | Deterministic Deployment | Scheduled Genesis |
| **PancakeV2TwapOracle** | `PancakeV2TwapOracle.sol` | Endogenous TWAP reader evaluating time-weighted average prices for V2 pairs | Deterministic Deployment | Scheduled Genesis |
| **PancakeV3Adapter** | `PancakeV3Adapter.sol` | Production execution adapter executing multi-hop swaps across Pancake V3 pools | Deterministic Deployment | Scheduled Genesis |
| **PancakeV3TwoHopTwapOracle** | `PancakeV3TwoHopTwapOracle.sol` | Two-hop V3 TWAP oracle (WBNB -> USDT -> bStock) for equity feeds | Deterministic Deployment | Scheduled Genesis |
