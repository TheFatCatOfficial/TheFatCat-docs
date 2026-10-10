---
layout: default
title: Procurement & Claims Pipeline
parent: System Topology
nav_order: 3
---

# Procurement and Reward Claims

## 1. Record a Meal Allocation

At a meal's close, the protocol determines each diet's budget from eligible weights. Funds remain in Belly until a purchase or fallback payment completes. A meal with no eligible participants reserves no new funds; historical rewards remain unaffected.

## 2. Settle a Diet's Share

Each step handles **one diet's complete allocation from one meal**. The earliest meal with pending shares has priority; diets within it can settle separately, while later meals must wait.

Market purchases must satisfy price-reference, liquidity and minimum-output requirements. A BNB diet requires no purchase of another token. Shared purchases avoid a separate swap for each user, but execution-price and MEV risks remain.

Eligible shares can settle in WBNB instead of the selected asset. Purchases and fallback funding both use Belly's window allowance. See [execution and fallback conditions]({% link protocol/execution.md %}).

## 3. Confirm Settled Rewards

Assets actually received are recorded by batch and determine each position's claimable quantity. Pending budgets and settled rewards are separate stages; an allocation shown on the page does not mean it is already available to claim.

## 4. Claim to Your Wallet

Position owners can claim settled rewards through the website. Rewards have no protocol expiry, and claims do not use Belly's window allowance. Asset availability and transfer success still depend on token behavior and issuer risks.

A BNB claim can unwrap WBNB in the same transaction and deliver native BNB directly. Long unclaimed histories may need smaller-range claims. See [Diets & Claiming]({% link guides/diets-and-claiming.md %}); when the website is unavailable, follow [Emergency Exit]({% link guides/emergency-exit.md %}).
