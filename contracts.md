---
layout: default
title: Verified Contracts
nav_order: 7
---

# Verified Contracts Schedule

Official smart contract registry for TheFatCat protocol on BNB Chain. Addresses and BscScan links will be populated upon mainnet deployment.

---

## Core Protocol Contracts Matrix

| Component | Network | Role & Architectural Description | Deployment Address | Status |
|:---|:---|:---|:---|:---|
| **FATCAT Token** | BNB Chain | 1,000,000,000 fixed supply, zero presale, immutable implementation | `0x...` | Pre-Launch |
| **PancakeSwap V2 Pair** | BNB Chain | Liquidity pool pair, cumulative price feed source | `0x...` | Pending Graduation |
| **Forwarding Vault** | BNB Chain | Receives liquidated WBNB; splits 5/36 to Protocol Operations & 31/36 to Belly | `0x...` | Pre-Launch |
| **The Belly** | BNB Chain | Exponential damping reservoir; window-capped outflow, zero sweep | `0x...` | Pre-Launch |
| **StakingVault** | BNB Chain | Custodies staked principal; unpausable `redeem()`, 100k FATCAT floor | `0x...` | Pre-Launch |
| **SeniorityLedger** | BNB Chain | $O(1)$ scalar weight accounting, 22-slot graduation ring, RAY prefix accumulators | `0x...` | Pre-Launch |
| **IntervalController** | BNB Chain | Permissionless clock engine ($\ge 8\text{h}$ cadence), locks open meal weights | `0x...` | Pre-Launch |
| **RewardAssetRegistry** | BNB Chain | Authoritative MENU whitelist and 5% probation cap controller | `0x...` | Pre-Launch |
| **ExecutionRouter** | BNB Chain | Timelocked single-activation router, TWAP-guarded batch market swaps | `0x...` | Pre-Launch |
| **RewardDistributor** | BNB Chain | Dual-liability accounting, non-negative dust solvency custody | `0x...` | Pre-Launch |
| **SeniorityCertificate (ERC-721)** | BNB Chain | Exit credential; burn 100k FATCAT to mint, 100% on-chain SVG | `0x...` | Pre-Launch |
| **CertificateRenderer** | BNB Chain | Pure on-chain SVG generator for Seniority Certificates | `0x...` | Pre-Launch |
| **PancakeV2TwapOracle** | BNB Chain | Endogenous TWAP reader evaluating time-weighted average prices | `0x...` | Pre-Launch |

---

## Bytecode & Verification Guidelines

{: .note }
All deployed contracts are compiled via standard Foundry toolchains with strict deterministic compilation parameters. Source code will be fully verified on [BscScan](https://bscscan.com) upon contract deployment.
