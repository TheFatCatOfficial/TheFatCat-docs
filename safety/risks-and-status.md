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
- **Dual 7-Day Warmup Timelock Regime**: Staking deposits climb seniority immediately, while dividend release is protected by two parallel 7-day physical timelocks:
  1. **Reward Emission Delay**: During the first 7 days, protocol reward emissions are strictly zero, ensuring all early participants accrue seniority on equal footing;
  2. **Treasury Outflow Delay**: The Belly reservoir enforces an immutable 7-day delay before allowing the execution router to withdraw any capital;
  3. **Initial Cushion Building**: Throughout launch week, trading taxes flow continuously into The Belly with zero outflows, establishing deep backing before distributions begin.
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
