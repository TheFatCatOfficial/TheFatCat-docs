---
layout: default
title: Verified Contracts
nav_order: 8
has_children: true
---

# Verified Contracts Schedule

TheFatCat contract components, responsibilities and deployment boundaries on BNB Chain. Verify official published addresses and BscScan source before interacting.

---

## Architectural Breakdown

Explore detailed specifications for each contract subsystem:

- **[Core Vault Contracts]({% link contracts/core-vaults.md %})**: StakingVault (principal isolation & unpausable redemptions), The Belly (unprivileged damping reservoir), and FatCatStakingVault (Flap V3 tax routing and fee division).
- **[Routers & Oracles]({% link contracts/routers-and-oracles.md %})**: ExecutionRouter (MEV-guarded permanent-spender router), PancakeV3TwoHopTwapOracle / PancakeV2TwapOracle (endogenous price checks), and InitialRewardAssetRegistry.
- **[Seniority Ledger & Math]({% link contracts/seniority-ledger.md %})**: SeniorityLedger ($O(1)$ scalar weight accounting), RewardDistributor (dual-liability solvency engine), and on-chain SeniorityCertificate renderers.

---

## Master Protocol Registry

{: .note }
**Address verification**: This component index does not replace an address manifest. Contract names are not recipient addresses; check the official network, address and verified source.

| Component | Source Contract | Architectural Scope & Role | Deployment Standard | Deployment / Activation Boundary |
|:---|:---|:---|:---|:---|
| **FATCAT Token** | `FATCAT.sol` | 1,000,000,000 fixed supply, zero presale, immutable BEP-20 implementation | Flap Bonding Factory | Flap launch |
| **PancakeSwap V2 Pair** | `PancakePair` | Liquidity pool pair (`FATCAT/QQQB`), cumulative TWAP price feed source | PancakeFactory | Upon Graduation |
| **FatCatStakingVault** | `FatCatStakingVault.sol` | Fixed BNB receiver; wraps post-bounty net proceeds: 85% Belly treasury, 15% project development, operations and marketing | ERC-1167 fixed clone | Core wiring |
| **FatCatQqqbVault** | `FatCatQqqbVault.sol` | QQQB receipt and fixed conversion into BNB receiver | Flap V3 BeaconProxy | Core wiring |
| **FatCatQqqbVaultFactory** | `FatCatQqqbVaultFactory.sol` | Creates vaults and owns Beacon; Guardian-only upgrade/lock entrypoints | Flap FactoryBaseV2 | Core wiring |
| **FatCatMaintenanceRewards** | `FatCatMaintenanceRewards.sol` | Per-Vault, non-upgradeable custody and claiming for qualifying FEED conversion bounties | Factory-created module | Core wiring |
| **ProtocolExecutor** | `ProtocolExecutor.sol` | Public one-tx attempt: QQQB conversion, one due advance and the cursor-assigned reward purchase batch | Standalone contract | Core wiring |
| **The Belly** | `Belly.sol` | Exponential damping reservoir; window outflow cap $\le 16/168$, write-once spender | Deterministic Deployment | Core deployment |
| **StakingVault** | `StakingVault.sol` | Custodies staked principal; unpausable `redeem()`, 100k FATCAT floor, certificate link | Deterministic Deployment | Core deployment |
| **SeniorityLedger** | `SeniorityLedger.sol` | $O(1)$ scalar weight accounting, 22-slot graduation ring, RAY prefix engine | Deterministic Deployment | Core deployment |
| **LaunchIntervalController** | `LaunchIntervalController.sol` | Production clock engine ($\ge 8\text{h}$ cadence), 7-day wall-clock accumulation period | Deterministic Deployment | Core deployment |
| **InitialRewardAssetRegistry** | `InitialRewardAssetRegistry.sol` | Production MENU whitelist with signed constructor menu exempt from probation | Deterministic Deployment | Core deployment |
| **ExecutionRouter** | `ExecutionRouter.sol` | Permanent write-once router, TWAP-guarded batch market swaps & fallback | Deterministic Deployment | Core deployment |
| **RewardDistributor** | `RewardDistributor.sol` | Dual-liability accounting, non-negative dust solvency custody | Deterministic Deployment | Core deployment |
| **SeniorityCertificate** | `SeniorityCertificate.sol` | On-chain seniority credential (ERC-721); minted via FATCAT burn upon exit, with 5% ERC-2981 royalty signaling; actual BNB/WBNB payments can be flushed to Belly | Deterministic Deployment | Separate certificate activation |
| **CertificateRenderer** | `SeniorityCertificateRenderer.sol` | Pure on-chain SVG generator rendering dynamic visual attributes | Deterministic Deployment | Separate certificate activation |
| **CertificateData** | `CertificateData.sol` | Bytecode container storing compressed fonts and vector artwork data | Deterministic Deployment | Separate certificate activation |
| **CertificateRevenueVault** | `CertificateRevenueVault.sol` | Ownerless royalty receiver; flushes actual BNB/WBNB royalty payments to The Belly; ERC-2981 signals 5%, subject to marketplace payment | Deterministic Deployment | Separate certificate activation |
| **PancakeV2TwapOracle** | `PancakeV2TwapOracle.sol` | Endogenous TWAP reader evaluating time-weighted average prices for V2 pairs | Deterministic Deployment | Core deployment |
| **PancakeV3Adapter** | `PancakeV3Adapter.sol` | Production execution adapter executing multi-hop swaps across Pancake V3 pools | Deterministic Deployment | Core deployment |
| **PancakeV3TwoHopTwapOracle** | `PancakeV3TwoHopTwapOracle.sol` | Two-hop V3 TWAP oracle (WBNB -> USDT -> bStock) for equity feeds | Deterministic Deployment | Core deployment |
