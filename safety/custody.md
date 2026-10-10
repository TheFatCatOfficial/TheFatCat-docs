---
layout: default
title: Custody & Accounting Boundaries
parent: Security & Governance
nav_order: 1
---

# Custody & Accounting Boundaries

## 1. Principal Isolation

Staked FATCAT is held in a separate principal vault, apart from Belly's reward reserves and settled rewards. It is not used for reward purchases.

During a protocol pause, the position owner can still request principal redemption without a maintainer's approval. Completion still requires an available chain, successful position checks and a successful FATCAT transfer. Exiting forfeits the currently open meal's share, while historical reward entitlements remain claimable. See [Emergency Exit]({% link guides/emergency-exit.md %}).

## 2. Administrative Fund Access

The core principal, reward-reserve and allocation contracts have no administrative sweep or rescue withdrawal entry points. Belly's reward outflows are subject to an eight-hour window allowance; settled rewards are paid according to position entitlements.

This boundary does not cover every upstream revenue step. **The upstream QQQB revenue vault can be upgraded until permanently locked, and an authorized Flap role can transfer tax proceeds held at the revenue-receiving stage in an emergency.** These funds are not users' staked FATCAT principal, but these permissions can affect future reward revenue.

The upstream service can also submit staking, redemption, diet changes and claims on a user's behalf. Upgrades may change that delegated behavior, so its influence extends beyond tax processing. Ordinary redemption and claims still pay the position owner; new staking requires sufficient balance and valid authorization. Verify the official deployment record and review the actions and allowances shown in your wallet.

## 3. Settled Rewards and Rounding

Rewards depend on the assets actually received for a batch, eligible shares and downward rounding. Recorded claimable rewards should retain their funding; they cannot be treated as available for redistribution merely because a user has not collected them.

Multiple rounding stages and smaller-range claims may leave small residual balances. These have no administrative withdrawal or automatic recycling path. Internal tests check accounting and received amounts against the relevant conditions; they do not prove that every token behavior or execution path is safe. See [Testing & Validation]({% link safety/audits-and-hardening.md %}).
