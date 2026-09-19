---
layout: default
title: Risks & Launch Status
parent: Security & Governance
nav_order: 4
---

# Risks & Pre-Launch Status

Transparent disclosures regarding protocol assumptions, third-party dependencies, and current development status.

---

## 1. Protocol Pre-Launch Status

{: .warning }
TheFatCat protocol contracts are finalized in code and thoroughly verified across 78 test suites and 582 tests, but remain pre-launch on BNB Chain mainnet.

- **Target Network**: BNB Chain (Chain ID: 56).
- **Initial Launch Venue**: Flap bonding curve.
- **FEED Activation Gate**: Token trading begins first on the bonding curve. Following graduation and DEX migration, staking opens for deposits.
- **Dual 7-Day Wall-Clock Accumulation Gates**: Stakers begin climbing seniority immediately, while rewards are protected by two parallel 7-day physical locks:
  1. *Clock Gate (`LaunchIntervalController`)*: Pinned to `rewardStartAt = block.timestamp + 7 days`. Reward release calculations yield zero until this timestamp passes, ensuring fair seniority accrual.
  2. *Treasury Gate (`Belly.activationDelay`)*: The execution router's spender role requires an immutable 7-day activation delay, preventing any capital withdrawals from The Belly during launch week.
  3. Throughout these 7 days, trading taxes flow continuously into The Belly via `flush()`, accumulating deep initial reserves without early dilution.
- **Contract Addresses**: Official contract addresses will be published on the [Verified Contracts]({% link contracts.md %}) page upon deployment. Any address claiming to represent the protocol prior to official publication is illegitimate.

---

## 2. Material Risk Disclosures

### 1. Market Volume & Variable Rewards
The protocol does not generate yield out of thin air; reward capital derives strictly from secondary DEX trading volume taxes (plus unsolicited donations). During market lulls, inflows may decrease significantly. While The Belly acts as an exponential shock absorber, it cannot create artificial yield when trading stops.

### 2. External Upstream Processor Dependency
On BNB Chain, the transaction tax processor is an external contract owned by the Flap factory. Upstream changes can affect fee delivery timing and swap liquidation thresholds. The protocol operates active monitoring to mitigate this dependency.

### 3. Oracle & Slippage Delays
Market execution requires valid on-chain TWAP observations from `PancakeV2TwapOracle` and bounded slippage. In periods of extreme market turbulence, execution batches may wait until prices stabilize or settle in quote via permissionless fallback.

### 4. Real-World Asset (RWA) Issuer Risk
Non-default assets (such as tokenized US equities / bStocks) rely on institutional off-chain custody and token upgrade keys. The protocol mitigates this risk through a strict **5% probation allocation cap** and automatic fallback quote settlement.
