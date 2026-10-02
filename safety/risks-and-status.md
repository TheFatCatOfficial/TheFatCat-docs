---
layout: default
title: Risks & Launch Status
parent: Security & Governance
nav_order: 4
---

# Risks & Operating Conditions

Transparent disclosures regarding protocol assumptions, third-party dependencies, and operating conditions.

---

## 1. Network & Opening Rules

{: .note }
This page describes the network, opening conditions and dependency boundaries. Use official contract addresses and on-chain state for interactions.

- **Target Network**: BNB Chain (Chain ID: 56).
- **Initial Launch Venue**: Flap bonding curve, paired with QQQB; reward accounting remains WBNB.
- **Staking Opening Timeline**: Trading begins on the bonding curve. Staking requires a successful `openStaking()` call: Governor-only before graduation, permissionless after graduation. That transaction starts the seven-day reward clock.
- **7-Day Warmup & Treasury Timelock Protections**:
  1. **Reward Emission Delay (Warmup Period)**: When staking is opened (calling `openStaking()` under the hood to start the clock), the protocol establishes a 7-day warmup period. During this window, diet intervals and seniority advance normally, but no rewards are emitted yet, ensuring early stakers can accumulate initial seniority on equal footing;
  2. **Treasury Outflow Delay**: The Belly reservoir's authorization for the procurement execution module is set by governance through an independent proposal and is protected by a separate 7-day delay (these two gates operate on independent clocks and are not inherently synchronized);
  3. **Initial Cushion Building**: During the initial 7-day warmup week, trading taxes flow continuously into The Belly, accumulating an initial buffer reserve before emissions commence.
- **Contract Addresses**: Use the official addresses and verified source referenced on the [Contracts]({% link contracts.md %}) page and confirm the network.

---

## 2. Material Risk Disclosures

### 1. Market Volume & Variable Rewards
The protocol does not promise or provide fixed yields; all reward funding derives strictly from secondary market trading volume taxes (plus voluntary donations). During market lulls, inflows may decrease significantly. While The Belly acts as an exponential shock absorber, it cannot create artificial yield when trading stops.

### 2. External Upstream Processor Dependency
On BNB Chain, the transaction tax processor is an external contract owned by the Flap factory system. Upstream upgrades or configuration changes can affect fee delivery timing and liquidation pacing. The QQQB Vault also uses a Beacon whose Factory exposes Guardian-only upgrade and permanent-lock functions. This upgrade authority affects upstream QQQB handling, not the fixed receiver, Belly or staking principal. The project currently trusts QQQB issuer authority; unavailable transfers or liquidity can still delay conversion. See [Monitoring and Roles]({% link safety/monitoring.md %}).

### 3. Market Volatility & Execution Delays
Procuring non-native assets relies on oracle pricing and slippage protection. During extreme market volatility or sudden liquidity drying, procurement batches may pause until prices stabilize. If swaps cannot be executed over an extended period, eligible pending amounts can be settled in native BNB.

### 4. Third-Party Tokenized Assets (bStocks) & Settlement Boundaries
Tokenized equities and similar assets are issued and custodied by third-party institutions and are not direct equity shares of the underlying companies. They carry risks of issuer default, trading halts, and regulatory restrictions. The protocol caps probation allocations at 5% per diet to reduce single-asset exposure; when an asset cannot be procured, eligible pending amounts can be settled in native BNB (this settlement remains subject to the Belly's 8-hour window velocity cap, rather than an instant full withdrawal).
