---
title: Risks & Launch Status
parent: Security & Governance
nav_order: 4
---

# Risks & Pre-Launch Status

Transparent disclosures regarding protocol assumptions, third-party dependencies, and current development status.

---

## 1. Protocol Pre-Launch Status

{: .warning }
TheFatCat protocol contracts are finalized in code and thoroughly verified across 74 test suites and 538 tests, but remain pre-launch on BNB Chain mainnet.

- **Target Network**: BNB Chain (Chain ID: 56).
- **Initial Launch Venue**: Flap bonding curve.
- **FEED Activation Gate**: Trading begins first; staking (FEED) opens only after live route verification, TWAP warm-up, and end-to-end dry runs.
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
