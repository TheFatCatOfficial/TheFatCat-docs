---
layout: default
title: Verified Contracts
nav_order: 8
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
| **PancakeSwap V2 Pair** | `PancakePair` | Liquidity pool pair (`FATCAT/QQQB`), cumulative TWAP price feed source | PancakeFactory | Upon Graduation |
| **FatCatStakingVault** | `FatCatStakingVault.sol` | Fixed BNB receiver; wraps net proceeds, 3/19 Ops, remainder (16/19) Belly | ERC-1167 fixed clone | Pending Deployment |
| **FatCatQqqbVault** | `FatCatQqqbVault.sol` | QQQB receipt and fixed conversion into BNB receiver | Flap V3 BeaconProxy | Pending Deployment |
| **FatCatQqqbVaultFactory** | `FatCatQqqbVaultFactory.sol` | Creates vaults and owns Beacon; Guardian-only upgrade/lock entrypoints | Flap FactoryBaseV2 | Pending Deployment |
| **FatCatMaintenanceRewards** | `FatCatMaintenanceRewards.sol` | Per-Vault, non-upgradeable custody and claiming for qualifying conversion bounties | Factory-created module | Pending Deployment |
| **ProtocolExecutor** | `ProtocolExecutor.sol` | Public one-tx attempt: QQQB conversion, one due advance and up to three reward purchases | Standalone contract | Pending Deployment |
| **The Belly** | `Belly.sol` | Exponential damping reservoir; window outflow cap $\le 16/168$, write-once spender | Deterministic Deployment | Scheduled Genesis |
| **StakingVault** | `StakingVault.sol` | Custodies staked principal; unpausable `redeem()`, 100k FATCAT floor, certificate link | Deterministic Deployment | Scheduled Genesis |
| **SeniorityLedger** | `SeniorityLedger.sol` | $O(1)$ scalar weight accounting, 22-slot graduation ring, RAY prefix engine | Deterministic Deployment | Scheduled Genesis |
| **LaunchIntervalController** | `LaunchIntervalController.sol` | Production clock engine ($\ge 8\text{h}$ cadence), 7-day wall-clock accumulation period | Deterministic Deployment | Scheduled Genesis |
| **InitialRewardAssetRegistry** | `InitialRewardAssetRegistry.sol` | Production MENU whitelist with signed constructor menu exempt from probation | Deterministic Deployment | Scheduled Genesis |
| **ExecutionRouter** | `ExecutionRouter.sol` | Permanent write-once router, TWAP-guarded batch market swaps & fallback | Deterministic Deployment | Scheduled Genesis |
| **RewardDistributor** | `RewardDistributor.sol` | Dual-liability accounting, non-negative dust solvency custody | Deterministic Deployment | Scheduled Genesis |
| **SeniorityCertificate** | `SeniorityCertificate.sol` | On-chain seniority credential (ERC-721); minted via FATCAT burn upon exit, with 5% ERC-2981 royalty routed to Belly | Deterministic Deployment | Scheduled Genesis |
| **CertificateRenderer** | `SeniorityCertificateRenderer.sol` | Pure on-chain SVG generator rendering dynamic visual attributes | Deterministic Deployment | Scheduled Genesis |
| **CertificateData** | `CertificateData.sol` | Bytecode container storing compressed fonts and vector artwork data | Deterministic Deployment | Scheduled Genesis |
| **CertificateRevenueVault** | `CertificateRevenueVault.sol` | Ownerless royalty receiver; wraps ERC-2981 5% royalty proceeds into WBNB and forwards 100% to The Belly | Deterministic Deployment | Scheduled Genesis |
| **PancakeV2TwapOracle** | `PancakeV2TwapOracle.sol` | Endogenous TWAP reader evaluating time-weighted average prices for V2 pairs | Deterministic Deployment | Scheduled Genesis |
| **PancakeV3Adapter** | `PancakeV3Adapter.sol` | Production execution adapter executing multi-hop swaps across Pancake V3 pools | Deterministic Deployment | Scheduled Genesis |
| **PancakeV3TwoHopTwapOracle** | `PancakeV3TwoHopTwapOracle.sol` | Two-hop V3 TWAP oracle (WBNB -> USDT -> bStock) for equity feeds | Deterministic Deployment | Scheduled Genesis |
