---
layout: default
title: Core Vault Contracts
parent: Verified Contracts
nav_order: 1
---

# Core Protocol Vault Contracts

The core storage and capital custody layers of TheFatCat enforce strict contract-level separation between principal capital and reward distributions:

---

## 1. StakingVault (`StakingVault.sol`)

- **Architectural Role**: Holds 100% of user-staked FATCAT tokens.
- **Key Invariants**:
  - **Zero Tax Inflow**: No trading tax or DEX swap funds ever enter this contract.
  - **100,000 FATCAT Floor**: Positions below the threshold are rejected, preventing dust griefing.
  - **Unpausable Redemptions**: The `redeem()` function deliberately ignores contract emergency pause flags. Users can always withdraw their capital regardless of protocol status.
  - **Zero Sweep Privilege**: Does not contain `sweepToken()`, `emergencyWithdraw()`, or any administrative backdoors.

---

## 2. The Belly Reservoir (`Belly.sol`)

- **Architectural Role**: Custodies quote assets (WBNB) generated from DEX trading taxes.
- **Key Invariants**:
  - **Unprivileged Shock Absorber**: No administrator can arbitrarily withdraw or alter funds.
  - **7-Window Outflow Throttle**: In any single 8-hour window, cumulative outflows are strictly capped at:
    $$\text{Window Cap} = \text{Balance} \times \frac{16}{168} \approx 9.5238\%$$
    Draining 50% of the reservoir requires at least 7 discrete intervals (48–56 hours), ensuring sufficient time for emergency response.
  - **Authorized Spender Outflows**: Outflows can only leave The Belly via `release(amount)`, callable exclusively by the single write-once authorized `spender` ([`ExecutionRouter`]({% link contracts.md %})). `IntervalController.advance()` calls `Belly.sync()` to recognize balances and records allocation quotas. It cannot call `release()` to withdraw funds; the Router does that during execution or fallback.

---

## 3. QQQB Revenue Infrastructure

- **`FatCatQqqbVaultFactory`**: The Flap entry Factory receives a separately deployed upstream implementation, creates the Beacon and QQQB Vault proxies, and deploys a fixed downstream BNB receiver. It declares QQQB as the launch quote; Belly and the reward core are independently deployed contracts, not aliases for the Factory address.
- **`FatCatQqqbVault`**: Receives protocol QQQB, executes the fixed QQQB → USDT → WBNB path with on-chain price, amount and capacity checks, and forwards conversion proceeds to the configured receiver. Public callers do not supply or approve their own QQQB and cannot redirect the proceeds. The initial single-conversion range is 0.1–50 QQQB, with no hourly or daily cumulative quota. Governor and Flap Guardian may change the per-swap maximum via `setConversionLimit(newLimit)`; its minimum setting of 10 QQQB is a floor for the maximum, not the minimum conversion amount. Changing the per-swap maximum does not introduce a cumulative quota. Revenue conversion uses a one-hour TWAP and a 300 bps deviation bound, separate from reward procurement's initial 200 bps bound.
- **`FatCatMaintenanceRewards`**: Holds the `floor(gross WBNB / 38)` bounty (nominally targeting 0.1% of represented trade value) earned by an eligible FEED caller after successful conversion until that caller claims it. Later advancement or purchase failures do not cancel that conversion's bounty. This per-Vault module is not upgraded through the Beacon.
- **`FatCatStakingVault`**: The fixed-implementation BNB receiver processes the conversion output in the same transaction. Its `flush()` wraps the remaining BNB into WBNB and allocates 85% to the Belly reward treasury and 15% to the Ops Safe for project development, operations and marketing; the exact contract shares are 17/20 and 3/20. Integer dust stays with Belly. It performs the only operations split; neither this receiver nor the reward core is upgraded through the upstream Beacon.

### Beacon Ownership and Upgrade Authority

The Factory owns the Beacon, but only the canonical Flap Guardian can call Factory `upgradeVaultImplementation(address)` or `lockVaultUpgrades()`. `beaconImplementation()` reports the current implementation; `isVaultUpgradesLocked()` reports whether upgrades were permanently disabled. The deployer and project multisig have no upgrade authority through these entrypoints.

Deployment leaves upgrades available. **Calling the permanent lock is irreversible.** Until locked, a Guardian upgrade can change the behavior of every upstream QQQB Vault under this Factory, including how unconverted assets are handled. It cannot upgrade the fixed receiver, Belly or staking principal contracts. An upgrade does not undo executed transactions or guarantee repair of changed storage. See [Monitoring and Pause Scope]({% link safety/monitoring.md %}).
