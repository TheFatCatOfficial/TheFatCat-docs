---
layout: default
title: Diets & Claiming Rewards
parent: User Guides
nav_order: 2
---

# Diets & Claiming Rewards

How to choose your preferred reward assets (Diets), manage allocations across market regimes, and claim earned tokens with automated native unwrapping.

---

## 1. What is a Diet?

In TheFatCat, you are not forced into a single, uniform reward token. Instead, each position independently designates a **Diet Asset** from the protocol's approved [MENU]({% link protocol/execution.md %}):

- **BNB (Canonical Network Asset)**: The default diet and protocol fallback asset (internally accounted via canonical WBNB). It requires zero market execution and carries zero counterparty or issuer risk. Stakers can receive native BNB directly with no manual unwrapping.
- **bStocks (Tokenized Equities)**: Real-world asset backed tokens (e.g. tokenized Tesla, Apple, or S&P 500 ETFs) under a 5% observation cap.
- **FATCAT (Protocol Native)**: Eligible for addition after AMM graduation, liquidity stabilization, and TWAP oracle warmup.

{: .tip }
Because each stake is an independent position ID, a single wallet can manage multiple positions with completely different diets (e.g. Position #1 earning BNB, Position #2 earning tokenized equities).

---

## 2. Changing Your Diet

You can change your position's diet at any time:

```solidity
function setDiet(uint256 positionId, address newAsset) external;
```

### Critical Diet Rules:
1. **Zero Seniority Penalty**: Changing your diet **never resets or reduces your seniority notch**. Your accumulated ladder level ($c_i$) is 100% preserved.
2. **Next-Interval Activation**: The new diet choice takes effect at the **next meal boundary** ($m + 1$). The currently open meal continues allocating to your previous asset.
3. **No Loss of Past Rewards**: Unclaimed tokens earned under your previous diet remain permanently claimable in the `RewardDistributor`. They are never wiped or overwritten.

---

## 3. Claiming Earned Rewards

Rewards in TheFatCat do not expire. They accumulate across execution batches and wait in the non-custodial [`RewardDistributor`]({% link contracts.md %}).

### Single / Multi-Batch Claim
To claim realized reward tokens:

```solidity
function claim(
    uint256 positionId,
    address asset,
    uint256 maxBatches
) external returns (uint256 tokensClaimed);
```

- `asset`: The address of the reward token you wish to claim.
- `maxBatches`: The maximum number of finalized batches to settle in this transaction. Passing `0` processes all available batches up to the protocol block limit.

### Claiming Native BNB (`claimNative`)
When your diet is BNB (held as canonical WBNB in the vault), you do not need to perform a separate manual unwrapping transaction. The protocol provides a built-in convenience function:

```solidity
function claimNative(
    uint256 positionId,
    uint256 maxBatches
) external returns (uint256 nativeBnbClaimed);
```

`claimNative()` automatically unwraps the WBNB in the contract and transfers native BNB directly to your wallet in a single atomic transaction.

### Bounded Claims (`claimThrough`) for Long Absences
If you leave a position untouched for months or years, hundreds of execution batches may accrue. To prevent a transaction from exceeding the block gas limit, you can safely claim rewards in chunks using:

```solidity
function claimThrough(
    uint256 positionId,
    address asset,
    uint256 targetBatchId
) external returns (uint256 tokensClaimed);
```

This ensures guaranteed settlement regardless of how large the historical backlog becomes.
