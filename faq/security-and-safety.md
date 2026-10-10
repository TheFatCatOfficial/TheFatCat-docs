---
layout: default
title: Security & Custody FAQ
parent: FAQ & Limitations
nav_order: 4
---

# Security & Custody FAQ

## 1. What if the website goes offline?

Principal is held by the staking contract, not the website. Verify the official deployed address and source, then follow [Emergency Exit]({% link guides/emergency-exit.md %}) to redeem principal or claim settled rewards through a compatible wallet or block explorer.

## 2. Does an emergency pause freeze my principal?

Ordinary principal redemption remains available during a protocol pause without a maintainer's approval. Position checks, accounting and the FATCAT transfer must still succeed. Exiting forfeits the currently open meal's share, while historical reward entitlements remain recorded.

## 3. Can administrators withdraw protocol funds?

The core principal and reward contracts have no administrative sweep or rescue withdrawal entry points. Upstream tax proceeds have different permissions: the revenue vault can be upgraded until permanently locked, and an authorized Flap role can transfer some upstream revenue in an emergency. These funds are not users' staked FATCAT principal, but changes can still affect reward funding.

Upgrades can also change the upstream delegated-operation service. Ordinary redemption and reward payments still go to the position owner; new staking requires the user's balance and valid authorization. See [Custody & Accounting Boundaries]({% link safety/custody.md %}).

## 4. How can emergency measures affect use?

During an incident, the protocol can pause some operations, restrict affected assets or adjust execution conditions. This may delay new staking, reward purchases and settlement. Completed transactions are not reversed, and recovery is not guaranteed to be immediate.

Some pending rewards may settle in WBNB instead. Review position records and completed settlement for seniority, historical entitlements and actual claimable amounts. Upstream platform permissions are separate from the project's own emergency permissions. See [Risks & Operating Conditions]({% link safety/risks-and-status.md %}).
